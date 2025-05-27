import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { toggleLayer } from "../../redux/slices/timelineSlice";
import { animateLayer } from "../../utils/LayerAnimation";
import {
  addKeyframe,
  setIsPlaying,
  setSelectedLayer,
  updateLayer,
} from "../../redux/slices/animationSlice";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export function parseTransform(transform: string): {
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
} {
  if (!transform || transform === "none") {
    return { translateX: 0, translateY: 0, scale: 1, rotate: 0 };
  }

  const result = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
  };

  // Extract translate
  const translateMatch = transform.match(/translate\(([^)]+)\)/);
  if (translateMatch) {
    const parts = translateMatch[1].split(",").map((p) => parseFloat(p.trim()));
    result.translateX = parts[0] || 0;
    result.translateY = parts[1] || 0;
  }

  // Extract scale
  const scaleMatch = transform.match(/scale\(([^)]+)\)/);
  if (scaleMatch) {
    result.scale = parseFloat(scaleMatch[1]) || 1;
  }

  // Extract rotate
  const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
  if (rotateMatch) {
    result.rotate = parseFloat(rotateMatch[1]) || 0;
  }

  return result;
}

const Canvas = () => {
  const dispatch = useAppDispatch();
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const { isPlaying, currentPosition } = useAppSelector(
    (state) => state.animation
  );
  const canvasRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [originalStyle, setOriginalStyle] = useState<any>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [originalMousePos, setOriginalMousePos] = useState<Position>({
    x: 0,
    y: 0,
  });

  // Animation effects (keep your existing useEffect hooks)
  useEffect(() => {
    if (!isPlaying) {
      layers.forEach((layer) => {
        const el = layerRef.current[layer.id];
        if (el && layer.visible) {
          animateLayer(el, layer, Math.round(currentPosition));
        }
      });
    }
  }, [currentPosition, layers, isPlaying]);

  // Playback loop effect
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      layers.forEach((layer) => {
        const el = layerRef.current[layer.id];
        if (!el || !layer.visible) return;

        const layerDuration = layer.config?.duration || 1;
        const iterations =
          layer.config?.iterationCount === "infinite"
            ? Infinity
            : parseInt(layer.config?.iterationCount || "1");

        const totalDuration = layerDuration * iterations;
        const baseTime = (currentPosition / 100) * layerDuration;
        const elapsed = (timestamp - startTime!) / 1000 + baseTime;

        const localElapsed = Math.min(elapsed, totalDuration);
        const iterationIndex = Math.floor(localElapsed / layerDuration);
        const progress = (localElapsed % layerDuration) / layerDuration;
        const percentTime = progress * 100;

        if (iterationIndex < iterations) {
          animateLayer(el, layer, percentTime);
        }
      });

      animationFrameId = requestAnimationFrame(step);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(step);
    }

    console.log("Is playing:", isPlaying);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, layers, currentPosition]);

  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    if (layerId !== selectedLayerId) {
      dispatch(setIsPlaying(false));
      dispatch(setSelectedLayer(layerId));
      return;
    }

    const target = e.target as HTMLElement;
    if (target.classList.contains(styles.cornerTopLeft)) {
      startResizing("top-left", e, layerId);
    } else if (target.classList.contains(styles.cornerTopRight)) {
      startResizing("top-right", e, layerId);
    } else if (target.classList.contains(styles.cornerBottomLeft)) {
      startResizing("bottom-left", e, layerId);
    } else if (target.classList.contains(styles.cornerBottomRight)) {
      startResizing("bottom-right", e, layerId);
    } else {
      startDragging(e, layerId);
    }
  };

  const startDragging = (e: React.MouseEvent, layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });

    const { translateX, translateY } = parseTransform(
      layer.style?.transform || ""
    );

    setOriginalStyle({
      x: translateX,
      y: translateY,
    });

    e.preventDefault();
    e.stopPropagation();
  };

  const startResizing = (
    direction: string,
    e: React.MouseEvent,
    layerId: string
  ) => {
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;

    setIsResizing(true);
    setResizeDirection(direction);
    setOriginalMousePos({ x: e.clientX, y: e.clientY });
    setOriginalSize({
      width: parseInt(layer.style?.width),
      height: parseInt(layer.style?.height),
    });

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!selectedLayerId) return;

      const selectedLayer = layers.find((l) => l.id === selectedLayerId);
      if (!selectedLayer) return;

      if (isDragging) {
        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;

        const newX = originalStyle.x + deltaX;
        const newY = originalStyle.y + deltaY;

        const newStyle = {
          ...selectedLayer.style,
          transform: `translate(${newX}px, ${newY}px)`,
        };

        dispatch(
          updateLayer({
            id: selectedLayerId,
            updates: { style: newStyle },
          })
        );
      } else if (isResizing) {
        const deltaX = e.clientX - originalMousePos.x;
        const deltaY = e.clientY - originalMousePos.y;

        let newWidth = originalSize.width;
        let newHeight = originalSize.height;

        switch (resizeDirection) {
          case "top-left":
            newWidth = Math.max(20, originalSize.width - deltaX);
            newHeight = Math.max(20, originalSize.height - deltaY);
            break;
          case "top-right":
            newWidth = Math.max(20, originalSize.width + deltaX);
            newHeight = Math.max(20, originalSize.height - deltaY);
            break;
          case "bottom-left":
            newWidth = Math.max(20, originalSize.width - deltaX);
            newHeight = Math.max(20, originalSize.height + deltaY);
            break;
          case "bottom-right":
            newWidth = Math.max(20, originalSize.width + deltaX);
            newHeight = Math.max(20, originalSize.height + deltaY);
            break;
        }

        const newStyle = {
          ...selectedLayer.style,
          width: `${newWidth}px`,
          height: `${newHeight}px`,
        };

        dispatch(
          updateLayer({
            id: selectedLayerId,
            updates: { style: newStyle },
          })
        );
      }
    },
    [
      isDragging,
      isResizing,
      selectedLayerId,
      layers,
      originalStyle,
      originalSize,
      resizeDirection,
      dragStartPos,
      originalMousePos,
      dispatch,
    ]
  );

  // In Canvas.tsx, modify the handleMouseUp function
  const handleMouseUp = useCallback(() => {
    if ((isDragging || isResizing) && selectedLayerId) {
      const selectedLayer = layers.find((l) => l.id === selectedLayerId);
      if (selectedLayer) {
        const el = layerRef.current[selectedLayerId];
        if (el) {
          const computedStyle = window.getComputedStyle(el);

          if (isDragging) {
            const { translateX, translateY } = parseTransform(
              computedStyle.transform
            );

            const newStyle = {
              ...selectedLayer.style,
            };
            dispatch(
              updateLayer({ id: selectedLayerId, updates: { style: newStyle } })
            );

            dispatch(
              addKeyframe({
                layerId: selectedLayerId,
                percentage: currentPosition,
                groupName: "position",
                propertyName: "transform",
                value: `translate(${translateX}px, ${translateY}px)`,
              })
            );
          }

          if (isResizing) {
            const newStyle = {
              ...selectedLayer.style,
              width: computedStyle.width,
              height: computedStyle.height,
            };

            dispatch(
              updateLayer({ id: selectedLayerId, updates: { style: newStyle } })
            );

            dispatch(
              addKeyframe({
                layerId: selectedLayerId,
                percentage: currentPosition,
                groupName: "size",
                propertyName: "width",
                value: computedStyle.width,
              })
            );
            dispatch(
              addKeyframe({
                layerId: selectedLayerId,
                percentage: currentPosition,
                groupName: "size",
                propertyName: "height",
                value: computedStyle.height,
              })
            );
          }
        }
      }
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  }, [
    isDragging,
    isResizing,
    selectedLayerId,
    layers,
    currentPosition,
    dispatch,
  ]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (selectedLayerId) {
      const selectedLayer = layers.find((l) => l.id === selectedLayerId);
      console.log("Selected Layer style:", selectedLayer?.style);
    }
  }, [layers, selectedLayerId]);

  return (
    <div className={styles.canvasContainer} ref={canvasRef}>
      <div className={styles.grid}></div>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          if (layer.type === "code") {
            if (layer.parentId) return null;

            const renderLayerTree = (parentLayer: any): any => {
              const temp = document.createElement("div");
              temp.innerHTML = parentLayer.customHtml || "";
              const el = temp.firstElementChild;
              if (!el) return null;
              const tag = parentLayer.tag;
              const children = layers
                .filter((l) => l.parentId === parentLayer.id)
                .map((childLayer) => renderLayerTree(childLayer));
              const textContent =
                el.childElementCount === 0 ? el.textContent?.trim() : null;

              // Check if this layer is selected (to show resize handles)
              const isSelected = parentLayer.id === selectedLayerId;

              return React.createElement(
                tag,
                {
                  key: el.id,
                  "data-layer-id": parentLayer.id,
                  ref: (ref: any) => {
                    if (ref) layerRef.current[parentLayer.id] = ref;
                  },
                  id: el.id,
                  className: `${styles.layer} ${
                    isSelected ? styles.selected : ""
                  }`,
                  style: {
                    visibility: parentLayer.visible ? "visible" : "hidden",
                    ...parentLayer.style,
                    cursor: isSelected ? "move" : "default",
                  },
                  onClick: () => {
                    dispatch(toggleLayer(parentLayer.id));
                    dispatch(setSelectedLayer(parentLayer.id));
                  },
                  onMouseDown: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleMouseDown(e, parentLayer.id);
                  },
                },
                <>
                  {children.length > 0 ? children : textContent}
                  {isSelected && (
                    <>
                      <div
                        className={styles.cornerTopLeft}
                        onMouseDown={(e) => handleMouseDown(e, parentLayer.id)}
                      />
                      <div
                        className={styles.cornerTopRight}
                        onMouseDown={(e) => handleMouseDown(e, parentLayer.id)}
                      />
                      <div
                        className={styles.cornerBottomLeft}
                        onMouseDown={(e) => handleMouseDown(e, parentLayer.id)}
                      />
                      <div
                        className={styles.cornerBottomRight}
                        onMouseDown={(e) => handleMouseDown(e, parentLayer.id)}
                      />
                    </>
                  )}
                </>
              );
            };

            return renderLayerTree(layer);
          } else {
            return (
              <div
                key={layer.id}
                data-layer-id={layer.id}
                ref={(el) => {
                  if (el) layerRef.current[layer.id] = el;
                }}
                onMouseDown={(e) => handleMouseDown(e, layer.id)}
                onClick={() => {
                  dispatch(toggleLayer(layer.id));
                  dispatch(setSelectedLayer(layer.id));
                }}
                style={{
                  ...layer.style,
                  position: "absolute",
                  visibility: layer.visible ? "visible" : "hidden",
                  animationPlayState: isPlaying ? "running" : "paused",
                  cursor: layer.id === selectedLayerId ? "move" : "default",
                }}
                className={`${styles.animatedElement} layer-${layer.id} ${
                  layer.id === selectedLayerId ? styles.selected : ""
                }`}
              >
                {layer.id === selectedLayerId && (
                  <>
                    <span
                      className={styles.cornerTopLeft}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, layer.id);
                      }}
                    ></span>
                    <span
                      className={styles.cornerTopRight}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, layer.id);
                      }}
                    ></span>
                    <span
                      className={styles.cornerBottomLeft}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, layer.id);
                      }}
                    ></span>
                    <span
                      className={styles.cornerBottomRight}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, layer.id);
                      }}
                    ></span>
                  </>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Canvas;

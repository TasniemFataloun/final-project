import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { animateLayer } from "../../utils/LayerAnimation";
import {
  addKeyframe,
  setIsPlaying,
  setSelectedLayer,
  updateLayer,
} from "../../redux/slices/animationSlice";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const { isPlaying, currentPosition } = useAppSelector(
    (state) => state.animation
  );
  const editMode = useAppSelector((state) => state.editMode.value);

  const canvasRef = useRef<HTMLDivElement>(null);

  const [dragInfo, setDragInfo] = useState<{
    type: "drag" | "resize" | null;
    startX: number;
    startY: number;
    baseTranslateX: number;
    baseTranslateY: number;
    currentTranslateX: number;
    currentTranslateY: number;
    layerId: string | null;
    styleInfo: React.CSSProperties;
    corner?: string;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    baseTranslateX: 0,
    baseTranslateY: 0,
    currentTranslateX: 0,
    currentTranslateY: 0,
    layerId: null,
    styleInfo: {},
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

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, layers, currentPosition]);

  const handleMouseDown = (
    e: React.MouseEvent,
    layerId: string,
    type: "drag" | "resize" = "drag",
    corner?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(setSelectedLayer(layerId));

    const el = layerRef.current[layerId];
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const elRect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const selectedLayer = layers.find((l) => l.id === layerId);
    if (!selectedLayer) return;
    dispatch(setIsPlaying(false));

    const computedStyle = window.getComputedStyle(el);
    const transform = computedStyle.transform;
    const matrix = new DOMMatrix(transform);

    const width =
      parseFloat(selectedLayer.style?.width as string) ||
      parseFloat(selectedLayer.style?.maxWidth as string) ||
      parseFloat(selectedLayer.style?.minWidth as string) ||
      elRect.width;
    const height =
      parseFloat(selectedLayer.style?.height as string) ||
      parseFloat(selectedLayer.style?.maxHeight as string) ||
      parseFloat(selectedLayer.style?.minHeight as string) ||
      elRect.height;

    const style = {
      width,
      height,
    };

    setDragInfo({
      type,
      startX: e.clientX - canvasRect.left,
      startY: e.clientY - canvasRect.top,
      currentTranslateX: 0,
      currentTranslateY: 0,
      baseTranslateX: matrix.m41,
      baseTranslateY: matrix.m42,
      layerId,
      styleInfo: style,
      corner,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragInfo.type || !dragInfo.layerId) return;
      if (!canvasRef.current) return;

      const {
        startX,
        startY,
        styleInfo,
        type,
        layerId,
        baseTranslateX,
        baseTranslateY,
        corner,
      } = dragInfo;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseXRelativeToCanvas = e.clientX - canvasRect.left;
      const mouseYRelativeToCanvas = e.clientY - canvasRect.top;
      const dx = mouseXRelativeToCanvas - startX;
      const dy = mouseYRelativeToCanvas - startY;

      const selectedLayer = layers.find((l) => l.id === layerId);
      if (!selectedLayer) return;
      let newStyle: Partial<React.CSSProperties> = {};

      const initWidth = styleInfo.width as number;
      const initHeight = styleInfo.height as number;

      if (type === "drag") {
        const newX = Math.round(baseTranslateX + dx);
        const newY = Math.round(baseTranslateY + dy);

        const updatedStyle = {
          ...selectedLayer.style,
          transform: `translate(${newX}px, ${newY}px)`,
        };

        if (editMode === "timeline") {
          dispatch(
            addKeyframe({
              layerId: selectedLayer.id,
              percentage: currentPosition,
              groupName: "transform",
              propertyName: "translateX",
              value: `${newX}`,
            })
          );
          dispatch(
            addKeyframe({
              layerId: selectedLayer.id,
              percentage: currentPosition,
              groupName: "transform",
              propertyName: "translateY",
              value: `${newY}`,
            })
          );
        } else {
          dispatch(
            updateLayer({
              id: dragInfo.layerId,
              updates: { style: updatedStyle },
            })
          );
        }
      } else if (type === "resize") {
        if (corner?.includes("Right")) {
          newStyle.width = initWidth + dx;
        }
        if (corner?.includes("Left")) {
          newStyle.width = initWidth - dx;
        }
        if (corner?.includes("Bottom")) {
          newStyle.height = initHeight + dy;
        }
        if (corner?.includes("Top")) {
          newStyle.height = initHeight - dy;
        }

        const updatedStyle = {
          ...selectedLayer.style,
          width: `${newStyle.width}px`,
          height: `${newStyle.height}px`,
        };

        // Always update the layer's style
        dispatch(
          updateLayer({
            id: dragInfo.layerId,
            updates: { style: updatedStyle },
          })
        );

        // Only add keyframes in timeline mode
        if (editMode === "timeline") {
          dispatch(
            addKeyframe({
              layerId: selectedLayer.id,
              percentage: currentPosition,
              groupName: "size",
              propertyName: "width",
              value: `${newStyle.width}`,
            })
          );
          dispatch(
            addKeyframe({
              layerId: selectedLayer.id,
              percentage: currentPosition,
              groupName: "size",
              propertyName: "height",
              value: `${newStyle.height}`,
            })
          );
        }
      }
    },
    [dragInfo, canvasRef, layers, dispatch, editMode, currentPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (dragInfo.type && dragInfo.layerId) {
      if (!selectedLayerId) return;

      setDragInfo({} as any);
    }
  }, [dragInfo]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      //dispatch(setSelectedLayer(null));
      setDragInfo({} as any);
    }
  };

  return (
    <div className={styles.canvasContainer} ref={canvasRef}>
      <div className={styles.grid}></div>
      <div
        className={styles.animatedElementContainer}
        onClick={handleCanvasClick}
      >
        {layers.map((layer) => {
          if (layer.type === "code") {
            if (layer.parentId) return null;

            const renderLayerTree = (parentLayer: any): any => {
              const temp = document.createElement("div");
              temp.innerHTML = parentLayer.customHtml || "";
              const el = temp.firstElementChild;
              if (!el) return null;
              const tag = parentLayer.tag === "p" ? "h5" : parentLayer.tag;
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
                    /* dispatch(toggleLayer(parentLayer.id)); */
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
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "TopLeft"
                          )
                        }
                      />
                      <div
                        className={styles.cornerTopRight}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "TopRight"
                          )
                        }
                      />
                      <div
                        className={styles.cornerBottomLeft}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "BottomLeft"
                          )
                        }
                      />
                      <div
                        className={styles.cornerBottomRight}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "BottomRight"
                          )
                        }
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
                  /* dispatch(toggleLayer(layer.id)); */
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
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "TopLeft")
                      }
                    ></span>
                    <span
                      className={styles.cornerTopRight}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "TopRight")
                      }
                    ></span>
                    <span
                      className={styles.cornerBottomLeft}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "BottomLeft")
                      }
                    ></span>
                    <span
                      className={styles.cornerBottomRight}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "BottomRight")
                      }
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

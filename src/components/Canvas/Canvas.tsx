import React, { useEffect, useRef, useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { animateLayer } from "../../utils/LayerAnimation";
import {
  addKeyframe,
  removeLayer,
  setIsPlaying,
  setSelectedLayer,
  updateKeyframe,
  updateLayer,
} from "../../redux/slices/animationSlice";
import { defaultConfig } from "../../config/PropertiesMenu.config";
import { ActionCreators } from "redux-undo";
const Canvas = () => {
  const dispatch = useAppDispatch();
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation.present
  );
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.present.selectedKeyframe
  );
  const { isPlaying, currentPosition } = useAppSelector(
    (state) => state.animation.present
  );
  const editMode = useAppSelector((state) => state.editMode.value);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isUndo = (e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey;
      const isRedoCtrl = e.ctrlKey && e.key === "y"; // Windows Ctrl+Y
      const isRedoMac = e.metaKey && e.key === "z" && e.shiftKey; // Mac ⌘+Shift+Z

      if (isUndo) {
        dispatch(ActionCreators.undo());
      } else if (isRedoCtrl || isRedoMac) {
        dispatch(ActionCreators.redo());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const [dragInfo, setDragInfo] = useState<{
    type: "drag" | "resize" | "rotate" | null;
    startX: number;
    startY: number;
    baseTranslateX: number;
    baseTranslateY: number;
    layerId: string | null;
    styleInfo: React.CSSProperties;
    corner?: string;
    baseRotation: number;
    centerX?: number;
    centerY?: number;
    scale: number;
    startAngle?: number;
  }>({
    type: null,
    startX: 0,
    startY: 0,
    baseTranslateX: 0,
    baseTranslateY: 0,
    scale: 1,
    baseRotation: 0,
    layerId: null,
    styleInfo: {},
  });

  // Animation effects (keep your existing useEffect hooks)
  useEffect(() => {
    if (!isPlaying && editMode === "timeline") {
      layers.forEach((layer) => {
        const el = layerRef.current[layer.id];
        if (el && layer.visible) {
          animateLayer(el, layer, Math.round(currentPosition));
        }
      });
    }
  }, [currentPosition, layers, isPlaying, editMode]);

  //easing
  const getEasingFunction = (name: string, t: number) => {
    switch (name) {
      case "ease":
      case "ease-in-out":
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case "ease-in":
        return t * t;
      case "ease-out":
        return t * (2 - t);
      case "linear":
      default:
        return t;
    }
  };

  // Playback loop effect
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      layers.forEach((layer) => {
        const el = layerRef.current[layer.id];
        if (!el || !layer.visible) return;

        const layerDuration =
          layer.config?.duration || defaultConfig.layerConfig.duration;
        const iterations =
          layer.config?.iterationCount === "infinite"
            ? Infinity
            : parseInt(
                layer.config?.iterationCount ||
                  defaultConfig.layerConfig.iterationCount
              );

        const delay = layer.config?.delay || 0; // seconds
        const timingFunction = layer.config?.timingFunction || "linear";

        const totalDuration = layerDuration * iterations;
        const baseTime = (currentPosition / 100) * layerDuration;

        const elapsedRaw = (timestamp - startTime!) / 1000 + baseTime;
        const elapsed = elapsedRaw - delay;

        if (elapsed < 0) {
          return; // Delay not reached yet
        }

        const localElapsed = Math.min(elapsed, totalDuration);
        const iterationIndex = Math.floor(localElapsed / layerDuration);
        const progress = (localElapsed % layerDuration) / layerDuration;

        // Apply easing here
        const easedProgress = getEasingFunction(timingFunction, progress);
        const percentTime = easedProgress * 100;

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
  }, [isPlaying, layers]);

  const handleMouseDown = (
    e: React.MouseEvent,
    layerId: string,
    type: "drag" | "resize" | "rotate" = "drag",
    corner?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const el = layerRef.current[layerId];
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const elRect = el.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const selectedLayer = layers.find((l) => l.id === layerId);
    if (!selectedLayer || selectedLayer.locked) return;

    dispatch(setSelectedLayer(layerId));
    dispatch(setIsPlaying(false));

    const computedStyle = window.getComputedStyle(el);
    const transform = computedStyle.transform;
    const matrix = new DOMMatrix(transform);
    const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
    const scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
    const rawScale = (scaleX + scaleY) / 2;
    const scale = parseFloat(rawScale.toFixed(2));
    const rotate = Math.round(Math.atan2(matrix.b, matrix.a) * (180 / Math.PI));

    const style = {
      width: elRect.width,
      height: elRect.height,
    };

    setDragInfo({
      type,
      startX: e.clientX - canvasRect.left,
      startY: e.clientY - canvasRect.top,
      baseTranslateX: matrix.m41,
      baseTranslateY: matrix.m42,
      scale,
      baseRotation: rotate,
      layerId,
      styleInfo: style,
      corner,
    });

    if (type === "rotate") {
      // calculate center point of the element relative to canvas
      const centerX = elRect.left - canvasRect.left + elRect.width / 2;
      const centerY = elRect.top - canvasRect.top + elRect.height / 2;

      // get current rotation from transform matrix
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

      // calculate initial angle between mouse and center
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      const startAngle =
        Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);

      setDragInfo({
        type: "rotate",
        startX: mouseX,
        startY: mouseY,
        baseTranslateX: matrix.m41,
        baseTranslateY: matrix.m42,
        layerId,
        styleInfo: style,
        baseRotation: angle,
        scale,
        centerX,
        centerY,
        startAngle,
      });
      return;
    }
  };

  const [shiftPressed, setShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPressed(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedLayerId, selectedKeyframe, dispatch]);

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
        baseRotation,
        scale,
        centerX,
        centerY,
      } = dragInfo;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dx = e.clientX - canvasRect.left - startX;
      const dy = e.clientY - canvasRect.top - startY;
      const selectedLayer = layers.find((l) => l.id === layerId);
      if (!selectedLayer) return;

      let newStyle: Partial<React.CSSProperties> = {};
      const initWidth = styleInfo.width as number;
      const initHeight = styleInfo.height as number;

      const addKayframes = (propertyName: string, value: any) => {
        const property = selectedLayer.editedPropertiesGroup?.find(
          (p) => p.propertyName === propertyName
        );

        const existingKeyframe = property?.keyframes.find(
          (kf) => kf.percentage === currentPosition
        );
        if (existingKeyframe) {
          dispatch(
            updateKeyframe({
              layerId: selectedLayer.id,
              propertyName,
              keyframe: {
                ...existingKeyframe,
                value: `${value}`,
              },
            })
          );
        } else {
          dispatch(
            addKeyframe({
              layerId: selectedLayer.id,
              propertyName,
              percentage: currentPosition,
              value: `${value}`,
            })
          );
        }
      };

      if (
        type === "rotate" &&
        centerX !== undefined &&
        centerY !== undefined &&
        dragInfo.startAngle
      ) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;

        const angle =
          Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
        const delta = angle - dragInfo.startAngle;
        let newRotation = Math.round(baseRotation + delta);

        if (shiftPressed) {
          newRotation = Math.round(newRotation / 45) * 45;
        }

        const transform = `translate(${baseTranslateX}px, ${baseTranslateY}px) rotate(${newRotation}deg) scale(${scale})`;

        const updatedStyle = {
          ...selectedLayer.style,
          transform,
        };

        if (editMode === "timeline") {
          addKayframes("rotate", newRotation);
        } else {
          dispatch(
            updateLayer({
              id: layerId,
              updates: { style: updatedStyle },
            })
          );
        }

        return;
      }

      if (type === "drag") {
        let newX = baseTranslateX + dx;
        let newY = baseTranslateY + dy;

        if (shiftPressed) {
          // Lock movement to the dominant axis (whichever has a larger delta)
          if (Math.abs(dx) > Math.abs(dy)) {
            newY = baseTranslateY; // Lock Y
          } else {
            newX = baseTranslateX; // Lock X
          }
        }

        const updatedStyle = {
          ...selectedLayer.style,
          transform: `translateX(${Math.round(newX)}px) translateY(${Math.round(
            newY
          )}px) rotate(${baseRotation}deg) scale(${scale})`,
        };

        if (editMode === "timeline") {
          addKayframes("translateX", Math.round(newX));
          addKayframes("translateY", Math.round(newY));
        }

        if (editMode !== "timeline") {
          dispatch(
            updateLayer({
              id: dragInfo.layerId,
              updates: { style: updatedStyle },
            })
          );
        }
      } else if (type === "resize") {
        let newWidth = initWidth;
        let newHeight = initHeight;
        const theta = (baseRotation * Math.PI) / 180;
        const localDX = dx * Math.cos(theta) + dy * Math.sin(theta);
        const localDY = -dx * Math.sin(theta) + dy * Math.cos(theta);

        if (corner?.includes("Right")) newWidth = initWidth + localDX;
        if (corner?.includes("Left")) newWidth = initWidth - localDX;
        if (corner?.includes("Bottom")) newHeight = initHeight + localDY;
        if (corner?.includes("Top")) newHeight = initHeight - localDY;

        if (shiftPressed) {
          // Maintain aspect ratio
          const aspectRatio = initWidth / initHeight;

          // Decide whether to scale width or height based on greater delta
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }

        newStyle.width = Math.round(newWidth);
        newStyle.height = Math.round(newHeight);
        if (editMode === "timeline") {
          addKayframes("width", newStyle.width);
          addKayframes("height", newStyle.height);
        } else {
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
      dispatch(setSelectedLayer(null));
      setDragInfo({} as any);
    }
  };

  const [isMouseInCanvas, setIsMouseInCanvas] = useState(false);

  useEffect(() => {
    const canvasElement = document.getElementById("canvas-id");

    const handleMouseEnter = () => setIsMouseInCanvas(true);
    const handleMouseLeave = () => setIsMouseInCanvas(false);

    canvasElement?.addEventListener("mouseenter", handleMouseEnter);
    canvasElement?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvasElement?.removeEventListener("mouseenter", handleMouseEnter);
      canvasElement?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Backspace" || e.key === "Delete") && isMouseInCanvas) {
        if (!selectedKeyframe?.layerId && selectedLayerId) {
          dispatch(removeLayer(selectedLayerId));
          setDragInfo({} as any);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedLayerId,
    dispatch,
    setDragInfo,
    selectedKeyframe,
    isMouseInCanvas,
  ]);

  return (
    <div
      className={styles.canvasContainer}
      ref={canvasRef}
      data-tour="canvas"
      id="canvas-id"
    >
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
                    if (!layer.locked) {
                      dispatch(setSelectedLayer(parentLayer.id));
                    }
                  },
                  onMouseDown: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!layer.locked) handleMouseDown(e, parentLayer.id);
                  },
                },
                <>
                  {children.length > 0 ? children : textContent}
                  {isSelected && !parentLayer.locked && (
                    <>
                      <div
                        className={`${styles.handle} ${styles.cornerTopLeft}`}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "TopLeft"
                          )
                        }
                      >
                        {"\u2194"}
                      </div>
                      <div
                        className={`${styles.handle} ${styles.cornerTopRight}`}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "TopRight"
                          )
                        }
                      >
                        {"\u2194"}
                      </div>
                      <div
                        className={`${styles.handle} ${styles.cornerBottomLeft}`}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "BottomLeft"
                          )
                        }
                      >
                        <span>{"\u2194"}</span>{" "}
                      </div>
                      <div
                        className={`${styles.handle} ${styles.cornerBottomRight}`}
                        onMouseDown={(e) =>
                          handleMouseDown(
                            e,
                            parentLayer.id,
                            "resize",
                            "BottomRight"
                          )
                        }
                      >
                        <span>{"\u2194"}</span>{" "}
                      </div>
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
                onMouseDown={(e) => {
                  if (!layer.locked) handleMouseDown(e, layer.id);
                }}
                onClick={() => {
                  if (!layer.locked) {
                    dispatch(setSelectedLayer(layer.id));
                  }
                }}
                style={{
                  ...layer.style,
                  visibility: layer.visible ? "visible" : "hidden",
                  cursor: layer.id === selectedLayerId ? "move" : "default",
                }}
                className={`${styles.animatedElement} layer-${layer.id} ${
                  layer.id === selectedLayerId ? styles.selected : ""
                }`}
              >
                {layer.id === selectedLayerId && !layer.locked && (
                  <>
                    <span
                      className={`${styles.handle} ${styles.cornerTopLeft}`}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "TopLeft")
                      }
                    >
                      {"\u2194"}
                    </span>
                    <span
                      className={`${styles.handle} ${styles.cornerTopRight}`}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "TopRight")
                      }
                    >
                      {"\u2194"}
                    </span>
                    <span
                      className={`${styles.handle} ${styles.cornerBottomLeft}`}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "BottomLeft")
                      }
                    >
                      {"\u2194"}
                    </span>
                    <span
                      className={`${styles.handle} ${styles.cornerBottomRight}`}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "resize", "BottomRight")
                      }
                    >
                      {"\u2194"}
                    </span>

                    <div
                      className={`${styles.handle} ${styles.rotationHandle}`}
                      onMouseDown={(e) =>
                        handleMouseDown(e, layer.id, "rotate")
                      }
                    >
                      {"\u21BB"}
                    </div>
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

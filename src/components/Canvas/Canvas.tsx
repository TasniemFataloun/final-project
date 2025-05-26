import React, { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { toggleLayer } from "../../redux/slices/timelineSlice";
import { animateLayer } from "../../utils/LayerAnimation";
import { setSelectedLayer } from "../../redux/slices/animationSlice";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const { isPlaying, currentPosition } = useAppSelector(
    (state) => state.animation
  );

  useEffect(() => {
    if (!isPlaying) {
      layers.forEach((layer) => {
        const el = layerRef.current[layer.id];
        if (el && layer.visible) {
          animateLayer(el, layer, Math.round(currentPosition));
        }
      });
    }
  }, [currentPosition, layers]);

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
            : parseInt(layer.config?.iterationCount || "infinite");

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
  }, [isPlaying, layers]);


  // Usage in your component rendering

  return (
    <div className={styles.canvasContainer}>
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
              return React.createElement(
                tag,
                {
                  key: el.id,
                  "data-layer-id": parentLayer.id,
                  ref: (ref: any) => {
                    if (ref) layerRef.current[parentLayer.id] = ref;
                  },
                  id: el.id,

                  className: styles.layer,
                  style: {
                    visibility: parentLayer.visible ? "visible" : "hidden",
                    ...parentLayer.style,
                  },
                  onClick: () => {
                    dispatch(toggleLayer(parentLayer.id));
                    dispatch(setSelectedLayer(parentLayer.id));
                  },
                },
                children.length > 0 ? children : textContent
              );
            };

            return renderLayerTree(layer);
          } else
            return (
              <div
                key={layer.id}
                data-layer-id={layer.id}
                ref={(el) => {
                  if (el) layerRef.current[layer.id] = el;
                }}
                onClick={() => {
                  dispatch(toggleLayer(layer.id));
                  dispatch(setSelectedLayer(layer.id));
                }}
                style={{
                  ...layer.style,
                  visibility: layer.visible ? "visible" : "visible",
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
                className={`${styles.animatedElement} layer-${layer.id} ${
                  layer.id === selectedLayerId ? styles.selected : ""
                }`}
              >
                {layer.id === selectedLayerId && (
                  <>
                    <span className={styles.cornerTopLeft}></span>
                    <span className={styles.cornerTopRight}></span>
                    <span className={styles.cornerBottomLeft}></span>
                    <span className={styles.cornerBottomRight}></span>
                  </>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default Canvas;


/*
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import styles from "./Canvas.module.css";
import {
  setSelectedLayer,
  updateLayer,
  addKeyframe,
} from "../../redux/slices/animationSlice";
import { animateLayer } from "../../utils/LayerAnimation";
import { Rnd, RndResizeCallback, RndDragCallback } from "react-rnd";
import { getWidthHeightFromCss } from "../HtmlCssCode/HtmlCssCode";
import { Layer } from "../../redux/types/animations.type";
import { styleConfig } from "../../types/animationType";

// === Utility functions ===
const updateTransformTranslate = (
  transform: string,
  x: number,
  y: number
): string => {
  const scale = transform.match(/scale\([^)]+\)/)?.[0] || "scale(1)";
  const rotate = transform.match(/rotate\([^)]+\)/)?.[0] || "rotate(0deg)";
  return `translateX(${x}px) translateY(${y}px) ${scale} ${rotate}`;
};

const getLayerStyle = (layer: Layer): styleConfig => ({
  ...layer?.style,
  width: layer?.style?.width || "",
  height: layer?.style?.height || "",
  backgroundColor: layer?.style?.backgroundColor ?? "",
  borderRadius: layer?.style?.borderRadius ?? "",
  opacity: layer?.style?.opacity ?? "",
  transform: layer?.style?.transform ?? "",
});

// === Custom Hooks ===
const useInjectHtmlCss = (
  layers: Layer[],
  layerRef: React.MutableRefObject<{ [id: string]: HTMLDivElement | null }>
) => {
  useEffect(() => {
    layers.forEach((layer) => {
      if (layer.type !== "code") return;

      const wrapper = layerRef.current[layer.id];
      if (!wrapper) return;
      wrapper.innerHTML = layer.customHtml || "";

      const styleId = `layer-style-${layer.id}`;
      let styleTag = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }

      styleTag.innerHTML = layer.customCss || "";
    });
  }, [layers, layerRef]);
};

const useAnimationPlayState = (
  layers: Layer[],
  isPlaying: boolean,
  layerRef: React.MutableRefObject<{ [id: string]: HTMLDivElement | null }>
) => {
  useEffect(() => {
    layers.forEach((layer) => {
      if (!layer.visible) return;
      const wrapper = layerRef.current[layer.id];
      const target =
        layer.type === "code" ? wrapper?.firstElementChild : wrapper;
      if (target instanceof HTMLElement) {
        target.style.animationPlayState = isPlaying ? "running" : "paused";
      }
    });
  }, [isPlaying, layers, layerRef]);
};

const useManualPositionUpdate = (
  layers: Layer[],
  isPlaying: boolean,
  currentPosition: number,
  layerRef: React.MutableRefObject<{ [id: string]: HTMLDivElement | null }>
) => {
  useEffect(() => {
    if (isPlaying) return;
    layers.forEach((layer) => {
      if (!layer.visible) return;
      const wrapper = layerRef.current[layer.id];
      const el = layer.type === "code" ? wrapper?.firstElementChild : wrapper;
      if (el instanceof HTMLElement) {
        animateLayer(el, layer, Math.round(currentPosition));
      }
    });
  }, [isPlaying, currentPosition, layers, layerRef]);
};

const usePlaybackLoop = (
  isPlaying: boolean,
  layers: Layer[],
  currentPosition: number,
  layerRef: React.MutableRefObject<{ [id: string]: HTMLDivElement | null }>
) => {
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      layers.forEach((layer) => {
        if (!layer.visible) return;
        const wrapper = layerRef.current[layer.id];
        const el = layer.type === "code" ? wrapper?.firstElementChild : wrapper;
        if (!(el instanceof HTMLElement)) return;

        const duration = layer.config?.duration || 1;
        const iterations =
          layer.config?.iterationCount === "infinite"
            ? Infinity
            : parseInt(layer.config?.iterationCount || "1");
        const totalDuration = duration * iterations;
        const baseTime = (currentPosition / 100) * duration;
        const elapsed = (timestamp - startTime!) / 1000 + baseTime;

        const localElapsed = Math.min(elapsed, totalDuration);
        const iterationIndex = Math.floor(localElapsed / duration);
        const progress = (localElapsed % duration) / duration;
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

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, layers, currentPosition, layerRef]);
};

// === Main Component ===
const Canvas = () => {
  const dispatch = useAppDispatch();
  const { layers, selectedLayerId, isPlaying, currentPosition } =
    useAppSelector((state) => state.animation);
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});

  useInjectHtmlCss(layers, layerRef);
  useAnimationPlayState(layers, isPlaying, layerRef);
  useManualPositionUpdate(layers, isPlaying, currentPosition, layerRef);
  usePlaybackLoop(isPlaying, layers, currentPosition, layerRef);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest("[data-layer-id]")) {
      dispatch(setSelectedLayer(null));
    }
  };

  const updateLayerStyle = (id: string, newStyle: styleConfig) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const currentStyle = getLayerStyle(layer);

    dispatch(
      updateLayer({
        id,
        updates: {
          style: {
            ...currentStyle,
            ...newStyle,
          },
        },
      })
    );
  };

  const handleResizeStop: RndResizeCallback = (_e, _dir, ref, _delta) => {
    // Find the layer id by matching the ref's parent Rnd component
    const id = ref.parentElement
      ?.querySelector("[data-layer-id]")
      ?.getAttribute("data-layer-id");
    if (!id) return;
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const currentStyle = getLayerStyle(layer);
    updateLayerStyle(id, {
      ...currentStyle,
      width: ref.style.width,
      height: ref.style.height,
    });
  };

  const handleResize: RndResizeCallback = (_e, _dir, ref, _delta) => {
    const id = ref.parentElement
      ?.querySelector("[data-layer-id]")
      ?.getAttribute("data-layer-id");
    if (!id) return;
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;
    const currentStyle = getLayerStyle(layer);
    updateLayerStyle(id, {
      ...currentStyle,
      width: ref.style.width,
      height: ref.style.height,
    });
  };

  const handleDragStop: RndDragCallback = (_e, d) => {
    // The Rnd component's "onDragStop" passes only (e, d), so get id from d.node
    const id = d.node
      .querySelector("[data-layer-id]")
      ?.getAttribute("data-layer-id");
    if (!id) return;
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;

    const transform = updateTransformTranslate(
      layer.style?.transform || "",
      d.x,
      d.y
    );
    updateLayerStyle(id, { 
      ...getLayerStyle(layer), 
      transform 
    });

    dispatch(
      addKeyframe({
        layerId: id,
        percentage: currentPosition,
        groupName: "transform",
        propertyName: "transform",
        value: transform,
      })
    );
  };

  const handleDrag: RndDragCallback = (_e, d) => {
    const id = d.node
      .querySelector("[data-layer-id]")
      ?.getAttribute("data-layer-id");
    if (!id) return;
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;

    const updatedTransform = updateTransformTranslate(
      layer.style?.transform || "",
      d.x,
      d.y
    );
    const currentStyle = getLayerStyle(layer);
    updateLayerStyle(id, { 
      ...currentStyle, 
      transform: updatedTransform 
    });
  };

  return (
    <div className={styles.canvasContainer} onMouseDown={handleCanvasClick}>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const visibility = layer.visible ? "visible" : "hidden";
          const baseStyle: React.CSSProperties = {
            ...layer.style,
            visibility,
          };

          const { width, height } = getWidthHeightFromCss(
            layer.customCss || ""
          );

          return (
            <Rnd
              key={layer.id}
              size={{
                width: layer.style?.width ?? width ?? "",
                height: layer.style?.height ?? height ?? "",
              }}
              style={baseStyle}
              onResizeStop={handleResizeStop}
              onResize={handleResize}
              onDragStop={handleDragStop}
              onDrag={handleDrag}
              bounds="parent"
            >
              <div
                data-layer-id={layer.id}
                className={`layer-${layer.id} ${
                  isSelected ? styles.selected : ""
                } ${styles.innerDiv}`}
                ref={(el) => { layerRef.current[layer.id] = el; }}
              />
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
 */

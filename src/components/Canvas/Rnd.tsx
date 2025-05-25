/* import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { toggleLayer } from "../../redux/slices/timelineSlice";
import { animateLayer } from "../../utils/LayerAnimation";
import {
  setSelectedLayer,
  updateLayer,
} from "../../redux/slices/animationSlice";
import { Rnd } from "react-rnd";
import { getDefaultPropertiesGroup } from "../../helpers/GetDefaultPropertiesGroup";
import { getWidthHeightFromCss } from "../HtmlCssCode/HtmlCssCode";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const layerRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
  const { layers, selectedLayerId, isPlaying, currentPosition } =
    useAppSelector((state) => state.animation);

  // Inject custom HTML and CSS when layers change
  useEffect(() => {
    layers.forEach((layer) => {
      if (layer.type === "code") {
        const wrapper = layerRef.current[layer.id];
        //innerhtml of wrapper is customHtml
        if (!wrapper) return;
        wrapper.innerHTML = layer.customHtml || "";

        // Inject CSS into <style> tag
        const styleId = `layer-style-${layer.id}`; //unique ID for each layer's style
        let styleTag = document.getElementById(styleId) as HTMLStyleElement;
        // doesnt exist, create it
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = styleId;
          document.head.appendChild(styleTag);
        }
        console.log("layer.styleTag", styleTag);

        styleTag.innerHTML = `
  ${layer.customCss || ""}

   .layer-${layer.id} > .custom-html-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .layer-${layer.id} .custom-html-wrapper * {
  min-width: ${getWidthHeightFromCss(layer.customCss || "")};
    min-height: ${getWidthHeightFromCss(layer.customCss || "")};
    min-width: 100% !important;
    min-height: 100% !important;
    box-sizing: border-box;
  }
`;
      }
    });
  }, [layers]);

  // Set play/pause animation state AFTER HTML and CSS are mounted
  useEffect(() => {
    layers.forEach((layer) => {
      if (!layer.visible) return;
      const wrapper = layerRef.current[layer.id];
      if (!wrapper) return;

      const target =
        layer.type === "code"
          ? (wrapper.firstElementChild as HTMLElement)
          : wrapper;

      if (target) {
        target.style.animationPlayState = isPlaying ? "running" : "paused";
      }
    });
  }, [isPlaying, layers]);

  // Update position manually when paused
  useEffect(() => {
    if (isPlaying) return;

    layers.forEach((layer) => {
      if (!layer.visible) return;
      const wrapper = layerRef.current[layer.id];
      const el =
        layer.type === "code"
          ? (wrapper?.firstElementChild as HTMLElement)
          : wrapper;

      if (el) {
        animateLayer(el, layer, Math.round(currentPosition));
      }
    });
  }, [currentPosition, isPlaying, layers]);

  // Animation playback loop
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      layers.forEach((layer) => {
        if (!layer.visible) return;

        const wrapper = layerRef.current[layer.id];
        const el =
          layer.type === "code"
            ? (wrapper?.firstElementChild as HTMLElement)
            : wrapper;

        if (!el) return;

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
  }, [isPlaying, layers]);

  const onDragStop = (e: any, d: { x: number; y: number }) => {
    {
      layers.map((layer) => {
        const defaultProps = (getDefaultPropertiesGroup(layer.type) ||
          {}) as Record<string, string>;
        console.log("defaultProps", defaultProps);

        dispatch(
          updateLayer({
            id: layer.id,
            updates: {
              style: {
                ...defaultProps,
                ...layer.style,
                left: d.x + "px",
                top: d.y + "px",
                width: layer.style?.width ?? defaultProps.width ?? "100px",
                height: layer.style?.height ?? defaultProps.height ?? "100px",
                backgroundColor:
                  layer.style?.backgroundColor ??
                  defaultProps.backgroundColor ??
                  "transparent",
                borderRadius:
                  layer.style?.borderRadius ??
                  defaultProps.borderRadius ??
                  "0px",
                opacity: layer.style?.opacity ?? defaultProps.opacity ?? "1",
                transform:
                  layer.style?.transform ?? defaultProps.transform ?? "none",
              },
            },
          })
        );
      });
    }
  };

  const onResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: { x: number; y: number }
  ) => {
    {
      layers.map((layer) => {
        // Get default properties for the layer type
        const defaultProps = (getDefaultPropertiesGroup(layer.type) ||
          {}) as Record<string, string>;
        dispatch(
          updateLayer({
            id: layer.id,
            updates: {
              style: {
                width: ref.style.width,
                height: ref.style.height,
                left: position.x + "px",
                top: position.y + "px",
                backgroundColor:
                  layer.style?.backgroundColor ??
                  defaultProps.backgroundColor ??
                  "transparent",
                borderRadius:
                  layer.style?.borderRadius ??
                  defaultProps.borderRadius ??
                  "0px",
                opacity: layer.style?.opacity ?? defaultProps.opacity ?? "1",
                transform:
                  layer.style?.transform ?? defaultProps.transform ?? "none",
              },
            },
          })
        );
      });
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.grid}></div>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          const width = layer.style?.width ?? "";
          const height = layer.style?.height ?? "";
          const x = layer.style?.left
            ? parseFloat(String(layer.style.left))
            : 0;
          const y = layer.style?.top ? parseFloat(String(layer.style.top)) : 0;

          const commonStyle = {
            ...layer.style,
            visibility: layer.visible
              ? "visible"
              : ("hidden" as React.CSSProperties["visibility"]),
            width: "100%",
            height: "100%",
            animationPlayState: isPlaying ? "running" : "paused",
            cursor: "move",
          };

          return (
            <Rnd
              key={layer.id}
              size={{ width, height }}
              position={{ x, y }}
              onDragStop={onDragStop}
              onResizeStop={onResizeStop}
              bounds="parent"
              enableResizing={true}
              dragHandleClassName="drag-handle"
              minWidth={20}
              minHeight={20}
            >
              <div key={layer.id} className={styles.rndWrapper}>
                {layer.type === "code" ? (
                  <div
                    ref={(el) => {
                      layerRef.current[layer.id] = el;
                    }}
                    data-layer-id={layer.id}
                    className={`${styles.layer} ${
                      styles.animatedElement
                    } layer-${layer.id} ${
                      layer.id === selectedLayerId ? styles.selected : ""
                    } drag-handle`}
                    style={commonStyle}
                    onClick={() => {
                      dispatch(toggleLayer(layer.id));
                      dispatch(setSelectedLayer(layer.id));
                    }}
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
                ) : (
                  <div
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
                      visibility: layer.visible ? "visible" : "hidden",
                    }}
                    className={`${styles.animatedElement} layer-${layer.id} ${
                      layer.id === selectedLayerId ? styles.selected : ""
                    } drag-handle`}
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
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;
 */
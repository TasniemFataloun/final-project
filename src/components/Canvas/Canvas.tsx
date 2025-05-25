import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { toggleLayer } from "../../redux/slices/timelineSlice";
import { animateLayer } from "../../utils/LayerAnimation";
import {
  setSelectedLayer,
  updateLayer,
} from "../../redux/slices/animationSlice";
import { Rnd } from "react-rnd";
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

        const { width, height } = getWidthHeightFromCss(layer.customCss || "");
        console.log("Extracted width:", width);
        console.log("Extracted height:", height);

        styleTag.innerHTML = `
  ${layer.customCss || ""}

  .custom-html-wrapper {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .custom-html-wrapper > * {
    min-width: ${width};
    min-height: ${height};
    width: 100%;
    height: 100%;
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

  //RND
  //helper function to get the layer style
  const getLayerStyle = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    return {
      position: "absolute",
      ...layer?.style,
      width: layer?.style?.width || "",
      height: layer?.style?.height || "",

      backgroundColor: layer?.style?.backgroundColor ?? "",
      borderRadius: layer?.style?.borderRadius ?? "",
      opacity: layer?.style?.opacity ?? "",
      transform: layer?.style?.transform ?? "",
    };
  };

  //function to create a generic update layer style
  const updateLayerStyle = (
    layerId: string,
    updatedStyle: Partial<React.CSSProperties>
  ) => {
    const currentStyle = getLayerStyle(layerId);
    dispatch(
      updateLayer({
        id: layerId,
        updates: {
          style: {
            ...currentStyle,
            ...updatedStyle,
            width:
              updatedStyle.width !== undefined
                ? String(updatedStyle.width)
                : String(currentStyle.width),
            height:
              updatedStyle.height !== undefined
                ? String(updatedStyle.height)
                : String(currentStyle.height),

            backgroundColor:
              updatedStyle.backgroundColor || currentStyle.backgroundColor,
            borderRadius:
              updatedStyle.borderRadius !== undefined
                ? String(updatedStyle.borderRadius)
                : String(currentStyle.borderRadius),
            opacity:
              updatedStyle.opacity !== undefined
                ? String(updatedStyle.opacity)
                : String(currentStyle.opacity),
            transform: updatedStyle.transform || currentStyle.transform,
          },
        },
      })
    );
  };

  // final size and position of the layer and update in redux store
  const handleResizeStop = (
    _e: any,
    _dir: any,
    ref: any,
    _delta: any,
    pos: any,
    id: string
  ) => {
    updateLayerStyle(id, {
      width: ref.style.width || ref.offsetWidth + "px",
      height: ref.style.height || ref.offsetHeight + "px",
    });
  };

  const handleDragStop = (_e: any, d: any, id: string) => {
    updateLayerStyle(id, {});
  };

  const handleResize = (
    _e: any,
    _dir: any,
    ref: any,
    _delta: any,
    id: string
  ) => {
    updateLayerStyle(id, {
      width: ref.style.width,
      height: ref.style.height,
    });

    console.log("Resize event", {
      width: ref.style.width,
      height: ref.style.height,
    });
  };

  const handleDrag = (_e: any, d: any, id: string) => {
    updateLayerStyle(id, {});
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          //style for selected layer
          const isSelected = layer.id === selectedLayerId;
          const visibilityStyle: React.CSSProperties = {
            visibility: layer.visible ? "visible" : "hidden",
          };
          const commonProps = {
            "data-layer-id": layer.id,
            onClick: () => {
              dispatch(toggleLayer(layer.id));
              dispatch(setSelectedLayer(layer.id));
            },
            style: { ...layer.style, ...visibilityStyle },
            className: `layer-${layer.id} ${
              isSelected ? styles.selected : ""
            } ${styles.innerDiv}`,
            ref: (el: HTMLDivElement | null) => {
              layerRef.current[layer.id] = el;
            },
          };

          if (layer.type === "code") {
            return (
              <Rnd
                style={{ border: "1px dashed red" }}
                key={layer.id}
                size={{
                  width: layer.style?.width || "",
                  height: layer.style?.height || "",
                }}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  handleResizeStop(e, dir, ref, delta, pos, layer.id)
                }
                onDragStop={(e, d) => handleDragStop(e, d, layer.id)}
                enableResizing={true}
                onResize={(e, dir, ref, delta, pos) =>
                  handleResize(e, dir, ref, delta, layer.id)
                }
                onDrag={(e, d) => handleDrag(e, d, layer.id)}
                bounds="parent"
              >
                <div
                  {...commonProps}
                  className={`${commonProps.className} custom-html-wrapper`}
                  style={{
                    width: layer.style?.width || "",
                    height: layer.style?.height || "",
                  }}
                ></div>
              </Rnd>
            );
          } else {
            return (
              <Rnd
                style={{ border: "1px dashed red" }}
                key={layer.id}
                size={{
                  width: layer.style?.width || "",
                  height: layer.style?.height || "",
                }}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  handleResizeStop(e, dir, ref, delta, pos, layer.id)
                }
                onDragStop={(e, d) => handleDragStop(e, d, layer.id)}
                enableResizing={true}
                onResize={(e, dir, ref, delta, pos) =>
                  handleResize(e, dir, ref, delta, layer.id)
                }
                onDrag={(e, d) => handleDrag(e, d, layer.id)}
                bounds="parent"
              >
                <div
                  data-layer-id={layer.id}
                  ref={(el) => {
                    layerRef.current[layer.id] = el;
                  }}
                  onClick={() => {
                    dispatch(toggleLayer(layer.id));
                    dispatch(setSelectedLayer(layer.id));
                  }}
                  style={{
                    ...layer.style,
                    visibility: layer.visible ? "visible" : "hidden",
                  }}
                  className={`layer-${layer.id} ${
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
              </Rnd>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Canvas;

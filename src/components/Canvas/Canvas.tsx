// Canvas.tsx

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import styles from "./Canvas.module.css";
import { UseGenerateKeyframes } from "../../utils/useGenerateKeyframe";
import { toggleLayer } from "../../redux/slices/timelineSlice";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const { layers } = useAppSelector((state) => state.animation);
  const { isPlaying } = useAppSelector((state) => state.animation);

  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement("style");
      styleRef.current = style;
      document.head.appendChild(style);
    }

    const css = layers
      .map((layer) => UseGenerateKeyframes(layer))
      .filter(Boolean)
      .join("\n");

    if (styleRef.current) {
      styleRef.current.innerHTML = css;
    }
  }, [layers]);

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          return (
            <>
              <div
                key={layer.id}
                onClick={() => dispatch(toggleLayer(layer.id))}
                style={{
                  ...layer.style,
                  visibility: layer.visible ? "visible" : "hidden",
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
                className={`${styles.animatedElement} layer-${layer.id}`}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;

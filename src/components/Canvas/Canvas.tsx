import { useEffect, useRef } from "react";
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
        const element = layerRef.current[layer.id];
        if (element && layer.visible) {
          animateLayer(element, layer, Math.round(currentPosition));
        }
      });
    }
  }, [currentPosition, isPlaying, layers]);


  //this useEffect is used to animate the layers when the play button is pressed (animate request)
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

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.grid}></div>
      <div className={styles.animatedElementContainer}>
        {layers.map((layer) => {
          return (
            <>
              <div
                ref={(el) => {
                  if (el) layerRef.current[layer.id] = el;
                }}
                key={layer.id}
                onClick={() => {
                  dispatch(toggleLayer(layer.id));
                  dispatch(setSelectedLayer(layer.id));
                }}
                style={{
                  ...layer.style,
                  visibility: layer.visible ? "visible" : "hidden",
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
                className={`${styles.animatedElement} layer-${layer.id} ${
                  layer.id === selectedLayerId ? styles.selected : ""
                }`}
              />
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Canvas;

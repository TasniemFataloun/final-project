import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { setIsPlaying } from "../../redux/slices/animationSlice";
import styles from "./Canvas.module.css";
import { Pause, Play } from "lucide-react";

const Canvas = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const { config, isPlaying } = useAppSelector((state) => state.animation);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.style.setProperty("--scale", config.transform.scale);
      element.style.setProperty("--rotate", `${config.transform.rotate}deg`);
      element.style.setProperty(
        "--translate-x",
        `${config.transform.translateX}px`
      );
      element.style.setProperty(
        "--translate-y",
        `${config.transform.translateY}px`
      );
      element.style.setProperty("--opacity", config.opacity);
    }
  }, [config]);

  /*    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        element.style.transform = `scale(${config.transform.scale}) rotate(${config.transform.rotate}deg) translate(${config.transform.translateX}px, ${config.transform.translateY}px)`;
        element.style.opacity = config.opacity;
      }
    }, [config]);  */

  const style = {
    width: `${config.width}px`,
    height: `${config.height}px`,
    animationName: "animation",
    animationDuration: `${config.duration}s`,
    animationTimingFunction: config.timingFunction,
    animationDelay: `${config.delay}s`,
    animationIterationCount: config.iterationCount,
    animationFillMode: "forwards",
    animationPlayState: isPlaying ? "running" : "paused",
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!isPlaying) return;
    if (element) {
      element.style.animation = "none";
      element.offsetTop;
      element.style.animation = `animation ${config.duration}s ${config.timingFunction} ${config.delay}s ${config.iterationCount}`;
    }
  }, [
    config.iterationCount,
    config.duration,
    config.timingFunction,
    config.delay,
  ]);

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        <div
          ref={elementRef}
          className={styles.animatedElement}
          style={style}
        />
      </div>

      <div className={styles.playSection}>
        <button
          onClick={() => dispatch(setIsPlaying(!isPlaying))}
          className={styles.primaryButton}
        >
          {isPlaying ? (
            <Pause className={styles.buttonIcon} />
          ) : (
            <Play className={styles.buttonIcon} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Canvas;

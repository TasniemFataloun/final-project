import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { setIsPlaying } from "../../redux/slices/animationSlice";
import { setSelectedElementId } from "../../redux/slices/elementsSlice";
import { Pause, Play } from "lucide-react";
import styles from "./Canvas.module.css";
import { AnimationType } from "../../types/animationType";

const Canvas = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  const { elements, selectedElementId } = useAppSelector(
    (state) => state.elements
  );
  const { isPlaying } = useAppSelector((state) => state.animation);

  console.log(elements);
  console.log(isPlaying);

  const generateAnimationStyle = (
    config: AnimationType
  ): React.CSSProperties => {
    const style: React.CSSProperties & Record<string, string | number> = {
      "--width": `${config.size.width}px`,
      "--height": `${config.size.height}px`,
      borderRadius: config.borderRadius || "0",
      animation: `animation ${config.animation.duration}s ${config.animation.timingFunction} ${config.animation.delay}s ${config.animation.iterationCount}`,
      animationPlayState: isPlaying ? "running" : "paused",
      animationFillMode: "forwards",
      // Dynamically set CSS variables:
      "--scale": config.transform.scale,
      "--rotate": `${config.transform.rotate}deg`,
      "--translate-x": `${config.transform.translateX}px`,
      "--translate-y": `${config.transform.translateY}px`,
      "--opacity": config.opacity,
    };
    return style;
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Auto-select first element if none selected
  useEffect(() => {
    if (!selectedElementId && elements.length > 0) {
      dispatch(setSelectedElementId(elements[0].id));
    }
  }, [elements, selectedElementId, dispatch]);

  // Reset animation manually when config changes
  useEffect(() => {
    const element = elementRef.current;
    if (!isPlaying || !element || !selectedElement) return;

    element.style.animation = "none";
    element.style.animation = `animation ${selectedElement.config.animation.duration}s ${selectedElement.config.animation.timingFunction} ${selectedElement.config.animation.delay}s ${selectedElement.config.animation.iterationCount}`;
  }, [
    selectedElement?.config.animation.duration,
    selectedElement?.config.animation.timingFunction,
    selectedElement?.config.animation.delay,
    selectedElement?.config.animation.iterationCount,
  ]);

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        {elements.map((el) => (
          <div
            key={el.id}
            ref={el.id === selectedElementId ? elementRef : null} // only assign the ref to the selected one (if needed)
            onClick={() => dispatch(setSelectedElementId(el.id))}
            style={generateAnimationStyle(el.config)}
            className={styles.animatedElement}
          />
        ))}
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

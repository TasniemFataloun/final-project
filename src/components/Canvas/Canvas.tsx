import { useEffect, useRef, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { setIsPlaying } from "../../redux/slices/animationSlice";
import { setSelectedElementId, updateElementConfig } from "../../redux/slices/elementsSlice";
import { Pause, Play } from "lucide-react";
import styles from "./Canvas.module.css";
import { AnimationType } from "../../types/animationType";
import { UseGenerateKeyframes } from "../../utils/useGenerateKeyframe";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const { isPlaying } = useAppSelector((state) => state.animation);
  const { elements, selectedElementId } = useAppSelector((state) => state.elements);

  const styleRef = useRef<HTMLStyleElement | null>(null);

  // Auto-select the first element when no element is selected
  useEffect(() => {
    if (!selectedElementId && elements.length > 0) {
      dispatch(setSelectedElementId(elements[0].id));
    }
  }, [elements, selectedElementId, dispatch]);

  // Generate keyframes CSS and inject it into <style>
  const injectKeyframes = (config: AnimationType) => {
     return UseGenerateKeyframes(config); 

  
  };
  
  // Inject all keyframes for current elements
  useEffect(() => {
    // Remove old <style> if exists
    if (styleRef.current) {
      styleRef.current.remove();
    }

    const styleTag = document.createElement("style");
    styleTag.type = "text/css";

    const allKeyframes = elements.map((el) => injectKeyframes(el.config)).join("\n");
    styleTag.appendChild(document.createTextNode(allKeyframes));
    document.head.appendChild(styleTag);

    styleRef.current = styleTag;

    return () => {
      styleTag.remove();
    };
  }, [elements]);

  // Memoized function to generate CSS properties for animation style
  const generateAnimationStyle = useMemo(() => {
    return (config: AnimationType): React.CSSProperties => {
      const width = Number(config.size.width);
      const height = Number(config.size.height);
      const borderRadius = Number(config.opacity.borderRadius);
      const duration = Number(config.animation.duration);
      const delay = Number(config.animation.delay);
      const timingFunction = config.animation.timingFunction;
      const iterationCount = config.animation.iterationCount;
      const bgColor = config.backgroundColor.backgroundColor;
      
      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        borderRadius: `${borderRadius}px`,
        animation: `animation-${config.id} ${duration}s ${timingFunction} ${delay}s ${iterationCount}`,
        animationPlayState: isPlaying ? "running" : "paused",
        animationFillMode: "forwards",
        position: "absolute"
        
      };
    };
  }, [isPlaying]);

  const handleDragStop = (e: any, d: any, elId: string) => {
    const updatedElement = elements.find((el) => el.id === elId);
    if (updatedElement) {
      dispatch(
        updateElementConfig({
          id: updatedElement.id,
          config: {
            ...updatedElement.config,
            transform: {
              ...updatedElement.config.transform,
              translateX: d.x,
              translateY: d.y,
            },
          },
        })
      );
    }
  };

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, elId: string) => {
    const updatedElement = elements.find((el) => el.id === elId);
    if (updatedElement) {
      dispatch(
        updateElementConfig({
          id: updatedElement.id,
          config: {
            ...updatedElement.config,
            size: {
              width: ref.offsetWidth,
              height: ref.offsetHeight,
            },
          },
        })
      );
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        {elements.map((el) => (
          <div
            key={el.id}
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

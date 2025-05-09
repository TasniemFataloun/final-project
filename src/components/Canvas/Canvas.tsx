import { useEffect, useRef, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { setSelectedElementId } from "../../redux/slices/elementsSlice";
import styles from "./Canvas.module.css";
import { AnimationType } from "../../types/animationType";
import { UseGenerateKeyframes } from "../../utils/useGenerateKeyframe";
import PlayAnimation from "../PlayAnimation/PlayAnimation";
import { setOpenLayer } from "../../redux/slices/timelineSlice";

const Canvas = () => {
  const dispatch = useAppDispatch();
  const { isPlaying } = useAppSelector((state) => state.animation);
  const { elements, selectedElementId } = useAppSelector(
    (state) => state.elements
  );

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
    if (styleRef.current) {
      styleRef.current.remove();
    }

    const styleTag = document.createElement("style");

    const allKeyframes = elements
      .map((el) => injectKeyframes(el.currentConfig))
      .join("\n");
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

      console.log(config);

      return {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        borderRadius: `${borderRadius}px`,
        animation: `animation-${config.type} ${duration}s ${timingFunction} ${delay}s ${iterationCount}`,
        animationPlayState: isPlaying ? "running" : "paused",
        animationFillMode: "forwards",
        position: "absolute",
      };
    };
  }, [isPlaying]);

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.animatedElementContainer}>
        {elements.map((el) => (
          <div
            key={el.id}
            onClick={() => {
              dispatch(setOpenLayer(el.id));
            }}
            style={generateAnimationStyle(el.currentConfig)}
            className={styles.animatedElement}
          />
        ))}
      </div>
      {elements.length > 0 && <PlayAnimation />}
    </div>
  );
};

export default Canvas;

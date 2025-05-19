import React, { useEffect, useRef } from "react";
import style from "./TimelineKeyframes.module.css";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  removeSelectedKeyframe,
  setCurrentPosition,
  setIsPlaying,
  setSelectedKeyframe,
} from "../../../redux/slices/animationSlice";
import { setIsDragging } from "../../../redux/slices/timelineSlice";
import { Diamond } from "lucide-react";

const TimelineKeyframes = () => {
  const dispatch = useAppDispatch();
  const { layers, selectedLayerId, isPlaying, currentPosition } =
    useAppSelector((state) => state.animation);
  const { expandedLayers, isDragging } = useAppSelector(
    (state) => state.timeline
  );

  const selectedKeyframe = useAppSelector(
    (state) => state.animation.selectedKeyframe
  );

  const timelineRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    // If click target is a keyframe, do NOT reset
    const target = e.target as HTMLElement;
    if (target.closest(`.${style.keyframe}`)) {
      return;
    }

    // Else reset selected keyframe
    dispatch(
      setSelectedKeyframe({ layerId: "", property: "", keyframeId: "" })
    );

    // Existing logic for setting current position
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));

    dispatch(setCurrentPosition(clampedPosition));
    endTimeRef.current = clampedPosition;
    startTimeRef.current = null;
    dispatch(setIsPlaying(false));
  };

  const handleMouseDown = () => {
    dispatch(setIsDragging(true));
    dispatch(setIsPlaying(false));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));

    dispatch(setCurrentPosition(clampedPosition));
    endTimeRef.current = clampedPosition;
    startTimeRef.current = null;
  };

  const handleMouseUp = () => {
    dispatch(setIsDragging(false));
  };

  //useEffect
  useEffect(() => {
    const selectedLayer = layers.find(
      (layer) => layer.id === selectedLayerId
    )?.config;
    const duration = selectedLayer ? selectedLayer.duration * 1000 : 1;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        const time = (endTimeRef.current / 100) * duration;
        startTimeRef.current = timestamp - time;
      }
      const elapsed = timestamp - startTimeRef.current;
      const position = ((elapsed % duration) / duration) * 100;
      dispatch(setCurrentPosition(position));

      endTimeRef.current = position;
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      startTimeRef.current = null;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        dispatch(setIsPlaying(!isPlaying));
      }

      if (
        e.code === "Backspace" &&
        selectedKeyframe?.layerId &&
        selectedKeyframe?.property &&
        selectedKeyframe?.keyframeId
      ) {
        dispatch(removeSelectedKeyframe());
      }
      console.log("Keydown", e.code, selectedKeyframe);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, dispatch, selectedKeyframe]);

  return (
    <div
      className={`${style.keyframesContainer} ${style.scrole}`}
      onClick={handleTimelineClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      ref={timelineRef}
    >
      {/* Playhead */}
      {layers.length > 0 && (
        <div
          className={style.playHead}
          style={{ left: `${currentPosition}%` }}
        />
      )}
      {/* Keyframes */}

      {layers.map((layer) => (
        <React.Fragment key={layer.id}>
          <div
            className={`${style.row} ${
              selectedLayerId === layer.id ? ` ${style.selectedLayer}` : ""
            }`}
          ></div>

          <>
            {layer.editedPropertiesGroup?.map((group) => {
              const isLayerExpanded = expandedLayers[layer.id];

              return (
                <React.Fragment key={group.name}>
                  {isLayerExpanded && (
                    <>
                      {group.propertiesList.map((prop) => (
                        <div
                          key={`${layer.id}-${group.name}-${prop.propertyName}`}
                          className={`${style.row} ${style.keyframeRow}`}
                        >
                          {prop.keyframes.map((kf) => {
                            const isThisKeyframeSelected =
                              selectedKeyframe?.layerId === layer.id &&
                              selectedKeyframe?.property ===
                                prop.propertyName &&
                              selectedKeyframe?.keyframeId === kf.id;
                            return (
                              <Diamond
                                size={15}
                                fill="var(--selectedLayer)"
                                key={kf.id}
                                className={`${style.keyframe} ${
                                  isThisKeyframeSelected
                                    ? style.selectedKeyframe
                                    : ""
                                }`}
                                style={{ left: `${kf.percentage}%` }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const payload = {
                                    layerId: layer.id,
                                    property: prop.propertyName,
                                    keyframeId: kf.id,
                                  };
                                  dispatch(setSelectedKeyframe(payload));
                                  dispatch(setCurrentPosition(kf.percentage));
                                }}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TimelineKeyframes;

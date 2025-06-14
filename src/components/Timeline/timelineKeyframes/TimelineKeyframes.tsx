import React, { useEffect, useRef, useState } from "react";
import style from "./TimelineKeyframes.module.css";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  copyKeyframe,
  pasteKeyframe,
  removeSelectedKeyframe,
  setCurrentPosition,
  setIsPlaying,
  setSelectedKeyframe,
  setSelectedLayer,
  updateKeyframe,
} from "../../../redux/slices/animationSlice";
import { setEndTimeRef } from "../../../redux/slices/timelineSlice";
import { Diamond } from "lucide-react";
import { defaultLayerConfig } from "../../../config/elementsProperties.config";
import { Propertykeyframes } from "../../../redux/types/animations.type";

const TimelineKeyframes = () => {
  const dispatch = useAppDispatch();
  const { layers, selectedLayerId, isPlaying, currentPosition } =
    useAppSelector((state) => state.animation);
  const { expandedLayers, endTimeRef } = useAppSelector(
    (state) => state.timeline
  );
  const [isDragging, setIsDragging] = useState(false);

  const [draggedKeyframe, setDraggedKeyframe] = useState<{
    layerId: string;
    property: string;
    newKeyframe: Propertykeyframes;
  } | null>(null);

  const { copyKeyframe: copiedKeyframe } = useAppSelector(
    (state) => state.animation
  );
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.selectedKeyframe
  );

  const layerId = layers.find((layer) => layer.id === selectedLayerId)?.id;

  const timelineRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const justCopiedRef = useRef(false);
  const justPastedRef = useRef(false);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;

    const target = e.target as HTMLElement;

    // clicking on a keyframe -> do not clear selection
    if (target.closest(`.${style.keyframe}`)) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    const clampedPosition = Math.round(Math.max(0, Math.min(100, position)));

    dispatch(setCurrentPosition(clampedPosition));
    dispatch(setEndTimeRef(clampedPosition));
    startTimeRef.current = null;
    dispatch(setIsPlaying(false));

    // Handle special copy case
    if (justCopiedRef.current) {
      justCopiedRef.current = false;
      return; // Skip clearing selection once right after copy
    }

    // Reset paste flag, but don't skip clearing selection
    if (justPastedRef.current) {
      justPastedRef.current = false;
    }

    // Clear selection normally
    dispatch(
      setSelectedKeyframe({
        layerId: "",
        property: "",
        keyframe: {
          id: "",
          percentage: 0,
          value: "",
          unit: "",
        },
      })
    );
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    dispatch(setIsPlaying(false));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    const selectedlayer = layers.find((layer) => layer.id === selectedLayerId);
    if (selectedlayer?.locked) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    const clampedPosition = Math.round(Math.max(0, Math.min(100, position)));
    if (draggedKeyframe) {
      dispatch(
        updateKeyframe({
          ...draggedKeyframe,
          keyframe: {
            ...draggedKeyframe.newKeyframe,
            percentage: clampedPosition,
          },
        })
      );
      dispatch(setCurrentPosition(clampedPosition));
      dispatch(setEndTimeRef(clampedPosition));
      startTimeRef.current = null;
    } else {
      dispatch(setCurrentPosition(clampedPosition));
      dispatch(setEndTimeRef(clampedPosition));
      startTimeRef.current = null;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedKeyframe(null);
  };

  //useEffect
  useEffect(() => {
    const selectedLayer = layers.find(
      (layer) => layer.id === selectedLayerId
    )?.config;
    const duration = selectedLayer
      ? selectedLayer.duration * 1000
      : defaultLayerConfig.duration * 1000;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        const time = (endTimeRef / 100) * duration;
        startTimeRef.current = timestamp - time;
      }
      const elapsed = timestamp - startTimeRef.current;
      const position = ((elapsed % duration) / duration) * 100;
      dispatch(setCurrentPosition(position));

      dispatch(setEndTimeRef(position));
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
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [isPlaying, dispatch, selectedKeyframe, copiedKeyframe, currentPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.code === "KeyC" &&
        selectedKeyframe?.keyframe?.id
      ) {
        e.preventDefault();
        dispatch(copyKeyframe(selectedKeyframe.keyframe));
        justCopiedRef.current = true;
      }

      if (
        (e.metaKey || e.code) &&
        e.code === "KeyV" &&
        layerId &&
        copiedKeyframe
      ) {
        e.preventDefault();
        justPastedRef.current = true;

        const clampedPosition = Math.max(0, Math.min(100, currentPosition));

        dispatch(
          pasteKeyframe({
            layerId: layerId,
            property: selectedKeyframe?.property || "",
            newPercentage: clampedPosition,
          })
        );
        dispatch(
          setSelectedKeyframe({
            layerId: "",
            property: "",
            keyframe: {
              id: "",
              percentage: 0,
              value: "",
              unit: "",
            },
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, selectedKeyframe, copiedKeyframe, currentPosition]);

  // useeffect for play/pause and delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (
        document.activeElement as HTMLElement
      )?.tagName.toLowerCase();
      const isTyping =
        activeTag === "input" ||
        activeTag === "textarea" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (
        !isTyping &&
        layers.length !== 0 &&
        layers.some(
          (l) => l.editedPropertiesGroup && l.editedPropertiesGroup.length > 0
        ) &&
        e.code === "Space"
      ) {
        e.preventDefault();
        dispatch(setIsPlaying(!isPlaying));
      }

      if (
        e.code === "Backspace" &&
        selectedKeyframe?.layerId &&
        selectedKeyframe?.property &&
        selectedKeyframe?.keyframe
      ) {
        dispatch(removeSelectedKeyframe());
        dispatch(
          setSelectedKeyframe({
            layerId: "",
            property: "",
            keyframe: {
              id: "",
              percentage: 0,
              value: "",
              unit: "",
            },
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, dispatch, selectedKeyframe]);

  return (
    <div
      data-tour="timeline-keyframes"
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

      {[...layers]
        .slice()
        .reverse()
        .map((layer) => (
          <React.Fragment key={layer.id}>
            <div
              className={`${style.row} ${
                selectedLayerId === layer.id ? style.selectedLayer : ""
              } ${!expandedLayers[layer.id] ? style.collapsedRow : ""}`}
            >
              {!expandedLayers[layer.id] &&
                layer.editedPropertiesGroup?.flatMap((prop) =>
                  prop.keyframes.map((keyframe) => (
                    <Diamond
                      key={keyframe.id}
                      size={12}
                      className={`${style.keyframe} ${style.collapsedKeyframe}`}
                      style={{ left: `${keyframe.percentage}%` }}
                      onClick={() => setCurrentPosition(keyframe.percentage)}
                    />
                  ))
                )}
            </div>

            {expandedLayers[layer.id] &&
              layer.editedPropertiesGroup?.map((prop) => (
                <div
                  key={`${layer.id}-${prop.propertyName}`}
                  className={`${style.row} ${style.keyframeRow}`}
                >
                  {prop.keyframes.map((kf) => {
                    const isThisKeyframeSelected =
                      selectedKeyframe?.layerId === layer.id &&
                      selectedKeyframe?.property === prop.propertyName &&
                      selectedKeyframe?.keyframe?.id === kf.id;

                    return (
                      <div
                        key={kf.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          dispatch(
                            setSelectedKeyframe({
                              layerId: layer.id,
                              property: prop.propertyName,
                              keyframe: kf,
                            })
                          );
                          setIsDragging(true);
                          setDraggedKeyframe({
                            layerId: layer.id,
                            property: prop.propertyName,
                            newKeyframe: kf,
                          });
                        }}
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                          dispatch(
                            setSelectedKeyframe({
                              layerId: layer.id,
                              property: prop.propertyName,
                              keyframe: kf,
                            })
                          );
                          dispatch(setSelectedLayer(layer.id));
                          dispatch(setCurrentPosition(kf.percentage));
                        }}
                      >
                        <Diamond
                          size={17}
                          fill="var(--selectedLayer)"
                          className={`${style.keyframe} ${
                            isThisKeyframeSelected ? style.selectedKeyframe : ""
                          }`}
                          style={{
                            left: `${kf.percentage}%`,
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
          </React.Fragment>
        ))}
    </div>
  );
};

export default TimelineKeyframes;

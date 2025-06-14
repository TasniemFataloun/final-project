import style from "./TimelineControl.module.css";
import {
  ChevronLeft,
  ChevronRight,
  Diamond,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  setCurrentPosition,
  setIsPlaying,
} from "../../../redux/slices/animationSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { setEndTimeRef } from "../../../redux/slices/timelineSlice";
import { getSortedUniqueKeyframes } from "../../../helpers/GetSortedUniqueKeyframes";

const TimelineControl = () => {
  //redux
  const dispatch = useAppDispatch();
  const { currentPosition, selectedLayerId, layers, isPlaying } =
    useAppSelector((state) => state.animation.present);

  /* restart and jump to end */
  const restart = () => {
    dispatch(setCurrentPosition(0));
    dispatch(setEndTimeRef(0));
  };
  const jumpToEnd = () => {
    dispatch(setCurrentPosition(100));
    dispatch(setEndTimeRef(100));
  };
  /* stepper */
  const stepBackward = () => {
    const newPosition = Math.max(0, currentPosition - 1);
    dispatch(setCurrentPosition(newPosition));
    dispatch(setEndTimeRef(newPosition));
  };

  const stepForward = () => {
    const newPosition = Math.min(100, currentPosition + 1);
    dispatch(setCurrentPosition(newPosition));
    dispatch(setEndTimeRef(newPosition));
  };

  /* Move key frame */
  const moveToNextKeyframe = () => {
    const uniqueSortedKeyframes = getSortedUniqueKeyframes(
      layers,
      selectedLayerId,
      true
    );
    if (uniqueSortedKeyframes.length === 0) return;

    const nextKeyframe = uniqueSortedKeyframes.find(
      (pos) => pos > currentPosition
    );

    if (nextKeyframe !== undefined) {
      dispatch(setCurrentPosition(nextKeyframe));
      dispatch(setEndTimeRef(nextKeyframe));
    } else {
      dispatch(setCurrentPosition(0));
      dispatch(setEndTimeRef(0));
    }
  };

  const moveToPreviousKeyframe = () => {
    const uniqueSortedKeyframes = getSortedUniqueKeyframes(
      layers,
      selectedLayerId,
      false
    );
    if (uniqueSortedKeyframes.length === 0) return;

    const previousKeyframe = uniqueSortedKeyframes.find(
      (pos) => pos < currentPosition
    );

    if (previousKeyframe !== undefined) {
      dispatch(setCurrentPosition(previousKeyframe));
      dispatch(setEndTimeRef(previousKeyframe));
    } else {
      const firstKeyframe = uniqueSortedKeyframes[0];
      dispatch(setCurrentPosition(firstKeyframe));
      dispatch(setEndTimeRef(firstKeyframe));
    }
  };

  return (
    <div className={style.header} data-tour="timeline-controls">
      <div className={style.controlsSection}>
        <button className={style.button} onClick={restart} data-tour="restart">
          <SkipBack size={12} />
        </button>
        <button
          className={style.button}
          onClick={stepBackward}
          data-tour="step-backward"
        >
          <ChevronLeft size={12} />
        </button>
        <button
          className={style.button}
          onClick={moveToPreviousKeyframe}
          data-tour="move-to-previous-keyframe"
        >
          <Diamond size={8} /> <ChevronLeft size={12} />
        </button>
        <button
          data-tour="play-pause"
          className={style.button}
          onClick={() => {
            const hasEditedProps = layers.some(
              (l) =>
                l.editedPropertiesGroup &&
                l.editedPropertiesGroup.flat().length > 0
            );
            if (layers.length > 0 && hasEditedProps) {
              dispatch(setIsPlaying(!isPlaying));
            }
          }}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button
          data-tour="move-to-next-keyframe"
          className={style.button}
          onClick={moveToNextKeyframe}
        >
          <ChevronRight size={12} />
          <Diamond size={8} />
        </button>
        <button
          className={style.button}
          onClick={stepForward}
          data-tour="step-forward"
        >
          <ChevronRight size={12} />
        </button>
        <button
          className={style.button}
          onClick={jumpToEnd}
          data-tour="jump-to-end"
        >
          <SkipForward size={12} />
        </button>
      </div>
    </div>
  );
};

export default TimelineControl;

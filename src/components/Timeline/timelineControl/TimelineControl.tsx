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
    useAppSelector((state) => state.animation);

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
    const newPosition = Math.min(100, currentPosition - 1);
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
    <div className={style.header}>
      <div className={style.controlsSection}>
        <button className={style.button} onClick={restart}>
          <SkipBack size={12} />
        </button>
        <button className={style.button} onClick={stepBackward}>
          <ChevronLeft size={12} />
        </button>
        <button className={style.button} onClick={moveToPreviousKeyframe}>
          <Diamond size={8} /> <ChevronLeft size={12} />
        </button>
        <button
          className={style.button}
          onClick={() => dispatch(setIsPlaying(!isPlaying))}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button className={style.button} onClick={moveToNextKeyframe}>
          <ChevronRight size={12} />
          <Diamond size={8} />
        </button>
        <button className={style.button} onClick={stepForward}>
          <ChevronRight size={12} />
        </button>
        <button className={style.button} onClick={jumpToEnd}>
          <SkipForward size={12} />
        </button>
      </div>
    </div>
  );
};

export default TimelineControl;

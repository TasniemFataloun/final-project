import { useRef } from "react";
import style from "./TimelineControl.module.css";
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack } from "lucide-react";
import {
  setCurrentPosition,
  setIsPlaying,
} from "../../../redux/slices/animationSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/store";

const TimelineControl = () => {
  const dispatch = useAppDispatch();
  const endTimeRef = useRef<number>(0);

  const { currentPosition } = useAppSelector((state) => state.animation);
  const { isPlaying } = useAppSelector((state) => state.animation);
  

  const restart = () => {
    dispatch(setCurrentPosition(0));
    endTimeRef.current = 0;
  };

  const stepBackward = () => {
    const newPosition = Math.min(100, currentPosition - 1);
    dispatch(setCurrentPosition(newPosition));
    endTimeRef.current = newPosition;
  };

  const stepForward = () => {
    const newPosition = Math.min(100, currentPosition + 1);
    dispatch(setCurrentPosition(newPosition));
    endTimeRef.current = newPosition;
  };
  return (
    <>
      <div className={style.header}>
        <div className={style.controlsSection}>
          <button className={style.button} onClick={restart}>
            <SkipBack size={12} />
          </button>
          <button className={style.button} onClick={stepBackward}>
            <ChevronLeft size={12} />
          </button>
          <button
            className={style.button}
            onClick={() => dispatch(setIsPlaying(!isPlaying))}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button className={style.button} onClick={stepForward}>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </>
  );
};

export default TimelineControl;

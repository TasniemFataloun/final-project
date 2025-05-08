import { Pause, Play } from "lucide-react";
import { setIsPlaying } from "../../redux/slices/animationSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import style from "./PlayAnimation.module.css";

const PlayAnimation = () => {
  const dispatch = useAppDispatch();
    const { isPlaying } = useAppSelector((state) => state.animation);
  

  return (
    <div className={style.playSection}>
      <button
        onClick={() => dispatch(setIsPlaying(!isPlaying))}
        className={style.primaryButton}
      >
        {isPlaying ? (
          <Pause className={style.playButton} />
        ) : (
          <Play className={style.playButton}/>
        )}
      </button>
    </div>
  );
};

export default PlayAnimation;

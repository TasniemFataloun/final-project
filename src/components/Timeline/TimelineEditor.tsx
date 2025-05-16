import style from "./TimelineEditor.module.css";
import TimelineControl from "./timelineControl/TimelineControl";
import TimelineHeader from "./timelineHeader/TimelineHeader";
import TimelineLayers from "./timelineLayers/TimelineLayers";
import TimelineKeyframes from "./timelineKeyframes/TimelineKeyframes";

const TimelineEditor = () => {
  return (
    <div className={style.container}>
      <TimelineControl />
      <TimelineHeader />
      <div className={`${style.timelineBody} ${style.scrole}`}>
        <TimelineLayers />
        <TimelineKeyframes />
      </div>
    </div>
  );
};

export default TimelineEditor;

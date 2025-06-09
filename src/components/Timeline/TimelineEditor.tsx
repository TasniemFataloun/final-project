import style from "./TimelineEditor.module.css";
import TimelineControl from "./timelineControl/TimelineControl";
import TimelineHeader from "./timelineHeader/TimelineHeader";
import TimelineLayers from "./timelineLayers/TimelineLayers";
import TimelineKeyframes from "./timelineKeyframes/TimelineKeyframes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type TimelineEditorProps = {
  onOpenLayerSettings: () => void;
};

const TimelineEditor: React.FC<TimelineEditorProps> = ({
  onOpenLayerSettings,
}) => {
  return (
    <div className={style.container} data-tour="timeline">
      <TimelineControl />
      <TimelineHeader />
      <div className={`${style.timelineBody} ${style.scrole}`}>
        <DndProvider backend={HTML5Backend}>
          <TimelineLayers onOpenLayerSettings={onOpenLayerSettings} />{" "}
        </DndProvider>

        <TimelineKeyframes />
      </div>
    </div>
  );
};

export default TimelineEditor;

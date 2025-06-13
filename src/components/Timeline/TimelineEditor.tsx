import React, { useRef, useState } from "react";
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
  const [timelineHeight, setTimelineHeight] = useState(300);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = timelineHeight;

    document.body.style.cursor = "row-resize";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientY - startY.current;
    const newHeight = Math.max(150, startHeight.current - delta);

    setTimelineHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={style.timelineWrapper} data-tour="timeline">
      <button
        className={style.resizeHandle}
        onMouseDown={handleMouseDown}
        aria-label="Resize timeline editor"
      >
        ↕
      </button>
      <div
        className={style.timelineEditorContainer}
        style={{ height: timelineHeight }}
        data-tour="timeline"
      >
        <div className={style.timelineControlSticky}>
          <TimelineControl />
          <TimelineHeader />
        </div>

        <div className={`${style.timelineBody} ${style.scrole}`}>
          <DndProvider backend={HTML5Backend}>
            <TimelineLayers onOpenLayerSettings={onOpenLayerSettings} />
          </DndProvider>
          <TimelineKeyframes />
        </div>
      </div>
    </div>
  );
};

export default TimelineEditor;

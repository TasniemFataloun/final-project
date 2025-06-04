import { Clock8 } from "lucide-react";
import style from "./TimelineHeader.module.css";
import { useAppSelector } from "../../../redux/store";
import React, { useMemo } from "react";
import { defaultLayerConfig } from "../../../config/importElementsProperties.config";

const TimelineHeader = () => {
  const { currentPosition } = useAppSelector((state) => state.animation);
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const selectedLayer = layers.find((l) => l.id == selectedLayerId)?.config;

  const formatTime = (position: number) => {
    const duration = selectedLayer
      ? selectedLayer.duration
      : defaultLayerConfig.duration;
    const currentTime = (position / 100) * duration;
    return currentTime.toFixed(2);
  };

  const renderTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= 20; i++) {
      const position = (i / 20) * 100;
      const check = i % 2 === 0;
      ticks.push(
        <React.Fragment key={i}>
          <div
            className={style.tick}
            style={{ left: `${position}%`, height: check ? "12px" : "6px" }}
          ></div>
          {check && (
            <div className={style.tickLabel} style={{ left: `${position}%` }}>
              {i * 5}
            </div>
          )}
        </React.Fragment>
      );
    }
    return ticks;
  }, []);

  return (
    <div className={style.timelineHeader}>
      <div className={style.currentProgressTime}>
        <span className={style.timeLable}>{Math.round(currentPosition)}%</span>
        <span className={style.timeLable}>
          <Clock8 size={16} />
          {formatTime(Math.round(currentPosition))}s
        </span>
      </div>
      <div className={style.rulerSection}>
        <div className={style.ruler}>{renderTicks}</div>
      </div>
    </div>
  );
};

export default TimelineHeader;

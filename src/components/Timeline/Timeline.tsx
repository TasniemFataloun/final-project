import { useDispatch } from "react-redux";
import style from "./Timeline.module.css";
import { useAppSelector } from "../../redux/store";
import {
  setSelectedKeyframe,
  toggleLayer,
} from "../../redux/slices/timelineSlice";
import { getCurrentConfig } from "../../utils/UseGetCurrentConfig";

const Timeline = () => {
  const dispatch = useDispatch();
  const { openLayers } = useAppSelector((state) => state.timeline);
  const { elements } = useAppSelector((state) => state.elements);

  const seconds = Array.from({ length: 7 }, (_, i) => i * 10);

  const handleKeyframeClick = (type: "default" | "current") => {
    dispatch(setSelectedKeyframe(type));
  };

  return (
    <div className={style.container}>
      <div className={style.sidebar}>
        <div className={style.layerItem}></div>
        {elements.map((layer) => (
          <div
            key={layer.id}
            className={`${style.layerItem} ${
              openLayers[layer.id] ? style.layerItemOpen : ""
            }`}
            onClick={() => dispatch(toggleLayer(layer.id))}
          >
            <span className={style.arrow}>
              {openLayers[layer.id] ? "▼" : "▶"}
            </span>
            {getCurrentConfig(layer, "default").type}
          </div>
        ))}
      </div>

      <div className={style.timelineArea}>
        <div className={style.timeRuler}>
          {seconds.map((sec) => (
            <div key={sec} className={style.timeTick}>
              {sec}s
            </div>
          ))}
        </div>

        {elements.map((layer) => (
          <div
            key={layer.id}
            className={`${style.trackRow} ${
              openLayers[layer.id] ? style.openTrackRow : ""
            }`}
          >
            {openLayers[layer.id] && (
              <div className={style.keyframesContainer}>
                <img
                  src="./keyframe.png"
                  alt=""
                  className={style.keyframe}
                  onClick={() => handleKeyframeClick("default")}
                />
                <img
                  src="./keyframe.png"
                  alt=""
                  className={style.keyframe}
                  onClick={() => handleKeyframeClick("current")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

import React, { useEffect } from "react";
import style from "./TimelineLayers.module.css";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  removeLayer,
  setSelectedLayer,
  updateLayer,
} from "../../../redux/slices/animationSlice";
import {
  setRemoveKeyframe,
  toggleLayer,
  togglePropertyGroup,
} from "../../../redux/slices/timelineSlice";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";

const TimelineLayers = () => {
  const dispatch = useAppDispatch();
  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const { expandedLayers, expandedProperties } = useAppSelector(
    (state) => state.timeline
  );
  
  useEffect(() => {
    layers.forEach((layer) => {
      if (
        (layer.editedPropertiesGroup?.length ?? 0) > 0 &&
        !expandedLayers[layer.id]
      ) {
        dispatch(toggleLayer(layer.id));
      }
    });
  }, [layers, dispatch]);

  return (
    <>
      <div className={style.layerList}>
        {layers.map((layer) => (
          <React.Fragment key={layer.id}>
            {/* Layer Header */}
            <div
              className={`${style.row} ${style.layerHeader} ${
                selectedLayerId === layer.id ? ` ${style.selectedLayer}` : ""
              }`}
              onClick={() => dispatch(setSelectedLayer(layer.id))}
            >
              <button
                className={style.layerButtons}
                onClick={() => dispatch(toggleLayer(layer.id))}
              >
                {(layer.editedPropertiesGroup?.length ?? 0) > 0 &&
                  (expandedLayers[layer.id] ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  ))}
              </button>
              <button
                className={`${style.layerButtons} ${
                  !layer.visible && style.iconAction
                }`}
                onClick={() =>
                  dispatch(
                    updateLayer({
                      id: layer.id,
                      updates: { visible: !layer.visible },
                    })
                  )
                }
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                className={`${style.layerButtons} ${
                  layer.locked && style.iconAction
                }`}
                onClick={() =>
                  dispatch(
                    updateLayer({
                      id: layer.id,
                      updates: { locked: !layer.locked },
                    })
                  )
                }
              >
                {layer.locked ? <Lock size={14} /> : <LockOpen size={14} />}
              </button>
              <div
                className={style.layerName}
                onClick={() => dispatch(setSelectedLayer(layer.id))}
              >
                {layer.name}
              </div>
              <button
                className={style.deleteButton}
                onClick={() => dispatch(removeLayer(layer.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Properties */}

            {expandedLayers[layer.id] && (
              <div className={style.LayerProperties}>
                {layer.editedPropertiesGroup?.map((group) => {
                  return (
                    <React.Fragment key={group.name}>
                      <div key={group.name} className={style.propertyGroup}>
                        {/*  <div
                          className={`${style.row} ${style.propertyGroupHeader}`}
                          onClick={() =>
                            dispatch(
                              togglePropertyGroup({
                                layerId: layer.id,
                                groupName: group.name,
                              })
                            )
                          }
                        >
                          {isGroupExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                          <span className={style.propertyGroupHeaderLabel}>
                            {group.name}
                          </span>
                        </div> */}
                        {/* {isGroupExpanded && ( */}
                        <div>
                          {group.propertiesList.map((prop) => (
                            <div
                              key={prop.propertyName}
                              className={style.propertyRow}
                            >
                              <div
                                className={`${style.row} ${style.propertyRowHeader}`}
                              >
                                <div className={style.propertyLabel}>
                                  {prop.propertyName}
                                </div>

                                <button
                                  className={style.deleteButton}
                                  onClick={() => {
                                    console.log(
                                      `Property ${prop.keyframes.map(
                                        (kf) => kf.id
                                      )} deleted`
                                    );
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className={style.propertyRowKayframes}></div>
                            </div>
                          ))}
                        </div>
                        {/*  )} */}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default TimelineLayers;

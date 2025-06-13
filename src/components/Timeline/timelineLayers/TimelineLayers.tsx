import React, { useEffect } from "react";
import style from "./TimelineLayers.module.css";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import {
  duplicateLayer,
  lockLayer,
  removeLayer,
  removeSelectedKeyframe,
  renameLayer,
  setSelectedLayer,
  updateLayer,
  updateLayerOrder,
} from "../../../redux/slices/animationSlice";
import { toggleLayer } from "../../../redux/slices/timelineSlice";
import {
  ChevronDown,
  ChevronRight,
  CopyPlus,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Settings2,
  Trash2,
} from "lucide-react";
import { setEditMode } from "../../../redux/slices/editModeSlice";
import DraggableLayer from "./DraggableLayar";

type TimelineLayersProps = {
  onOpenLayerSettings: () => void;
};

const TimelineLayers: React.FC<TimelineLayersProps> = ({
  onOpenLayerSettings,
}) => {
  const dispatch = useAppDispatch();
  const editMode = useAppSelector((state) => state.editMode.value);

  const { layers, selectedLayerId } = useAppSelector(
    (state) => state.animation
  );
  const { expandedLayers } = useAppSelector((state) => state.timeline);
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.selectedKeyframe
  );

  const moveLayer = (fromIndex: number, toIndex: number) => {
    const updatedLayers = [...layers];
    const [removed] = updatedLayers.splice(fromIndex, 1);
    updatedLayers.splice(toIndex, 0, removed);
    dispatch(updateLayerOrder(updatedLayers)); // update Redux
  };

  useEffect(() => {
    const selected = layers.find((layer) => layer.id === selectedLayerId);
    if (
      selected &&
      (selected.editedPropertiesGroup?.length ?? 0) > 0 &&
      !expandedLayers[selected.id]
    ) {
      dispatch(toggleLayer(selected.id));
    }
  }, [layers, selectedLayerId, dispatch]);

  return (
    <div className={style.layerList} data-tour="timeline-layer-row">
      {[...layers]
        .slice()
        .reverse()
        .map((layer, index) => {
          return (
            <DraggableLayer
              key={layer.id}
              layer={layer}
              index={index}
              moveLayer={moveLayer}
              selectedLayerId={selectedLayerId}
              onSelectLayer={(id: string) => dispatch(setSelectedLayer(id))}
            >
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
                    dispatch(lockLayer({ id: layer.id, locked: !layer.locked }))
                  }
                >
                  {layer.locked ? <Lock size={14} /> : <LockOpen size={14} />}
                </button>

                <div
                  className={style.layerName}
                  onClick={() => dispatch(setSelectedLayer(layer.id))}
                >
                  <input
                    type="text"
                    className={style.layerNameInput}
                    value={layer.type === "code" ? layer.selector : layer.name}
                    onChange={(e) =>
                      dispatch(
                        renameLayer({ id: layer.id, newName: e.target.value })
                      )
                    }
                  />
                </div>

                <button
                  className={style.layerButtons}
                  onClick={() => dispatch(duplicateLayer(layer.id))}
                  title="Duplicate Layer"
                >
                  <CopyPlus size={14} />
                </button>

                <Settings2
                  size={14}
                  onClick={() => {
                    onOpenLayerSettings();
                    dispatch(
                      setEditMode(
                        editMode === "timeline" ? "class" : "timeline"
                      )
                    );
                  }}
                  className={editMode === "timeline" ? "active" : ""}
                />

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
                  {layer.editedPropertiesGroup?.map(
                    (prop: { propertyName: string }) => (
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
                          {selectedKeyframe?.layerId &&
                            selectedKeyframe?.property &&
                            selectedKeyframe?.keyframe && (
                              <button
                                className={style.deleteButton}
                                onClick={() => {
                                  dispatch(removeSelectedKeyframe());
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                        </div>

                        <div className={style.propertyRowKeyframes}></div>
                      </div>
                    )
                  )}
                </div>
              )}
            </DraggableLayer>
          );
        })}
    </div>
  );
};

export default TimelineLayers;

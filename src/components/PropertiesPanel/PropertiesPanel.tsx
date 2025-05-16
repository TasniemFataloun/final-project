import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { propertiesSchema } from "../../config/propertiespanel.config";
import ColorPicker from "../ColorPicker/ColorPicker";
import { useState } from "react";
import { PanelRightClose } from "lucide-react";
import { addKeyframe, setConfig } from "../../redux/slices/animationSlice";
import { toggleLayer } from "../../redux/slices/timelineSlice";

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const { selectedLayerId, layers, currentPosition } = useAppSelector(
    (state) => state.animation
  );

  const selectedLayer = layers.find((el) => el.id === selectedLayerId);
  const selectedLayerConfig = selectedLayer?.config;
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.selectedKeyframe
  );

  const handleTogglePropertiesPanel = () => {
    setIsPropertiesPanelOpen((prev) => !prev);
  };

  // Handle changes in the properties panel
  const handlePropertyChange = (
    propertyName: string,
    newValue: any,
    groupName: string
  ) => {
    if (!selectedLayerId) return;

    dispatch(
      setConfig({
        section: groupName,
        field: propertyName,
        value: newValue,
      })
    );

    dispatch(
      addKeyframe({
        layerId: selectedLayerId,
        groupName,
        propertyName,
        percentage: Math.round(currentPosition),
        value: newValue,
      })
    );

    dispatch(toggleLayer(selectedLayerId));
  };

  return (
    <aside
      className={` ${style.container} ${
        isPropertiesPanelOpen ? style.openContainer : style.closeContainer
      }`}
    >
      <div className={style.iconh2}>
        <button
          onClick={handleTogglePropertiesPanel}
          className={style.iconClosePanel}
        >
          <PanelRightClose color="var(--white)" />
        </button>
        {isPropertiesPanelOpen ? <h2>Properties</h2> : ""}
      </div>

      {isPropertiesPanelOpen && (
        <>
          {Object.entries(propertiesSchema).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className={style.section}>
              <h3>{sectionData.title}</h3>
              <div className={style.optionsContainer}>
                {Object.entries(sectionData.fields).map(
                  ([fieldKey, fieldProps]) => {
                    const keyframeValue = (() => {
                      if (!selectedKeyframe || !selectedLayer) return undefined;

                      if (selectedKeyframe.property !== fieldKey)
                        return undefined;

                      const group = selectedLayer.editedPropertiesGroup?.find(
                        (g) =>
                          g.propertiesList.some(
                            (p) => p.propertyName === fieldKey
                          )
                      );
                      if (!group) return undefined;

                      const property = group.propertiesList.find(
                        (p) => p.propertyName === fieldKey
                      );
                      if (!property) return undefined;

                      const keyframe = property.keyframes.find(
                        (kf) => kf.id === selectedKeyframe.keyframeId
                      );
                      if (!keyframe) return undefined;

                      return keyframe.value;
                    })();

                    const configValue =
                      selectedLayerConfig?.[
                        sectionKey as keyof typeof selectedLayerConfig
                      ]?.[fieldKey];

                    console.log("keyframeValue", keyframeValue);

                    const currentValue = keyframeValue ?? configValue ?? "";

                    return (
                      <div className={style.option} key={fieldKey}>
                        <label className={style.label}>
                          {fieldProps.label}
                        </label>

                        {fieldProps.type === "select" ? (
                          <select
                            value={currentValue}
                            onChange={(e) =>
                              handlePropertyChange(
                                fieldKey,
                                e.target.value,
                                sectionKey
                              )
                            }
                            className={style.input}
                          >
                            {"options" in fieldProps &&
                              (fieldProps.options as string[]).map(
                                (opt: string) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                )
                              )}
                          </select>
                        ) : fieldProps.type === "color" ? (
                          <ColorPicker
                            color={currentValue}
                            onChange={() => console.log("color")}
                          />
                        ) : (
                          <input
                            type={fieldProps.type}
                            value={currentValue}
                            step={
                              fieldProps.type === "number" &&
                              "step" in fieldProps
                                ? (fieldProps.step as
                                    | string
                                    | number
                                    | undefined)
                                : undefined
                            }
                            min={
                              fieldProps.type === "number" &&
                              "min" in fieldProps
                                ? (fieldProps.min as
                                    | string
                                    | number
                                    | undefined)
                                : undefined
                            }
                            max={
                              fieldProps.type === "number" &&
                              "max" in fieldProps
                                ? (fieldProps.max as
                                    | string
                                    | number
                                    | undefined)
                                : undefined
                            }
                            onChange={(e) =>
                              handlePropertyChange(
                                fieldKey,
                                e.target.value,
                                sectionKey
                              )
                            }
                            className={style.input}
                          />
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </aside>
  );
};

export default PropertiesPanel;

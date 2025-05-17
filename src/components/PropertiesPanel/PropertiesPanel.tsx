import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  ConfigSchema,
  propertiesSchema,
} from "../../config/propertiespanel.config";
import ColorPicker from "../ColorPicker/ColorPicker";
import { useState } from "react";
import { PanelRightClose } from "lucide-react";
import {
  addKeyframe,
  setConfig,
  updatePropertyValue,
} from "../../redux/slices/animationSlice";

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const { selectedLayerId, layers, currentPosition } = useAppSelector(
    (state) => state.animation
  );

  const selectedLayer = layers.find((el) => el.id === selectedLayerId);

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
      updatePropertyValue({
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
  };

  const handleConfigChange = (
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
          {Object.entries(ConfigSchema).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className={style.section}>
              <h3>{sectionData.title}</h3>
              <div className={style.optionsContainer}>
                {Object.entries(sectionData.fields).map(
                  ([fieldKey, fieldProps]) => {
                    const configValue = selectedLayer?.config?.[fieldKey];
                    return (
                      <div className={style.option} key={fieldKey}>
                        <label className={style.label}>
                          {fieldProps.label}
                        </label>

                        {fieldProps.type === "select" ? (
                          <select
                            value={configValue}
                            onChange={(e) =>
                              handleConfigChange(
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
                        ) : (
                          <input
                            type={fieldProps.type}
                            value={configValue}
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
                              handleConfigChange(
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
          {Object.entries(propertiesSchema).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className={style.section}>
              <h3>{sectionData.title}</h3>
              <div className={style.optionsContainer}>
                {Object.entries(sectionData.fields).map(
                  ([fieldKey, fieldProps]) => {
                    const selectedLayerConfig = selectedLayer?.layerPropertiesValue;
                    const layerPropsValue =
                      selectedLayerConfig?.[
                        sectionKey as keyof typeof selectedLayerConfig
                      ]?.[fieldKey];

                    return (
                      <div className={style.option} key={fieldKey}>
                        <label className={style.label}>
                          {fieldProps.label}
                        </label>

                        {fieldProps.type === "select" ? (
                          <select
                            value={layerPropsValue}
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
                        ) : (
                          <input
                            type={fieldProps.type}
                            value={layerPropsValue}
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

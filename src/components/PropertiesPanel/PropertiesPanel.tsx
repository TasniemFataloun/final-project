import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  ConfigSchema,
  propertiesSchema,
} from "../../config/propertiespanel.config";
import { useState } from "react";
import { ChevronDown, ChevronRight, PanelRightClose } from "lucide-react";
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

  const [openSections, setOpenSections] = useState<string[]>([]);

  const selectedLayer = layers.find((el) => el.id === selectedLayerId);

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

  const getValueAtCurrentPosition = (
    propertyName: string,
    groupName: string
  ): string | number | undefined => {
    if (!selectedLayer) return;

    const group = selectedLayer.editedPropertiesGroup?.find(
      (g) => g.name === groupName
    );
    const prop = group?.propertiesList.find(
      (p) => p.propertyName === propertyName
    );
    if (!prop) return;

    // Find closest keyframe at or before current position
    const keyframes = [...prop.keyframes].sort(
      (a, b) => b.percentage - a.percentage
    );
    const keyframe = keyframes.find((kf) => kf.percentage === currentPosition);

    return keyframe?.value;
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
          {Object.entries(ConfigSchema).map(([sectionKey, sectionData]) => {
            const isOpen = openSections.includes(sectionKey);

            const toggleSection = () => {
              setOpenSections((prev) =>
                isOpen
                  ? prev.filter((key) => key !== sectionKey)
                  : [...prev, sectionKey]
              );
            };

            return (
              <div key={sectionKey} className={style.section}>
                <div className={style.chevronH3} onClick={toggleSection}>
                  {isOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <h3>{sectionData.title}</h3>
                </div>

                {isOpen && (
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
                )}
              </div>
            );
          })}

          {Object.entries(propertiesSchema).map(([sectionKey, sectionData]) => {
            const isOpen = openSections.includes(sectionKey);

            const toggleSection = () => {
              setOpenSections((prev) =>
                isOpen
                  ? prev.filter((key) => key !== sectionKey)
                  : [...prev, sectionKey]
              );
            };

            return (
              <div key={sectionKey} className={style.section}>
                <div
                  className={style.chevronH3}
                  onClick={toggleSection}
                  style={{ cursor: "pointer" }}
                >
                  {isOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <h3>{sectionData.title}</h3>
                </div>

                {isOpen && (
                  <div className={style.optionsContainer}>
                    {Object.entries(sectionData.fields).map(
                      ([fieldKey, fieldProps]) => {
                        const selectedLayerConfig =
                          selectedLayer?.layerPropertiesValue;
                        const section = selectedLayerConfig?.[sectionKey];

                        const layerPropsValue =
                          typeof section === "string"
                            ? section
                            : section?.[fieldKey];
                        return (
                          <div className={style.option} key={fieldKey}>
                            <label className={style.label}>
                              {fieldProps.label}
                            </label>

                            {fieldProps.type === "select" ? (
                              <select
                                value={
                                  getValueAtCurrentPosition(
                                    fieldKey,
                                    sectionKey
                                  ) ?? layerPropsValue
                                }
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
                                value={
                                  getValueAtCurrentPosition(
                                    fieldKey,
                                    sectionKey
                                  ) ?? layerPropsValue
                                }
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
                )}
              </div>
            );
          })}
        </>
      )}
    </aside>
  );
};
export default PropertiesPanel;

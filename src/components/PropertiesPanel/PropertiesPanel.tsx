import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  ConfigSchema,
  propertiesSchema,
} from "../../config/propertiespanel.config";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, PanelRightClose } from "lucide-react";
import {
  addKeyframe,
  setConfig,
  updateLayer,
  updatePropertyValue,
} from "../../redux/slices/animationSlice";
import { parseTransform } from "../Canvas/Canvas";

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const { selectedLayerId, layers, currentPosition } = useAppSelector(
    (state) => state.animation
  );
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.selectedKeyframe
  );
  const selectedLayer = layers.find((el) => el.id === selectedLayerId);

  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedKeyframe?.property) return;
    let containingSectionKey: string | undefined;

    // Search in propertiesSchema because properties live there
    for (const [sectionKey, sectionData] of Object.entries(propertiesSchema)) {
      if (sectionData.fields.hasOwnProperty(selectedKeyframe.property)) {
        containingSectionKey = sectionKey;
        break;
      }
    }

    if (!containingSectionKey) return;

    // If section not already open, open it
    setOpenSections((prev) => {
      if (!prev.includes(containingSectionKey!)) {
        return [...prev, containingSectionKey!];
      }
      return prev;
    });
  }, [selectedKeyframe]);

  const handleTogglePropertiesPanel = () => {
    setIsPropertiesPanelOpen((prev) => !prev);
  };

  // Handle changes in the properties panel
  const handlePropertyChange = (
    propertyName: string,
    newValue: any,
    groupName: string
  ) => {
    if (!selectedLayerId || !selectedLayer) return;

    // For transform properties
    if (groupName === "transform") {
      const currentTransform = parseTransform(
        selectedLayer.style?.transform || ""
      );

      // Preserve all transform properties
      const newTransform = {
        ...currentTransform,
        [propertyName]: newValue,
      };

      // Convert back to transform string
      const transformString = `translate(${newTransform.translateX || 0}px, ${
        newTransform.translateY || 0
      }px)`;

      dispatch(
        updateLayer({
          id: selectedLayerId,
          updates: {
            style: {
              ...selectedLayer.style,
              transform: transformString,
            },
          },
        })
      );
    }
    // For regular style properties
    else {
      dispatch(
        updateLayer({
          id: selectedLayerId,
          updates: {
            style: {
              ...selectedLayer.style,
              [propertyName]: newValue,
            },
          },
        })
      );
    }

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
    propertyName: string
  ): string | number | undefined => {
    if (!selectedLayer) return;

    // Check if property exists in current style
    if (selectedLayer.style?.[propertyName] !== undefined) {
      return selectedLayer.style[propertyName];
    }

    // Check for keyframes
    const prop = selectedLayer?.editedPropertiesGroup?.find(
      (p) => p.propertyName === propertyName
    );

    if (!prop)
      return propertyName.includes("color")
        ? "#000000"
        : propertyName === "opacity"
        ? 1
        : propertyName === "borderRadius"
        ? "0"
        : "0px";

    const keyframes = [...prop.keyframes].sort(
      (a, b) => a.percentage - b.percentage
    );

    // Find the most recent keyframe at or before current position
    let activeKeyframe;
    for (const kf of keyframes) {
      if (kf.percentage <= currentPosition) {
        activeKeyframe = kf;
      } else {
        break;
      }
    }

    return (
      activeKeyframe?.value ||
      prop.keyframes[0]?.value ||
      (propertyName.includes("translate") ? "0px" : 0)
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
        {isPropertiesPanelOpen ? (
          <h2>{`Properties ${
            selectedLayer?.name ? ` ${selectedLayer.name}` : ""
          }`}</h2>
        ) : (
          ""
        )}
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

            const selectedKeyframeProperty = selectedKeyframe?.property;

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
                        return (
                          <div className={style.option} key={fieldKey}>
                            <label className={style.label}>
                              {fieldProps.label}
                            </label>

                            {fieldProps.type === "select" ? (
                              <select
                                value={getValueAtCurrentPosition(fieldKey)}
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
                                value={getValueAtCurrentPosition(fieldKey)}
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
                                className={`${style.input} ${
                                  (selectedLayer?.editedPropertiesGroup
                                    ?.length ?? 0) > 0 &&
                                  selectedKeyframeProperty === fieldKey
                                    ? style.selectedKeyframeProperty
                                    : ""
                                }`}
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

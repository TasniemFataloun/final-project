import style from "./PropertiesMenu.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import {
  ConfigSchema,
  propertiesSchema,
} from "../../config/PropertiesMenu.config";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  PanelRightClose,
  Pipette,
} from "lucide-react";
import {
  addKeyframe,
  setConfig,
  setSelectedKeyframe,
  updateKeyframe,
} from "../../redux/slices/animationSlice";
import {
  defaultUnits,
  getAllowedUnits,
} from "../../config/defaultUnits.config";

const PropertiesMenu = () => {
  const dispatch = useAppDispatch();
  const [isPropertiesMenuOpen, setIsPropertiesMenuOpen] = useState(true);
  const { selectedLayerId, layers, currentPosition } = useAppSelector(
    (state) => state.animation.present
  );
  const selectedKeyframe = useAppSelector(
    (state) => state.animation.present.selectedKeyframe
  );
  const selectedLayer = layers.find((el) => el.id === selectedLayerId);

  const [openSections, setOpenSections] = useState<string[]>([]);
  // track unit selections for each property
  const [unitSelections, setUnitSelections] = useState<Record<string, string>>(
    () => {
      const defaults: Record<string, string> = {};
      Object.entries(propertiesSchema).forEach(([_, sectionData]) => {
        Object.keys(sectionData.fields).forEach((fieldKey) => {
          defaults[fieldKey] =
            defaultUnits[fieldKey] || defaultUnits["default"] || "";
        });
      });
      return defaults;
    }
  );

  useEffect(() => {
    //if selected keyframe --> open its folder
    if (selectedKeyframe && selectedLayer) {
      const propertySection = Object.keys(propertiesSchema).find((sectionKey) =>
        Object.keys(
          propertiesSchema[sectionKey as keyof typeof propertiesSchema].fields
        ).includes(selectedKeyframe.property)
      );

      if (propertySection && !openSections.includes(propertySection)) {
        setOpenSections((prev) => [...prev, propertySection]);
      }
    } else {
      // If no keyframe is selected, close all sections
      setOpenSections([]);
    }
  }, [selectedKeyframe]);

  // Handle changes in the properties panel
  const handlePropertyChange = (propertyName: string, newValue: any) => {
    if (!selectedLayerId || !selectedLayer) return;

    const percentage = Math.round(currentPosition);
    const unit =
      unitSelections[propertyName] ||
      defaultUnits[propertyName] ||
      defaultUnits["default"] ||
      "";

    const property = selectedLayer.editedPropertiesGroup?.find(
      (p) => p.propertyName === propertyName
    );

    const existingKeyframe = property?.keyframes.find(
      (kf) => kf.percentage === percentage
    );
    if (existingKeyframe) {
      dispatch(
        updateKeyframe({
          layerId: selectedLayerId,
          propertyName,
          keyframe: {
            ...existingKeyframe,
            value: newValue.trim() === "" ? "0" : newValue,
          },
        })
      );
    } else {
      dispatch(
        addKeyframe({
          layerId: selectedLayerId,
          propertyName,
          percentage,
          value: newValue.trim() === "" ? "0" : newValue,
          unit,
        })
      );
    }
    const newKeyframeId = `${propertyName}-${percentage}`;
    const newKeyframe = {
      id: newKeyframeId,
      value: newValue.trim() === "" ? "0" : newValue,
      unit: unit,
      percentage,
    };

    dispatch(
      setSelectedKeyframe({
        layerId: selectedLayerId,
        property: propertyName,
        keyframe: newKeyframe,
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
        value: newValue.trim() === "" ? "0" : newValue,
      })
    );
  };

  const getValueAtCurrentPosition = (
    propertyName: string
  ): string | number | undefined => {
    if (!selectedLayer) return;

    // Check for keyframes
    const prop = selectedLayer?.editedPropertiesGroup?.find(
      (p) => p.propertyName === propertyName
    );

    if (!prop) return propertyName.includes("color") ? "#000000" : "";

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

  // Update selected keyframe when current position changes
  useEffect(() => {
    if (!selectedKeyframe || !selectedLayerId) return;

    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer) return;

    const prop = layer.editedPropertiesGroup?.find(
      (p) => p.propertyName === selectedKeyframe.property
    );
    if (!prop) return;

    const keyframe = prop.keyframes.find(
      (kf) => kf.percentage === Math.round(currentPosition)
    );
    if (!keyframe) return;

    dispatch(
      setSelectedKeyframe({
        layerId: selectedLayerId,
        property: selectedKeyframe.property,
        keyframe: keyframe,
      })
    );
  }, [
    layers,
    selectedKeyframe?.property,
    currentPosition,
    selectedLayerId,
    dispatch,
  ]);

  return (
    <aside
      data-tour="properties-panel-sidebar"
      className={` ${style.sidebarContainer} ${
        isPropertiesMenuOpen ? style.openContainer : style.closeContainer
      }`}
    >
      <div className={style.containerScroll}>
        <button
          onClick={() => setIsPropertiesMenuOpen((prev) => !prev)}
          className={style.iconClosePanel}
          aria-expanded={isPropertiesMenuOpen}
          aria-label={
            isPropertiesMenuOpen
              ? "Close properties panel"
              : "Open properties panel"
          }
        >
          <PanelRightClose size={14} />
        </button>

        <div className={style.iconh2}>
          {isPropertiesMenuOpen && (
            <h2>{`Properties ${
              selectedLayer?.name ? ` ${selectedLayer.name}` : ""
            }`}</h2>
          )}
        </div>

        {/* Scrollable content area */}
        {isPropertiesMenuOpen && (
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
                <div
                  key={sectionKey}
                  className={style.section}
                  data-tour="properties-panel-config"
                >
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
                                  value={configValue ?? ""}
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
                                  value={configValue ?? ""}
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

            {Object.entries(propertiesSchema).map(
              ([sectionKey, sectionData]) => {
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
                  <div
                    key={sectionKey}
                    className={style.section}
                    data-tour="properties-panel-properties"
                  >
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
                                <div className={style.propertyAndUnitContainer}>
                                  {fieldProps.type === "select" ? (
                                    <select
                                      value={
                                        getValueAtCurrentPosition(fieldKey) ??
                                        ""
                                      }
                                      onChange={(e) =>
                                        handlePropertyChange(
                                          fieldKey,
                                          e.target.value
                                        )
                                      }
                                      className={style.input}
                                      data-property-input="true"
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
                                    <>
                                      {fieldProps.type === "color" ? (
                                        <div
                                          className={style.colorInputWrapper}
                                        >
                                          <div
                                            className={
                                              style.colorAndTransparentWrapper
                                            }
                                          >
                                            <input
                                              type="color"
                                              value={
                                                getValueAtCurrentPosition(
                                                  fieldKey
                                                ) === "transparent" ||
                                                !getValueAtCurrentPosition(
                                                  fieldKey
                                                )
                                                  ? "#000000"
                                                  : getValueAtCurrentPosition(
                                                      fieldKey
                                                    )
                                              }
                                              onChange={(e) =>
                                                handlePropertyChange(
                                                  fieldKey,
                                                  e.target.value
                                                )
                                              }
                                              onChange={(e) =>
                                                handlePropertyChange(
                                                  fieldKey,
                                                  e.target.value
                                                )
                                              }
                                              className={`${style.colorInput} ${
                                                (selectedLayer
                                                  ?.editedPropertiesGroup
                                                  ?.length ?? 0) > 0 &&
                                                selectedKeyframeProperty ===
                                                  fieldKey
                                                  ? style.selectedKeyframeProperty
                                                  : ""
                                              }`}
                                              data-property-input="true"
                                            />

                                            {/* Transparent button */}
                                            <button
                                              onClick={() =>
                                                handlePropertyChange(
                                                  fieldKey,
                                                  "transparent"
                                                )
                                              }
                                              className={
                                                style.transparentButton
                                              }
                                              title="Transparent"
                                            >
                                              Transparent
                                              <div
                                                className={
                                                  style.transparentSwatch
                                                }
                                              />
                                            </button>
                                          </div>
                                          <Pipette
                                            size={15}
                                            className={style.pipetteIcon}
                                          />
                                        </div>
                                      ) : (
                                        <input
                                          type={fieldProps.type}
                                          value={
                                            getValueAtCurrentPosition(
                                              fieldKey
                                            ) ?? ""
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
                                              e.target.value
                                            )
                                          }
                                          className={`${style.input} ${
                                            (selectedLayer
                                              ?.editedPropertiesGroup?.length ??
                                              0) > 0 &&
                                            selectedKeyframeProperty ===
                                              fieldKey
                                              ? style.selectedKeyframeProperty
                                              : ""
                                          }`}
                                          data-property-input="true"
                                        />
                                      )}
                                      {getAllowedUnits(fieldKey).length > 0 && (
                                        <select
                                          value={
                                            selectedKeyframe?.property ===
                                            fieldKey
                                              ? selectedKeyframe?.keyframe?.unit
                                              : unitSelections[fieldKey] || ""
                                          }
                                          onChange={(e) => {
                                            const unit = e.target.value;
                                            setUnitSelections((prev) => ({
                                              ...prev,
                                              [fieldKey]: unit,
                                            }));

                                            if (!selectedLayerId) return;

                                            if (
                                              selectedKeyframe?.property ===
                                              fieldKey
                                            ) {
                                              dispatch(
                                                updateKeyframe({
                                                  layerId: selectedLayerId,
                                                  propertyName:
                                                    selectedKeyframe.property,
                                                  keyframe: {
                                                    ...selectedKeyframe.keyframe,
                                                    unit,
                                                  },
                                                })
                                              );
                                            }
                                          }}
                                          className={style.unitSelect}
                                        >
                                          {getAllowedUnits(fieldKey).map(
                                            (unit) => (
                                              <option key={unit} value={unit}>
                                                {unit}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </>
        )}
      </div>
    </aside>
  );
};
export default PropertiesMenu;

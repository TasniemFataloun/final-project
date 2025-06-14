import style from "../PropertiesMenu/PropertiesMenu.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { styleConfig } from "../../types/animationType";
import { setLayerConfigSettings } from "../../redux/slices/animationSlice";
import { useState, useEffect } from "react";
import { getAllowedUnits } from "../../config/defaultUnits.config";
import { Pipette } from "lucide-react";
import { propertiesSchema } from "../../config/PropertiesMenu.config";
import { setEditMode } from "../../redux/slices/editModeSlice";

const LayerConfigSetting = () => {
  const dispatch = useAppDispatch();
  const editMode = useAppSelector((state) => state.editMode.value);
  const selectedLayerId = useAppSelector(
    (state) => state.animation.present.selectedLayerId
  );
  const selectedLayer = useAppSelector((state) =>
    state.animation.present.layers.find((layer) => layer.id === selectedLayerId)
  );
  const [unitSelections, setUnitSelections] = useState<Record<string, string>>(
    {}
  );
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [borderValues, setBorderValues] = useState({
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#000000",
  });
  const formValues = selectedLayer?.style;
  const extractValueAndUnit = (str: string) => {
    const match = str.match(/^(-?\d*\.?\d+)([a-z%]*)$/);
    if (match) {
      return { value: match[1], unit: match[2] };
    }
    return { value: str, unit: "" };
  };

  const [transformValues, setTransformValues] = useState({
    scale: "1",
    rotate: "0",
    translateX: "0",
    translateY: "0",
  });

  useEffect(() => {
    if (formValues?.transform) {
      const scaleMatch = formValues.transform.match(/scale\(([^)]+)\)/);
      const rotateMatch = formValues.transform.match(/rotate\(([^)]+)deg\)/);
      const translateXMatch = formValues.transform.match(
        /translateX\(([^)]+)px\)/
      );
      const translateYMatch = formValues.transform.match(
        /translateY\(([^)]+)px\)/
      );
      const translateMatch = formValues.transform.match(
        /translate\(([^)]+)px,\s*([^)]+)px\)/
      );

      const translateX = translateXMatch?.[1] ?? translateMatch?.[1] ?? "0";
      const translateY = translateYMatch?.[1] ?? translateMatch?.[2] ?? "0";

      setTransformValues({
        scale: scaleMatch?.[1] || "1",
        rotate: rotateMatch?.[1] || "0",
        translateX,
        translateY,
      });
    }
  }, [formValues?.transform]);

  useEffect(() => {
    if (!formValues) return;

    // build a map of existing units from formValues
    const initialUnits: Record<string, string> = {};
    Object.entries(formValues).forEach(([key, raw]) => {
      const { unit } = extractValueAndUnit(String(raw));
      if (unit) initialUnits[key] = unit;
    });
    if (!formValues?.border) return;
    const raw = formValues.border;
    const [, w, unit] = raw.match(/^(-?\d*\.?\d+)([a-z%]*)/) || [];
    const [, , , s, c] = raw.match(/^\d+[a-z%]*\s+(\w+)\s+(.+)$/) || [];

    setBorderValues({
      borderWidth: `${w}${unit}`,
      borderStyle: s,
      borderColor: c,
    });
    setUnitSelections(initialUnits);
  }, [formValues]);

  const handleChange = (
    key: keyof styleConfig,
    value: string,
    forceUnit?: string
  ) => {
    if (!selectedLayer || editMode !== "class") return;

    // Use the forced unit if provided, otherwise use the stored unit
    const unit = forceUnit || unitSelections[key] || "px";
    const final = getAllowedUnits(String(key)).length
      ? `${value}${unit}`
      : value;

    const newStyle: styleConfig = { ...selectedLayer.style };
    newStyle[key] = final;

    if (
      key === "borderWidth" ||
      key === "borderColor" ||
      key === "borderStyle"
    ) {
      const updated = { ...borderValues, [key]: value };
      if (key === "borderWidth") updated.borderWidth = `${value}${unit}`;
      setBorderValues(updated);

      dispatch(
        setLayerConfigSettings({
          layerId: selectedLayer.id,
          style: {
            ...newStyle,
            borderWidth: updated.borderWidth,
            borderStyle: updated.borderStyle,
            borderColor: updated.borderColor,
          },
        })
      );
    } else {
      dispatch(
        setLayerConfigSettings({
          layerId: selectedLayer.id,
          style: newStyle,
        })
      );
    }
  };

  const handleTransformChange = (
    key: keyof typeof transformValues,
    value: string,
    forceUnit?: string
  ) => {
    const updated = { ...transformValues, [key]: value };
    setTransformValues(updated);

    if (!selectedLayer || editMode !== "class") return;

    // Grab correct unit for each key
    const unitX = forceUnit || unitSelections.translateX || "px";
    const unitY = forceUnit || unitSelections.translateY || "px";
    const unitRotate = unitSelections.rotate || "deg";
    const unitScale = ""; // scale has no unit

    const transformString = `
    translateX(${updated.translateX || "0"}${unitX})
    translateY(${updated.translateY || "0"}${unitY})
    scale(${updated.scale || "1"}${unitScale})
    rotate(${updated.rotate || "0"}${unitRotate})
  `
      .trim()
      .replace(/\s+/g, " ");

    const newStyle: styleConfig = {
      ...selectedLayer.style,
      transform: transformString,
    };

    dispatch(
      setLayerConfigSettings({
        layerId: selectedLayer.id,
        style: newStyle,
      })
    );
  };

  return !formValues ? (
    <div className={style.sidebarContainer}>
      Select a Layer to see the setting
    </div>
  ) : (
    <div className={` ${style.openContainer}`} style={{ overflowY: "auto" }}>
      <div className={style.turnBack}>
        <button
          onClick={() => {
            dispatch(setLayerConfigSettings({ layerId: "", style: {} }));
            dispatch(setEditMode("timeline"));
          }}
          className={style.backButton}
        >
          ← Back to Properties
        </button>
      </div>
      {!formValues && <p>Select a Layer to see the setting</p>}
      <h2>Edit {selectedLayer?.name || "Layer"} Properties</h2>

      {selectedLayer?.type === "code" ? (
        Object.entries(formValues).map(([key, value]) => {
          const isColor = key.toLowerCase().includes("color");
          const isOpacity = key.toLowerCase() === "opacity";

          return (
            <h3 key={key}>
              {key}:
              <input
                type={isColor ? "color" : isOpacity ? "range" : "text"}
                min={isOpacity ? "0" : undefined}
                max={isOpacity ? "1" : undefined}
                step={isOpacity ? "0.01" : undefined}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
              {isOpacity && <span>{value}</span>}
            </h3>
          );
        })
      ) : (
        <>
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
                  <h3>{sectionData.title}</h3>
                </div>
                <div className={style.optionsContainer}>
                  {sectionKey === "transform" &&
                    Object.entries(sectionData.fields).map(
                      ([fieldKey, fieldProps]) => (
                        <div key={fieldKey} className={style.propertyGroup}>
                          <label>{fieldProps.label}</label>
                          <div className={style.propertyAndUnitContainer}>
                            <input
                              type="number"
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
                              value={
                                transformValues[
                                  fieldKey as keyof typeof transformValues
                                ]
                              }
                              onChange={(e) =>
                                handleTransformChange(
                                  fieldKey as keyof typeof transformValues,
                                  e.target.value
                                )
                              }
                              className={style.input}
                              data-property-input="true"
                            />

                            {getAllowedUnits(fieldKey).length > 0 && (
                              <select
                                value={unitSelections[fieldKey]}
                                onChange={(e) => {
                                  const newUnit = e.target.value;
                                  const currentValue =
                                    transformValues[
                                      fieldKey as keyof typeof transformValues
                                    ];

                                  setUnitSelections((prev) => ({
                                    ...prev,
                                    [fieldKey]: newUnit,
                                  }));

                                  handleTransformChange(
                                    fieldKey as keyof typeof transformValues,
                                    currentValue,
                                    newUnit
                                  );
                                }}
                              >
                                {getAllowedUnits(fieldKey).map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  {Object.entries(sectionData.fields)
                    .filter(() => sectionKey !== "transform")
                    .map(([fieldKey, fieldProps]) => {
                      const raw = String(formValues[fieldKey] ?? "");
                      const { value: numericValue } = extractValueAndUnit(raw);

                      return (
                        <div className={style.option} key={fieldKey}>
                          <label className={style.label}>
                            {fieldProps.label}
                          </label>
                          <div className={style.propertyAndUnitContainer}>
                            {fieldProps.type === "select" ? (
                              <select
                                onChange={(e) =>
                                  handleChange(
                                    fieldKey as keyof styleConfig,
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
                                  <div className={style.colorInputWrapper}>
                                    <input
                                      type="color"
                                      value={
                                        formValues[fieldKey] === "transparent"
                                          ? "#000000"
                                          : numericValue || "#000000"
                                      }
                                      onChange={(e) =>
                                        handleChange(
                                          fieldKey as keyof styleConfig,
                                          e.target.value
                                        )
                                      }
                                      className={`${style.colorInput}`}
                                      data-property-input="true"
                                    />
                                    <button
                                      className={style.transparentButton}
                                      onClick={() =>
                                        handleChange(
                                          fieldKey as keyof styleConfig,
                                          "transparent"
                                        )
                                      }
                                      title="Set to transparent"
                                    >
                                      Transparent
                                    </button>
                                    <Pipette size={15} />
                                  </div>
                                ) : (
                                  <input
                                    type={fieldProps.type}
                                    value={numericValue}
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
                                      handleChange(
                                        fieldKey as keyof styleConfig,
                                        e.target.value
                                      )
                                    }
                                    className={`${style.input}`}
                                    data-property-input="true"
                                  />
                                )}
                                {getAllowedUnits(fieldKey).length > 0 && (
                                  <select
                                    value={unitSelections[fieldKey]}
                                    onChange={(e) => {
                                      const newUnit = e.target.value;
                                      setUnitSelections((prev) => ({
                                        ...prev,
                                        [fieldKey]: newUnit,
                                      }));
                                      handleChange(
                                        fieldKey as keyof styleConfig,
                                        numericValue,
                                        newUnit
                                      );
                                    }}
                                  >
                                    {getAllowedUnits(fieldKey).map((unit) => (
                                      <option key={unit} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
export default LayerConfigSetting;

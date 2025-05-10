import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { updateElementConfig } from "../../redux/slices/elementsSlice";
import { propertiesSchema } from "../../config/propertiespanel.config";
import ColorPicker from "../ColorPicker/ColorPicker";
import { getSelectedConfig } from "../../utils/useGetConfig";
import { useState } from "react";
import { PanelRightClose } from "lucide-react";
getSelectedConfig
const PropertiesPanel = () => {
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const dispatch = useAppDispatch();
  const { selectedElementId, elements } = useAppSelector(
    (state) => state.elements
  );
  const { selectedKeyframe } = useAppSelector((state) => state.timeline);
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const defaultElementValue = selectedElement?.defaultConfig;
  const currentElementValue = selectedElement?.keyframes?.current ?? {};

  const handleTogglePropertiesPanel = () => {
    setIsPropertiesPanelOpen((prev) => !prev);
    console.log(isPropertiesPanelOpen);
  };

  const selectedConfig = getSelectedConfig(
    selectedKeyframe ?? "default",
    defaultElementValue ?? {},
    currentElementValue ?? {},
    selectedElement?.keyframes ?? {}
  );

  // Handle changes in the properties panel
  const handleChange = (section: string, key: string, value: string) => {
    if (!selectedElementId || !selectedKeyframe) return;

    // Get the current configuration for the selected keyframe
    const config = selectedConfig;

    // Make sure the section exists, and get the current section data
    const sectionConfig = config[section as keyof typeof config] as Record<
      string,
      string
    >;

    const updatedSection = {
      ...sectionConfig,
      [key]: value,
    };

    dispatch(
      updateElementConfig({
        id: selectedElementId,
        keyframe: selectedKeyframe,
        config: {
          ...config,
          [section]: updatedSection, // Only the section you're modifying gets updated
        },
      })
    );
  };

  return (
    <aside
      className={` ${style.container} ${
        isPropertiesPanelOpen ? style.openContainer : style.closeContainer
      }`}
    >
      <button onClick={handleTogglePropertiesPanel} className={style.iconClosePanel}>
        <PanelRightClose />
      </button>

      {isPropertiesPanelOpen && (
        <>
          <h2>Properties</h2>
          {Object.entries(propertiesSchema).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className={style.section}>
              <h3>{sectionData.title}</h3>
              <div className={style.optionsContainer}>
                {Object.entries(sectionData.fields).map(
                  ([fieldKey, fieldProps]) => {
                    const currentValue =
                      selectedConfig?.[
                        sectionKey as keyof typeof selectedConfig
                      ]?.[fieldKey] ?? "";

                    return (
                      <div className={style.option} key={fieldKey}>
                        <label className={style.label}>
                          {fieldProps.label}
                        </label>

                        {fieldProps.type === "select" ? (
                          <select
                            value={currentValue}
                            onChange={(e) =>
                              handleChange(sectionKey, fieldKey, e.target.value)
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
                            onChange={(newColor) =>
                              handleChange(sectionKey, fieldKey, newColor)
                            }
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
                              handleChange(sectionKey, fieldKey, e.target.value)
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

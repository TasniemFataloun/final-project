import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { updateElementConfig } from "../../redux/slices/elementsSlice";
import {
  defaultConfig,
  propertiesSchema,
} from "../../config/propertiespanel.config";
import ColorPicker from "../ColorPicker/ColorPicker";

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const { selectedElementId, elements } = useAppSelector(
    (state) => state.elements
  );
  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const config = selectedElement ? selectedElement.config : defaultConfig;

  const handleChange = (section: string, key: string, value: string) => {
    if (!selectedElementId) return;
  
    const sectionConfig = config[section as keyof typeof config] as Record<string, string>;
  
    const updatedSection = {
      ...sectionConfig,
      [key]: value,
    };
  
    dispatch(
      updateElementConfig({
        id: selectedElementId,
        config: {
          ...config,
          [section]: updatedSection,
        },
      })
    );
  };


  
  return (
    <aside className={style.container}>
      <h2>Properties</h2>
      {Object.entries(propertiesSchema).map(([sectionKey, sectionData]) => {        
        return (
        
        <div key={sectionKey} className={style.section}>
          <h3>{sectionData.title}</h3>
          <div className={style.optionsContainer}>
            {Object.entries(sectionData.fields).map(
              ([fieldKey, fieldProps]) => {
                const currentValue =
                  (config[sectionKey as keyof typeof config] as any)?.[
                    fieldKey
                  ] ?? "";

                return (
                  <div className={style.option} key={fieldKey}>
                    <label className={style.label}>{fieldProps.label}</label>

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
                          fieldProps.type === "number" && "step" in fieldProps
                            ? (fieldProps.step as string | number | undefined)
                            : undefined
                        }
                        min={
                          fieldProps.type === "number" && "min" in fieldProps
                            ? (fieldProps.min as string | number | undefined)
                            : undefined
                        }
                        max={
                          fieldProps.type === "number" && "max" in fieldProps
                            ? (fieldProps.max as string | number | undefined)
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
      );
      })}
    </aside>
  );
};

export default PropertiesPanel;

import style from "./LayerConfigSetting.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { styleConfig } from "../../types/animationType";
import { setLayerConfigSettings } from "../../redux/slices/animationSlice";

const LayerConfigSetting = () => {
  const dispatch = useAppDispatch();
  const editMode = useAppSelector((state) => state.editMode.value); // Add this line

  const selectedLayerId = useAppSelector(
    (state) => state.animation.selectedLayerId
  );
  const selectedLayer = useAppSelector((state) =>
    state.animation.layers.find((layer) => layer.id === selectedLayerId)
  );

  const formValues = selectedLayer?.style;

  const handleChange = (key: keyof styleConfig, value: string) => {
    if (!selectedLayer) return;

    // Only update if in class edit mode
    if (editMode === "class") {
      const style: styleConfig = {
        ...selectedLayer.style,
        [key]: value,
      };
      dispatch(setLayerConfigSettings({ layerId: selectedLayer.id, style }));
    }
  };
  
  if (!formValues)
    return <div className={style.container}>No layer selected</div>;

  return (
    <div className={style.container}>
      <h2>Edit {selectedLayer?.name || "Layer"} Properties</h2>

      {Object.entries(formValues).map(([key, value]) => {
        if (key === "type") return null;

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
      })}
    </div>
  );
};

export default LayerConfigSetting;

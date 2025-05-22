import style from "./LayerConfigSetting.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { styleConfig } from "../../types/animationType";
import { setLayerConfigSettings } from "../../redux/slices/animationSlice";

const LayerConfigSetting = () => {
  const dispatch = useAppDispatch();

  const selectedLayerId = useAppSelector(
    (state) => state.animation.selectedLayerId
  );
  const selectedLayer = useAppSelector((state) =>
    state.animation.layers.find((layer) => layer.id === selectedLayerId)
  );

  const formValues = selectedLayer?.style;

  const handleChange = (key: keyof styleConfig, value: string) => {
    if (!selectedLayer) return;
    const style: styleConfig = {
      width: selectedLayer.style?.width ?? "",
      height: selectedLayer.style?.height ?? "",
      backgroundColor: selectedLayer.style?.backgroundColor ?? "#000000",
      borderRadius: selectedLayer.style?.borderRadius ?? "",
      opacity: selectedLayer.style?.opacity ?? "1",
      transform: selectedLayer.style?.transform ?? "",
      [key]: value,
    };
    dispatch(setLayerConfigSettings({ layerId: selectedLayer.id, style }));
  };

  if (!formValues)
    return <div className={style.container}>No layer selected</div>;

  return (
    <div className={style.container}>
      <h3>Edit {selectedLayer.name} Properties</h3>

      <label>
        Width:
        <input
          type="text"
          value={formValues.width}
          onChange={(e) => handleChange("width", e.target.value)}
        />
      </label>

      <label>
        Height:
        <input
          type="text"
          value={formValues.height}
          onChange={(e) => handleChange("height", e.target.value)}
        />
      </label>

      <label>
        Background Color:
        <input
          type="color"
          value={formValues.backgroundColor}
          onChange={(e) => handleChange("backgroundColor", e.target.value)}
        />
      </label>

      <label>
        Border Radius:
        <input
          type="text"
          value={formValues.borderRadius}
          onChange={(e) => handleChange("borderRadius", e.target.value)}
        />
      </label>

      <label>
        Opacity:
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={formValues.opacity}
          onChange={(e) => handleChange("opacity", e.target.value)}
        />
        {formValues.opacity}
      </label>

      <label>
        Transform:
        <input
          type="text"
          value={formValues.transform}
          onChange={(e) => handleChange("transform", e.target.value)}
        />
      </label>
    </div>
  );
};

export default LayerConfigSetting;

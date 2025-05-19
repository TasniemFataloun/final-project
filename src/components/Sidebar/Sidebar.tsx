import style from "./Sidebar.module.css";
import { useAppDispatch } from "../../redux/store";
import { addLayer } from "../../redux/slices/animationSlice";

import { Square, Circle, RectangleHorizontal } from "lucide-react";
import { ElementType } from "../../redux/types/animations.type";
import { getDefaultPropertiesGroup } from "../../helpers/GetDefaultPropertiesGroup";

const Sidebar = () => {
  const dispatch = useAppDispatch();

  const handleAddElement = (type: ElementType) => {
    const config = getDefaultPropertiesGroup(type);

    const style = {
      width: `${config.size.width}px`,
      height: `${config.size.height}px`,
      backgroundColor: config.backgroundColor.backgroundColor,
      opacity: config.opacity.opacity,
      borderRadius: `${config.borderRadius.borderRadius}px`,
      transform: `scale(${config.transform.scale}) rotate(${config.transform.rotate}deg) translate(${config.transform.translateX}px, ${config.transform.translateY}px)`,
    };

    const newLayer = {
      id: Date.now().toString(),
      name: type,
      type: type,
      visible: true,
      locked: false,
      style,
      layerPropertiesValue: config,
    };

    dispatch(addLayer(newLayer));
  };

  return (
    <div className={style.sidebar}>
      <h2>Add elements </h2>
      <div className={style.iconContainer}>
        <RectangleHorizontal
          color="var(--white)"
          size={45}
          strokeWidth="none"
          className={style.iconButton}
          onClick={() => handleAddElement("rectangle")}
        />

        <Circle
          size={45}
          strokeWidth="none"
          color="var(--white)"
          className={style.iconButton}
          onClick={() => handleAddElement("circle")}
        />

        <Square
          size={45}
          strokeWidth="none"
          color="var(--white)"
          className={style.iconButton}
          onClick={() => handleAddElement("square")}
        />
      </div>
    </div>
  );
};

export default Sidebar;

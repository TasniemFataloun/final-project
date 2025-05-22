import style from "./Sidebar.module.css";
import { useAppDispatch } from "../../redux/store";
import { addLayer } from "../../redux/slices/animationSlice";

import { Square, Circle, RectangleHorizontal } from "lucide-react";
import { ElementType } from "../../redux/types/animations.type";
import HtmlCssCode from "../HtmlCssCode/HtmlCssCode";
import { useState } from "react";

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const [showCodeComponent, setShowCodeComponent] = useState(false);

  const handleAddElement = (type: ElementType) => {
    const newLayer = {
      id: Date.now().toString(),
      name: type,
      type: type,
      visible: true,
      locked: false,
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
      <button onClick={() => setShowCodeComponent(true)}>
        Import your code
      </button>

      {showCodeComponent && (
        <HtmlCssCode
          onSave={(html, css) => {
            // Handle save
            console.log("HTML:", html);
            console.log("CSS:", css);
            setShowCodeComponent(false);
          }}
          onCancel={() => {
            setShowCodeComponent(false);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;

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
    const id = Date.now().toString();
    dispatch(
      addLayer({
        type,
        id,
      })
    );
  };

  const handleSaveHtmlCss = (html: string, css: string) => {
    const newLayer = {
      id: Date.now().toString(),
      type: "code" as const,
      customHtml: html,
      customCss: css,
    };
    dispatch(addLayer(newLayer));
    setShowCodeComponent(false);

    console.log("Custom HTML saved:", html);
    console.log("Custom CSS saved:", css);
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
          onSave={(html: string, css: string) => handleSaveHtmlCss(html, css)}
          onCancel={() => setShowCodeComponent(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;

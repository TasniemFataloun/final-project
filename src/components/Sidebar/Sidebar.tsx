import style from "./Sidebar.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addLayer } from "../../redux/slices/animationSlice";
import { Square, Circle, RectangleHorizontal, Shapes } from "lucide-react";
import { ElementType, Layer } from "../../redux/types/animations.type";
import HtmlCssCode from "../HtmlCssCode/HtmlCssCode";
import { useState } from "react";
import * as cssParser from "css";
import { getDefaultPropertiesGroup } from "../../helpers/GetDefaultPropertiesGroup";
import { nanoid } from "nanoid";

const parseHtmlToLayers = (
  html: string,
  css: string,
  parentId: string | null = null
) => {
  const layers: Layer[] = [];
  const temp = document.createElement("div");
  temp.innerHTML = html;

  const processElement = (element: Element, parentId: string | null) => {
    const tag = element.tagName.toLowerCase(); //div , button , h1,...
    const selector = element.id
      ? `#${element.id}`
      : element.className
      ? `.${[...element.classList].join(".")}`
      : element.tagName.toLowerCase();
    const style = selector ? parseCss(css, selector) : {};
    const id = nanoid(5);
    layers.push({
      id,
      parentId,
      selector: element.id || `${tag}`,
      tag,
      type: "code",
      style,
      customHtml: element.outerHTML,
    });

    Array.from(element.children).forEach((child) => processElement(child, id));
  };

  Array.from(temp.children).forEach((el) => processElement(el, parentId));

  return layers;
};

const parseCss = (css: string, selector: string): Record<string, string> => {
  const parsed = cssParser.parse(css);
  const result: Record<string, string> = {};
  parsed.stylesheet?.rules.forEach((rule: any) => {
    if (rule.type === "rule" && rule.selectors.includes(selector)) {
      rule.declarations.forEach((decl: any) => {
        if (decl.type === "declaration") {
          result[
            decl.property.replace(/-([a-z])/g, (_: any, char: string) =>
              char.toUpperCase()
            )
          ] = decl.value;
        }
      });
    }
  });
  return result;
};

const Sidebar = () => {
  const { layers } = useAppSelector((state) => state.animation);
  const dispatch = useAppDispatch();
  const [showCodeComponent, setShowCodeComponent] = useState(false);

  const handleAddElement = (type: ElementType) => {
    const id = nanoid(5);
    const name = layers.filter((layer) => layer.type === type).length;
    dispatch(
      addLayer({
        id,
        type,
        name: `${type} ${name}`,
        style: getDefaultPropertiesGroup(type)!,
      })
    );
  };
  const handleSaveHtmlCss = (html: string, css: string) => {
    const layersToAdd = parseHtmlToLayers(html, css);
    layersToAdd.forEach((layer) => {
      const count = layers.filter((l) =>
        l.name?.startsWith(layer.selector!)
      ).length;
      dispatch(
        addLayer({
          ...layer,
          name: count === 0 ? layer.selector : `${layer.selector}${count}`,
        })
      );
    });
    setShowCodeComponent(false);
  };

  return (
    <div className={style.sidebar} data-tour="sidebar">
      <h2>Add shape </h2>
      <div className={style.iconContainer} data-tour="shapes">
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
      <button
        onClick={() => setShowCodeComponent(true)}
        data-tour="shapes-htmlcss"
      >
        <Shapes size={14} />
        Add your own shape
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

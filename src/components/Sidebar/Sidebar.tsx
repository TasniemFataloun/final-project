import style from "./Sidebar.module.css";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { addLayer } from "../../redux/slices/animationSlice";
import {
  Square,
  Circle,
  RectangleHorizontal,
  Shapes,
  ListRestart,
} from "lucide-react";
import { ElementType, Layer } from "../../redux/types/animations.type";
import HtmlCssCode from "../HtmlCssCode/HtmlCssCode";
import { useRef, useState } from "react";
import * as cssParser from "css";
import { getDefaultPropertiesGroup } from "../../helpers/GetDefaultPropertiesGroup";
import { nanoid } from "nanoid";
import { clearLocalStorage } from "../../utils/Localstorage";

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

  //resize handler
  const MIN_WIDTH = 150;
  const MAX_WIDTH = 400;

  const [sidebarWidth, setSidebarWidth] = useState(MAX_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;

    document.body.style.cursor = "ew-resize";

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(
      MAX_WIDTH,
      Math.max(MIN_WIDTH, startWidth.current - delta)
    );
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div style={{ position: "relative", width: sidebarWidth }}>
      <div className={style.handlerContainer}>
        <div
          className={style.resizeHandleHorizontal}
          onMouseDown={handleMouseDown}
        >
          ↕
        </div>
      </div>
      <div className={style.sidebar} data-tour="sidebar">
        <div className={style.shapesContainer}>
          <div className={style.defaultShapes}>
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
              <button
                style={{ transform: "scaleX(1.1)" }}
                onClick={() => handleAddElement("oval")}
                className={style.iconButton}
              >
                <svg
                  className={style.iconButton}
                  xmlns="http://www.w3.org/2000/svg"
                  width="45"
                  height="45"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <ellipse
                    cx="12"
                    cy="12"
                    rx="8"
                    ry="5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowCodeComponent(true)}
            data-tour="shapes-htmlcss"
            className={style.sidebarButtons}
          >
            <div className={style.shape}>
              <Shapes size={20} />
            </div>
            <div className={style.text}>Add your own shape {"</>"} </div>
          </button>
          {showCodeComponent && (
            <HtmlCssCode
              onSave={(html: string, css: string) =>
                handleSaveHtmlCss(html, css)
              }
              onCancel={() => setShowCodeComponent(false)}
            />
          )}
        </div>
        <button onClick={clearLocalStorage} className={style.resetButton}>
          <ListRestart size={18} />
          <span>Reset animation</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

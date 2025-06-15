import style from "./Sidebar.module.css";
import store, { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  addKeyframesToLayer,
  addLayer,
} from "../../redux/slices/animationSlice";
import {
  Square,
  Circle,
  RectangleHorizontal,
  Shapes,
  ListRestart,
  Save,
  PanelRightClose,
} from "lucide-react";
import { ElementType, Layer } from "../../redux/types/animations.type";
import HtmlCssCode from "../HtmlCssCode/HtmlCssCode";
import { useEffect, useRef, useState } from "react";
import * as cssParser from "css";
import { getDefaultPropertiesGroup } from "../../helpers/GetDefaultPropertiesGroup";
import { nanoid } from "nanoid";
import {
  clearLocalStorage,
  saveStateToLocalStorage,
} from "../../utils/Localstorage";
import { presetAnimations } from "../../config/presetAnimations.config";

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
  const { layers } = useAppSelector((state) => state.animation.present);
  const dispatch = useAppDispatch();
  const [showCodeComponent, setShowCodeComponent] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedState, setSavedState] = useState<any>(null);
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [isPropertiesMenuOpen, setIsPropertiesMenuOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("animationState");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSavedState({ layers: parsed.layers });
    } else {
      const current = store.getState().animation.present;
      setSavedState(current);
    }
  }, []);

  useEffect(() => {
    const state = store.getState().animation.present;

    if (JSON.stringify(state) !== JSON.stringify(savedState)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [layers, savedState]);

  // before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (hasUnsavedChanges && !skipBeforeUnload.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        const state = store.getState().animation.present;
        saveStateToLocalStorage(state);
        setSavedState(state);
        setHasUnsavedChanges(false);
        console.log("Animation state saved via shortcut!");
      }
    };

    window.addEventListener("keydown", handleSaveShortcut);

    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [setSavedState, setHasUnsavedChanges]);

  const saveChanges = () => {
    const state = store.getState().animation.present;
    saveStateToLocalStorage(state);
    setSavedState(state);
    setHasUnsavedChanges(false);
  };

  const skipBeforeUnload = useRef(false);

  const handleReset = () => {
    skipBeforeUnload.current = true;
    clearLocalStorage();
    window.location.reload(); // Trigger a full reload
  };

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
    setSelectedAnimation(""); // Reset selected animation when new layer is added
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

  // Handle animation selection
  const selectedLayerId = useAppSelector(
    (state) => state.animation.present.selectedLayerId
  );

  const handleAnimationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAnimation = e.target.value;
    if (!selectedAnimation || !selectedLayerId) return;

    const animation = presetAnimations[selectedAnimation];
    if (!animation) return;

    animation.forEach(({ property, keyframes }) => {
      dispatch(
        addKeyframesToLayer({
          layerId: selectedLayerId,
          property,
          keyframes,
        })
      );
    });
  };
  useEffect(() => {
    if (layers.length === 0) {
      setSelectedAnimation("");
    }
  }, [layers]);

  return (
    <>
      <div
        className={`${style.sidebarContainer} ${
          isPropertiesMenuOpen ? style.openContainer : style.closeContainer
        }`}
      >
        <div className={style.sidebar} data-tour="sidebar">
          <button
            onClick={() => setIsPropertiesMenuOpen((prev) => !prev)}
            className={style.iconClosePanel}
            aria-expanded={isPropertiesMenuOpen}
            aria-label={
              isPropertiesMenuOpen
                ? "Close properties panel"
                : "Open properties panel"
            }
          >
            <PanelRightClose size={14} />
          </button>
          {isPropertiesMenuOpen ? (
            <>
              <div className={style.shapesContainer}>
                <div className={style.defaultShapes}>
                  <h2>Add a shape</h2>
                  <div className={style.iconContainer} data-tour="shapes">
                    <RectangleHorizontal
                      color="var(--white)"
                      size={45}
                      strokeWidth="none"
                      className={style.iconButton}
                      onClick={() => handleAddElement("rectangle")}
                    />
                    <Circle
                      color="var(--white)"
                      size={45}
                      strokeWidth="none"
                      className={style.iconButton}
                      onClick={() => handleAddElement("circle")}
                    />
                    <Square
                      color="var(--white)"
                      size={45}
                      strokeWidth="none"
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
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        color="var(--white)"
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
                  <div className={style.text}>Add your own shape</div>
                </button>

                {showCodeComponent && (
                  <HtmlCssCode
                    onSave={handleSaveHtmlCss}
                    onCancel={() => setShowCodeComponent(false)}
                  />
                )}
              </div>
              <div data-tour="preset-animations">
                <label htmlFor="presetAnimations">
                  <h2>Preset Animations</h2>
                </label>
                <select
                  value={selectedAnimation}
                  className={style.styleSelected}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedAnimation(val);
                    handleAnimationSelect(e);
                  }}
                >
                  <option value="" disabled>
                    {layers.length === 0 || !selectedLayerId
                      ? "Select a layer to apply animation"
                      : "Select an animation"}
                  </option>
                  {layers.length === 0 && (
                    <option value="">Select a layer to apply animation</option>
                  )}
                  <optgroup label="Attention Seekers">
                    <option
                      value="bounce"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Bounce
                    </option>
                    <option
                      value="flash"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Flash
                    </option>
                    <option
                      value="swing"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Swing
                    </option>
                    <option
                      value="tada"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Tada
                    </option>
                  </optgroup>
                  <optgroup label="Fade Animations">
                    <option
                      value="fadeIn"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In
                    </option>
                    <option
                      value="fadeInUpBig"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In Up Big
                    </option>
                    <option
                      value="fadeInUp"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In Up
                    </option>
                    <option
                      value="fadeInRight"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In Right
                    </option>
                    <option
                      value="fadeInBottomRight"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In Bottom Right
                    </option>
                  </optgroup>
                  <optgroup label="Slide Animations">
                    <option
                      value="slideInLeft"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Slide In Left
                    </option>
                    <option
                      value="slideInRight"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Slide In Right
                    </option>
                    <option
                      value="fadeInUp"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Fade In Up
                    </option>
                  </optgroup>
                  <optgroup label="Zoom Animations">
                    <option
                      value="zoomIn"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Zoom In
                    </option>
                    <option
                      value="zoomOut"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Zoom Out
                    </option>
                    <option
                      value="zoomOutLeft"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Zoom Out Left
                    </option>
                    <option
                      value="zoomOutRight"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Zoom Out Right
                    </option>
                  </optgroup>
                  <optgroup label="Rotate Animations">
                    <option
                      value="RotateOut"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Rotate Out
                    </option>
                    <option
                      value="rotateOutDownLeft"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Rotate Out Down Left
                    </option>
                    <option
                      value="rotateOutDownRight"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Rotate Out Down Right
                    </option>
                    <option
                      value="rotateOutUpLeft"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Rotate Out Up Left
                    </option>
                    <option
                      value="rotateDownLeft"
                      disabled={layers.length === 0 || !selectedLayerId}
                    >
                      Rotate Down Left
                    </option>
                  </optgroup>
                </select>
              </div>

              <div className={style.storageButtons} data-tour="storage-buttons">
                <button onClick={handleReset} className={style.resetButton}>
                  <ListRestart size={18} className={style.buttonIcon} />
                  <span>Reset animation</span>
                </button>
                <button onClick={saveChanges} className={style.saveButton}>
                  <Save size={18} className={style.buttonIcon} />
                  <span>Save animation</span>
                </button>
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import style from "./PropertiesPanel.module.css";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { updateElementConfig } from "../../redux/slices/elementsSlice";

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const { selectedElementId, elements } = useAppSelector(
    (state) => state.elements
  );

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) return null;

  const config = selectedElement.config;

  /*  const updateTransform = (key: string, value: string) => {
    setConfig({...config,transform: {...config.transform,[key]: value,}})
  } */

  return (
    <aside className={style.container}>
      <h2>Properties</h2>
      <div className={style.section}>
        <h3>Animation</h3>
        <div className={style.optionsContainer}>
          <div className={style.option}>
            <label className={style.label}>Duration (seconds)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.animation.duration}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      animation: {
                        ...config.animation,
                        duration: e.target.value,
                      },
                    },
                  })
                )
              }
              className={style.input}
            />
          </div>

          <div className={style.option}>
            <label className={style.label}>Timing Function</label>
            <select
              value={config.animation.timingFunction}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      animation: {
                        ...config.animation,
                        timingFunction: e.target.value,
                      },
                    },
                  })
                )
              }
              className={style.select}
            >
              <option value="ease">ease</option>
              <option value="linear">linear</option>
              <option value="ease-in">ease-in</option>
              <option value="ease-out">ease-out</option>
              <option value="ease-in-out">ease-in-out</option>
            </select>
          </div>

          <div className={style.option}>
            <label className={style.label}>Delay (seconds)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.animation.delay}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      animation: { ...config.animation, delay: e.target.value },
                    },
                  })
                )
              }
              className={style.input}
            />
          </div>

          <div className={style.option}>
            <label className={style.label}>Iteration Count</label>
            <select
              value={config.animation.iterationCount}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      animation: {
                        ...config.animation,
                        iterationCount: e.target.value,
                      },
                    },
                  })
                )
              }
              className={style.select}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="infinite">infinite</option>
            </select>
          </div>
        </div>
      </div>

      <div className={style.section}>
        <div className={style.section}>
          <h3>Size</h3>

          <div className={style.optionsContainer}>
            <div className={style.options}>
              <label className={style.label}>Width (px)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={config.size.width}
                onChange={(e) =>
                  dispatch(
                    updateElementConfig({
                      id: selectedElementId,
                      config: {
                        ...config,
                        size: { ...config.size, width: e.target.value },
                      },
                    })
                  )
                }
                className={style.input}
              />
            </div>

            <div>
              <label className={style.label}>Height (px)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={config.size.height}
                onChange={(e) =>
                  dispatch(
                    updateElementConfig({
                      id: selectedElementId,
                      config: {
                        ...config,
                        size: { ...config.size, height: e.target.value },
                      },
                    })
                  )
                }
                className={style.input}
              />
            </div>
          </div>
        </div>

        <h3>Transform</h3>
        <div className={style.optionsContainer}>
          <div>
            <label className={style.label}>Scale</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={config.transform.scale}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      transform: { ...config.transform, scale: e.target.value },
                    },
                  })
                )
              }
              className={style.input}
            />
          </div>

          <div>
            <label className={style.label}>Rotate (degrees)</label>
            <input
              type="number"
              value={config.transform.rotate}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId,
                    config: {
                      ...config,
                      transform: {
                        ...config.transform,
                        rotate: e.target.value,
                      },
                    },
                  })
                )
              }
              className={style.input}
            />
          </div>

          <div>
            <label className={style.label}>Translate X (px)</label>
            <input
              type="number"
              value={config.transform.translateX}
              onChange={(e) => {
                dispatch(
                  updateElementConfig({
                    id: selectedElementId, // This will only be passed if it's not null
                    config: {
                      ...config,
                      transform: {
                        ...config.transform,
                        translateX: e.target.value,
                      },
                    },
                  })
                );
              }}
              className={style.input}
            />
          </div>

          <div>
            <label className={style.label}>Translate Y (px)</label>
            <input
              type="number"
              value={config.transform.translateY}
              onChange={(e) =>
                dispatch(
                  updateElementConfig({
                    id: selectedElementId, // This will only be passed if it's not null
                    config: {
                      ...config,
                      transform: {
                        ...config.transform,
                        translateY: e.target.value,
                      },
                    },
                  })
                )
              }
              className={style.input}
            />
          </div>
        </div>
      </div>

      <div className={style.section}>
        <h3>Opacity</h3>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={config.opacity}
          onChange={(e) =>
            dispatch(
              updateElementConfig({
                id: selectedElementId,
                config: {
                  ...config,
                  opacity: e.target.value,
                },
              })
            )
          }
          className={style.input}
        />
      </div>
    </aside>
  );
};

export default PropertiesPanel;

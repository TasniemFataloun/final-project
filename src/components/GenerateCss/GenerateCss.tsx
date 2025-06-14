import style from "./GenerateCss.module.css";
import { useAppSelector } from "../../redux/store";
import { SquareX } from "lucide-react";
import CopyToClipboard from "./CopyToClipboard/CopyToClipboard";
import {
  camelToKebab,
  UseGenerateKeyframes,
} from "../../utils/useGenerateKeyframe";

type GenerateCssProps = {
  onClose: () => void;
};

const GenerateCss = ({ onClose }: GenerateCssProps) => {
  const { layers } = useAppSelector((state) => state.animation.present);

  const generateCSS = () => {
    const containerCSS = `
.animatedElementContainer {
  display: flex;
}
  `.trim();

    const keyframesCSS = layers
      .map((layer) => UseGenerateKeyframes(layer))
      .join("\n\n");

    return `${containerCSS}\n\n${keyframesCSS}`;
  };

  return (
    <div id="generated-css" className={style.container}>
      <SquareX onClick={onClose} size={20} className={style.closeButton} />

      <h2>HTML Code </h2>
      <div className={style.code}>
        <div className={style.copyContainer}>
          <div className={style.iconCopy}>
            <CopyToClipboard
              css={[
                `<div class="animatedElementContainer">`,
                ...layers.map(
                  (layer) =>
                    `  <div class="${camelToKebab(
                      layer.name || "layer"
                    )}"></div>`
                ),
                `</div>`,
              ].join("\n")}
            />
          </div>
          {layers.length === 0 ? (
            <div className={style.noLayers}>
              No layers available to generate CSS.
            </div>
          ) : (
            <div className={style.cssContainer}>
              <p>{`<div class="animatedElementContainer">`}</p>
              {layers.map((layer, index) => (
                <div key={index} className={style.layerCss}>
                  <p>{`  <div class="${camelToKebab(
                    layer.name || "layer"
                  )}"></div>`}</p>
                </div>
              ))}
              <p>{`</div>`}</p>
            </div>
          )}
        </div>
      </div>

      <h2>CSS Code</h2>
      <div className={style.code}>
        <div className={style.copyContainer}>
          <div className={style.iconCopy}>
            <CopyToClipboard css={generateCSS() || ""} />
          </div>
          {generateCSS()}
        </div>
      </div>
    </div>
  );
};

export default GenerateCss;

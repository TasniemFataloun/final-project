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
  const { layers } = useAppSelector((state) => state.animation);

  const generateCSS = () => {
    return layers.map((layer) => UseGenerateKeyframes(layer)).join("\n\n");
  };

  return (
    <div id="generated-css" className={style.container}>
      <SquareX onClick={onClose} className={style.closeButton} />

      <h2>HTML Code </h2>
      <div className={style.code}>
        <div className={style.copyContainer}>
          <div className={style.iconCopy}>
            <CopyToClipboard
              css={`<div class="${layers
                .map((layer) => camelToKebab(layer.name || "layer"))
                .join(" ")}"></div>`}
            />
          </div>
          {layers.length === 0 ? (
            <div className={style.noLayers}>
              No layers available to generate CSS.
            </div>
          ) : (
            <div className={style.cssContainer}>
              {layers.map((layer, index) => (
                <div key={index} className={style.layerCss}>
                  <p>{camelToKebab(`<div class="${layer.name}"></div>`)}</p>
                </div>
              ))}
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

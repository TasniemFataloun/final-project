import style from "./GenerateCss.module.css";
import { useAppSelector } from "../../redux/store";
import { SquareX } from "lucide-react";
import CopyToClipboard from "./CopyToClipboard/CopyToClipboard";
import { UseGenerateKeyframes } from "../../utils/useGenerateKeyframe";

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
      <div className={style.generateCss}>
        <h2>Generated CSS</h2>
      </div>

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

import style from "./GenerateCss.module.css";
import { useAppSelector } from "../../redux/store";
import { SquareX } from "lucide-react";
import CopyToClipboard from "./CopyToClipboard/CopyToClipboard";
import { UseGenerateKeyframes } from "../../utils/useGenerateKeyframe";

type GenerateCssProps = {
  onClose: () => void;
};

const GenerateCss = ({ onClose }: GenerateCssProps) => {
  const { elements, selectedElementId } = useAppSelector(
    (state) => state.elements
  );
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const config = selectedElement?.currentConfig;

  const generateCSS = () => {
    if (!selectedElement || !config) {
      return `/* No element selected */`;
    }

    return UseGenerateKeyframes(config);
  };

  return (
    <div id="generated-css" className={style.container}>
      <SquareX onClick={onClose} className={style.closeButton} />
      <div className={style.titleContainer}>
        <div className={style.generateCss}>
          <CopyToClipboard css={generateCSS()} />
          <h2>Generated CSS</h2>
        </div>
      </div>

      <div className={style.code}>{generateCSS()}</div>
    </div>
  );
};

export default GenerateCss;

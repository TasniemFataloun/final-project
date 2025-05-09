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

  const config = selectedElement?.keyframes;

  const generateCSS = () => {
    if (!selectedElement || !selectedElement.keyframes) {
      return `/* No element selected or missing keyframes */`;
    }

    console.log(
      "helllllooeooe",
      Object.values(selectedElement.keyframes)
        .map((animation) => UseGenerateKeyframes(animation, selectedElement.defaultConfig))
        .join("\n")
    );

    return Object.values(selectedElement.keyframes)
      .map((animation) => UseGenerateKeyframes(animation,  selectedElement.defaultConfig))
      .join("\n");
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

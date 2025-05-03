import style from "./GenerateCss.module.css";
import { useAppSelector } from "../../redux/store";
import { SquareX } from "lucide-react";
import CopyToClipboard from "./CopyToClipboard/CopyToClipboard";

type GenerateCssProps = {
  onClose: () => void;
};

const GenerateCss = ({ onClose }: GenerateCssProps) => {
  const { config } = useAppSelector((state) => state.animation);

  const generateCSS = () => {
    return `
@keyframes animation {
  from {
    transform: scale(1) rotate(0deg) translate(0px, 0px);
    opacity: 1;
  }
  to {
    transform: scale(${config.transform.scale})
             rotate(${config.transform.rotate}deg)
             translate(${config.transform.translateX}px, ${config.transform.translateY}px);
    opacity: ${config.opacity};
  }
}

.animated-element {
  animation: transform ${config.duration}s ${config.timingFunction} ${config.delay}s ${config.iterationCount};
}

`.trim();
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

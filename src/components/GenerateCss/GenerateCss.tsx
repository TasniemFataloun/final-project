import style from "./GenerateCss.module.css";
import { useAnimationStore } from "../../redux/store";
import { Code, Copy } from "lucide-react";

type GenerateCssProps = {
  onClose: () => void;
};

const GenerateCss = ({ onClose }: GenerateCssProps) => {
  const { config } = useAnimationStore();

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
      <div className={style.close}>
        <button onClick={onClose} className={style.closeButton}>
          ✖
        </button>
      </div>
      <div className={style.copyCss}>
        <div className="sectionHeader">
          <div className="logo">
            <Code className="logoIcon" />
            <h2 className="sectionTitle">Generated CSS</h2>
          </div>
          <button
            onClick={() => {
              const code =
                document.querySelector("#generated-css")?.textContent;
              if (code) navigator.clipboard.writeText(code);
            }}
            className="primaryButton"
          >
            <Copy className="buttonIcon" />
            Copy
          </button>
        </div>
      </div>
      <div className={style.code}>{generateCSS()}</div>
    </div>
  );
};

export default GenerateCss;

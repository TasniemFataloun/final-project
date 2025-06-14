import React from "react";
import style from "./OnboardingPrompt.module.css";

type OnboardingPromptProps = {
  onAccept: () => void;
  onDecline: () => void;
};

const OnboardingPrompt: React.FC<OnboardingPromptProps> = ({
  onAccept,
  onDecline,
}) => {
  return (
    <div className={style.onboardingPrompt}>
      <div className={style.onboardingBox}>
        <h2>Welcome!</h2>
        <p>Need a quick tour to get familiar with the app?</p>
        <div className={style.buttons}>
          <button onClick={onAccept}>Yes, take a look</button>
          <button onClick={onDecline}>No thanks</button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPrompt;

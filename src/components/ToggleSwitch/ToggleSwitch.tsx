import React, { useEffect, useState } from "react";
import style from "./ToggleSwitch.module.css";

const ToggleSwitch: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.body.getAttribute("data-theme") === "light";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", isDarkMode ? "light" : "dark");
  }, [isDarkMode]);

  const handleToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={style.toggleSwitch}>
      <label className={style.switchLabel}>
        <input
          type="checkbox"
          className={style.checkbox}
          checked={isDarkMode}
          onChange={handleToggle}
          aria-label="Toggle dark mode"
        />
        <span className={style.slider}></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;

import React, { useEffect, useState } from "react";
import styles from "./ToggleSwitch.module.css";

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
    <label className={`${styles.themeToggle} ${styles.sunMoonToggleBtn}`}>
      <input
        type="checkbox"
        className={styles.themeToggleInput}
        checked={!isDarkMode}
        onChange={handleToggle}
        aria-label="Toggle dark mode"
      />
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="currentColor"
        stroke="none"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="20" height="20" fill="white" />
          <circle cx="11" cy="3" r="8" fill="black" />
        </mask>
        <circle
          className={styles.sunMoon}
          cx="10"
          cy="10"
          r="8"
          mask="url(#moon-mask)"
        />
        <g>
          <circle
            className={`${styles.sunRay} ${styles.sunRay1}`}
            cx="18"
            cy="10"
            r="1.5"
          />
          <circle
            className={`${styles.sunRay} ${styles.sunRay2}`}
            cx="14"
            cy="16.928"
            r="1.5"
          />
          <circle
            className={`${styles.sunRay} ${styles.sunRay3}`}
            cx="6"
            cy="16.928"
            r="1.5"
          />
          <circle
            className={`${styles.sunRay} ${styles.sunRay4}`}
            cx="2"
            cy="10"
            r="1.5"
          />
          <circle
            className={`${styles.sunRay} ${styles.sunRay5}`}
            cx="6"
            cy="3.1718"
            r="1.5"
          />
          <circle
            className={`${styles.sunRay} ${styles.sunRay6}`}
            cx="14"
            cy="3.1718"
            r="1.5"
          />
        </g>
      </svg>
    </label>
  );
};

export default ToggleSwitch;

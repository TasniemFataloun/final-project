import { useEffect, useRef, useState } from "react";
import style from "./SplashScreen.module.css";

const NUM_SHAPES = 30;

const SplashScreen = () => {
  const [percent, setPercent] = useState(0);
  const [ended, setEnded] = useState(false);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGTextElement>(null);
  const [explode, setExplode] = useState(false);

useEffect(() => {
  let progress = 0;

  const interval = setInterval(() => {
    progress += 1;
    if (progress <= 100) {
      setPercent(progress);
      if (loadingBarRef.current) {
        loadingBarRef.current.style.transform = `scaleX(${progress / 100})`;
      }
    }
    if (progress === 100) {
      clearInterval(interval);

      setExplode(true); // Start explosion immediately
      setTimeout(() => setEnded(true), 600); // Fade out after explode animation duration (0.4s)
    }
  }, 20);

  return () => clearInterval(interval);
}, []);

  // Animate SVG stroke on mount
  useEffect(() => {
    if (!svgRef.current) return;
    const text = svgRef.current;

    const length = text.getComputedTextLength();

    text.style.strokeDasharray = length.toString();
    text.style.strokeDashoffset = length.toString();

    // Animate strokeDashoffset to 0 (draw effect)
    text.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
      duration: 2000,
      fill: "forwards",
      easing: "ease-in-out",
    }).onfinish = () => {
      text.style.fill = "var(--white)";
      text.style.stroke = "none"; // remove stroke after animation
      
    };
  }, []);

  return (
    <div className={`${style.splashWrapper} ${ended ? style.ended : ""}`}>
      {/* Animated shapes */}
      {[...Array(NUM_SHAPES)].map((_, index) => (
        <div
          key={index}
          className={`
      ${style.shape}
      ${style[`shape${index % 5}`]}
      ${explode ? style.explode : ""}
    `}
          style={
            {
              "--angle": `${(360 / NUM_SHAPES) * index}deg`,
              "--distance": "100vh",
            } as React.CSSProperties
          }
        />
      ))}

      {/* Loading bar */}
      <div ref={loadingBarRef} className={style.loadingBar} />

      {/* Percentage counter */}
      <div className={style.percentage}>{percent}%</div>

      {/* SVG Logo Text */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 400"
        className={style.logoSvg}
      >
        <text
          ref={svgRef}
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontFamily="'Montserrat Alternates', sans-serif" // or any modern font

          fontWeight="600"
          fontSize="60"
          fill="none"
          stroke="#cf316b"
          strokeWidth="2"
        >
          css motion studio
        </text>
      </svg>
    </div>
  );
};

export default SplashScreen;

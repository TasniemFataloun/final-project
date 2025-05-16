import { useEffect, useRef, useState } from "react";
import style from "./SplashScreen.module.css";

const SplashScreen = () => {
  const [percent, setPercent] = useState(0);
  const loadingBgRef = useRef<HTMLDivElement>(null);
  const loadingBarRef = useRef<HTMLDivElement>(null);
  const percentageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let progress = 0;

    const interval = setInterval(() => {
      progress += 1;
      if (progress <= 100) {
        setPercent(progress);

        // Update the transform scaleX for the loading bar
        if (loadingBarRef.current) {
          loadingBarRef.current.style.transform = `scaleX(${progress / 100})`;
        }
      }

      if (progress === 100) {
        clearInterval(interval);

        setTimeout(() => {
          loadingBgRef.current?.classList.add("ended");
          loadingBarRef.current?.classList.add("ended");
          percentageRef.current?.classList.add("ended");

          setTimeout(() => {
            loadingBgRef.current?.remove();
            loadingBarRef.current?.remove();
            percentageRef.current?.remove();
          }, 1000);
        }, 500);
      }
    }, 9); // adjust speed here

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div ref={loadingBgRef} className={style.loadingBackground}></div>
      <div ref={loadingBarRef} className={style.loadingBar}></div>
      <div ref={percentageRef} className={style.percentage}>
        {percent} %
      </div>
    </>
  );
};

export default SplashScreen;

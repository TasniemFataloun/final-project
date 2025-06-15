import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import PropertiesMenu from "./components/PropertiesMenu/PropertiesMenu";
import GenerateCss from "./components/GenerateCss/GenerateCss";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { useAppSelector } from "./redux/store";
import Alert from "./components/GenerateCss/Alert/Alert";
import TimelineEditor from "./components/Timeline/TimelineEditor";
import LayerConfigSetting from "./components/LayerConfigSetting/LayerConfigSetting";

import { TourProvider, useTour } from "@reactour/tour";
import OnboardingPrompt from "./components/OnboardingPrompt/OnboardingPrompt";
import SplashScreen from "./components/SplashScreen/SplashScreen";

import {
  getLastSeenSplash,
  setLastSeenSplash,
  setHasSeenTour,
  resetTourIfExpired,
  setTourSeen,
} from "./utils/Localstorage";
import MobileWarning from "./components/MobileWarning/MobileWarning";
import { tourSteps } from "./config/onboardingTourSteps";

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);
  const [showGenerateCss, setShowGenerateCss] = useState(false);
  const [, setShowLayerSettings] = useState(false);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setIsOpen, setCurrentStep } = useTour();

  const alertOpen = useAppSelector((state) => state.alert.isOpen);
  const editMode = useAppSelector((state) => state.editMode.value);

  //mobile responsive handling
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      resetTourIfExpired();
      const lastSeen = getLastSeenSplash();
      const now = Date.now();

      if (!lastSeen || now - lastSeen > 2 * 60 * 60 * 1000) {
        setShowSplash(true);
        setTimeout(() => {
          setShowSplash(false);
          checkTourStatus();
          setLastSeenSplash(now);
        }, 4000);
      } else {
        checkTourStatus();
      }
    }
  }, [isMobile]);

  useEffect(() => {
    resetTourIfExpired();
    const lastSeen = getLastSeenSplash();
    const now = Date.now();

    if (!lastSeen || now - lastSeen > 2 * 60 * 60 * 1000) {
      setShowSplash(true);
      setTimeout(() => {
        setShowSplash(false);
        checkTourStatus();
        setLastSeenSplash(now);
      }, 4000);
    } else {
      checkTourStatus();
    }
  }, []);

  const checkTourStatus = () => {
    if (!setHasSeenTour()) {
      setShowOnboardingPrompt(true);
    }
  };

  const handleAcceptTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
    setShowOnboardingPrompt(false);
    setTourSeen();
  };

  const handleDeclineTour = () => {
    setShowOnboardingPrompt(false);
    setTourSeen();
  };

  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div className="appContainer">
      {showSplash && <SplashScreen />}
      {!showSplash && showOnboardingPrompt && (
        <OnboardingPrompt
          onAccept={handleAcceptTour}
          onDecline={handleDeclineTour}
        />
      )}
      {!showSplash && (
        <>
          <Header
            onToggleGenerateCss={() => setShowGenerateCss((prev) => !prev)}
            onStartTour={() => {
              setCurrentStep(0);
              setIsOpen(true);
            }}
          />
          {alertOpen && <Alert message="Copied Code" />}
          <main className="main">
            <div className="canvasPropertiesTimeline">
              <Sidebar />
              <Canvas data-tour="canvas" />
              {editMode === "class" ? (
                <LayerConfigSetting data-tour="layer-settings" />
              ) : (
                <PropertiesMenu />
              )}
            </div>
            <TimelineEditor
              onOpenLayerSettings={() => setShowLayerSettings((prev) => !prev)}
              data-tour="timeline"
            />
            {showGenerateCss && (
              <GenerateCss
                onClose={() => setShowGenerateCss((prev) => !prev)}
                data-tour="generate-css"
              />
            )}
          </main>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <TourProvider
      steps={tourSteps}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: "#1e1e1e",
          color: "white",
          padding: "33px",
          borderRadius: "6px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          maxWidth: "320px",
          margin: "1.3rem",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
        maskWrapper: (base) => ({
          ...base,
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: "#ff69b4",
          color: "white",
        }),
        controls: (base) => ({
          ...base,
          marginTop: "16px",
          width: "100%",
        }),
        close: (base) => ({
          ...base,
          color: "#ccc",
          fontSize: "1rem",
          width: "0.8rem",
          height: "0.8rem",
        }),
        arrow: (base) => ({
          ...base,
          color: "#ff69b4",
        }),
      }}
    >
      <AppContent />
    </TourProvider>
  );
}

export default App;

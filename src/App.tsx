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

function AppContent() {
  const [showSplash, setShowSplash] = useState(false);
  const [showGenerateCss, setShowGenerateCss] = useState(false);
  const [, setShowLayerSettings] = useState(false);
  const [showOnboardingPrompt, setShowOnboardingPrompt] = useState(false);
  const { setIsOpen, setCurrentStep } = useTour();

  const alertOpen = useAppSelector((state) => state.alert.isOpen);
  const editMode = useAppSelector((state) => state.editMode.value);

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
          {alertOpen && <Alert message="Copied CSS Code" />}
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

const tourSteps = [
  {
    selector: '[data-tour="shapes"]',
    content: "You can choose shapes from here",
  },
  {
    selector: '[data-tour="shapes-htmlcss"]',
    content: "You can also add your own shapes using HTML and CSS",
  },
  {
    selector: '[data-tour="preset-animations"]',
    content: "There are some preset animations you can use",
  },
  {
    selector: '[data-tour="storage-buttons"]',
    content:
      "You can save your animation so on reload it will be restored. You can also reset the canvas to start fresh",
  },

  {
    selector: '[data-tour="canvas"]',
    content:
      "Here is the main animation preview. You can drag and drop the shapes, rotate , resize  and position them as you like. By pressing Shift, you can resize shapes proportionally and rotate them in 15° increments. You can delete a shape by pressing on Backspace button",
  },
  {
    selector: '[data-tour="properties-panel-config"]',
    content:
      "Here you can configure the animation properties of the selected layer",
  },
  {
    selector: '[data-tour="properties-panel-properties"]',
    content:
      "Here you can edit the properties of the selected layer. By editint the values, you can create keyframes in the timeline editor on the position of the playhead",
  },
  {
    selector: '[data-tour="timeline"]',
    content: "This is the timeline editor for keyframes and timing",
  },
  {
    selector: '[data-tour="timeline-controls"]',
    content: "These are the controls to navigate through your animation",
  },
  //
  {
    selector: '[data-tour="restart"]',
    content: "Click here to restart the animation",
  },
  {
    selector: '[data-tour="step-backward"]',
    content: "Click here to move one second backward in the animation",
  },
  {
    selector: '[data-tour="move-to-previous-keyframe"]',
    content:
      "This button moves the playhead to the previous keyframe in the timeline",
  },
  {
    selector: '[data-tour="play-pause"]',
    content:
      "Click here to play or pause the animation. You can also use the spacebar",
  },
  {
    selector: '[data-tour="move-to-next-keyframe"]',
    content:
      "This button moves the playhead to the next keyframe in the timeline",
  },
  {
    selector: '[data-tour="step-forward"]',
    content: "Click here to move one second forward in the animation.",
  },
  {
    selector: '[data-tour="jump-to-end"]',
    content: "Click here to jump to the end of the animation",
  },
  //
  {
    selector: '[data-tour="timeline-header"]',
    content: "Here you can see the time and progress of the animation",
  },
  {
    selector: '[data-tour="timeline-layer-row"]',
    content:
      "This is a layer row where you can manage individual layers. You can rename, duplicate, delete, hide or lock the layer. You can also drag the layers to reorder them",
  },
  {
    selector: '[data-tour="timeline-keyframes"]',
    content:
      "Here you can view, manage, and add keyframes for the selected layer. You can add keyframes by placing the playhead  somewhere in the timeline and edit a property in the properties menu. You can move a keyframe by dragging it, delete it with Backspace, or edit by aligning the playhead with the keyframe. You can alo copy a keyframe by selecting it and pressing Ctrl+C, keep it selected, then paste it with Ctrl+V",
  },
  {
    selector: '[data-tour="generate-css"]',
    content: "Click here to export your animation as HTML and CSS code",
  },
];

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

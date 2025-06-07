import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import GenerateCss from "./components/GenerateCss/GenerateCss";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { useState } from "react";
import { useAppSelector } from "./redux/store";
import Alert from "./components/GenerateCss/Alert/Alert";
import TimelineEditor from "./components/Timeline/TimelineEditor";
import LayerConfigSetting from "./components/LayerConfigSetting/LayerConfigSetting";

import { TourProvider, useTour } from "@reactour/tour";

function AppContent() {
  const [showGenerateCss, setShowGenerateCss] = useState(false);
  const alertOpen = useAppSelector((state) => state.alert.isOpen);
  const [showLayerSettings, setShowLayerSettings] = useState(false);
  const { setIsOpen, setCurrentStep } = useTour();

  const handleOpenLayerSettings = () => setShowLayerSettings((prev) => !prev);
  const handleToggleGenerateCss = () => setShowGenerateCss((prev) => !prev);

  return (
    <div className="appContainer">
      {/*  {showSplash && <SplashScreen />}
      {!showSplash && */}{" "}
      {/* ( */}
      <>
        <Header
          onToggleGenerateCss={handleToggleGenerateCss}
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
            {showLayerSettings ? (
              <LayerConfigSetting data-tour="layer-settings" />
            ) : (
              <PropertiesPanel />
            )}
          </div>
          <TimelineEditor
            onOpenLayerSettings={handleOpenLayerSettings}
            data-tour="timeline"
          />
      
          {showGenerateCss && (
            <GenerateCss
              onClose={handleToggleGenerateCss}
              data-tour="generate-css"
            />
          )}
        </main>
      </>
    </div>
  );
}

const tourSteps = [
  {
    selector: '[data-tour="sidebar"]',
    content:
      "This is the sidebar where you can add elements to your animation.",
  },
  {
    selector: '[data-tour="shapes"]',
    content: "You can choose shapes from here.",
  },
  {
    selector: '[data-tour="shapes-htmlcss"]',
    content: "You can also add custom HTML/CSS shape here.",
  },
  {
    selector: '[data-tour="canvas"]',
    content: "Here is your main canvas where the animation happens.",
  },
  {
    selector: '[data-tour="properties-panel-sidebar"]',
    content: "This is config",
  },
  {
    selector: '[data-tour="properties-panel-config"]',
    content: "This is config",
  },
  {
    selector: '[data-tour="properties-panel-properties"]',
    content: "This is config",
  },
  {
    selector: '[data-tour="timeline"]',
    content: "This is the timeline editor for keyframes and timing.",
  },
  {
    selector: '[data-tour="timeline-controls"]',
    content: "These are the controls to navigate through your animation.",
  },
  //
  {
    selector: '[data-tour="restart"]',
    content: "Click here to restart the animation.",
  },
  {
    selector: '[data-tour="step-backward"]',
    content: "Click here to one second backward in the animation.",
  },
  {
    selector: '[data-tour="move-to-previous-keyframe"]',
    content:
      "This button moves the playhead to the previous keyframe in the timeline.",
  },
  {
    selector: '[data-tour="play-pause"]',
    content:
      "Click here to play or pause the animation. You can also use the spacebar.",
  },
  {
    selector: '[data-tour="move-to-next-keyframe"]',
    content:
      "This button moves the playhead to the next keyframe in the timeline.",
  },
  {
    selector: '[data-tour="step-forward"]',
    content: "Click here to move one second forward in the animation.",
  },
  {
    selector: '[data-tour="jump-to-end"]',
    content: "Click here to jump to the end of the animation.",
  },
  //
  {
    selector: '[data-tour="timeline-header"]',
    content: "This is the timeline header with current progress and time.",
  },
  {
    selector: '[data-tour="timeline-header"]',
    content: "Here you can see the current progress and time.",
  },
  {
    selector: '[data-tour="timeline-layer-row"]',
    content:
      "This is a layer row where you can manage individual layers. You can rename, delete, or hide the layer. ",
  },
  {
    selector: '[data-tour="timeline-keyframes"]',
    content:
      "Here you can view, manage, and add keyframes for the selected layer. You can add keyframes by placing the playhead and edit a property in the properties menu.",
  },
  {
    selector: '[data-tour="keyframe"]',
    content:
      "You can move a keyframe by dragging, delete it with Backspace, or edit by aligning the playhead with the keyframe.",
  },
  {
    selector: '[data-tour="generate-css"]',
    content: "Click here to export your animation as CSS code.",
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
          padding: "20px",
          borderRadius: "6px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          maxWidth: "320px",
          margin: "1.3rem",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12, // rounded corners for highlight
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
        }),
        close: (base) => ({
          ...base,
          color: "#ccc",
          fontSize: "1.5rem",
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

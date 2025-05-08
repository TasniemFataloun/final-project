import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import GenerateCss from "./components/GenerateCss/GenerateCss";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { useState } from "react";
import { useAppSelector } from "./redux/store";
import Alert from "./components/GenerateCss/Alert/Alert";
import Timeline from "./components/Timeline/Timeline";

function App() {
  const [showGenerateCss, setShowGenerateCss] = useState(false);
  const alertOpen = useAppSelector((state) => state.alert.isOpen);

  const handleToggleGenerateCss = () => {
    setShowGenerateCss((prev) => !prev);
  };

  return (
    <div className="appContainer">
      <Header onToggleGenerateCss={handleToggleGenerateCss} />
      {alertOpen && <Alert message="Url Copied" />}

      <main className="main">
        <Sidebar />
        <div className="canvasTimelineContainer">
          <Canvas />
          <Timeline />
        </div>

        <PropertiesPanel />
        {showGenerateCss && <GenerateCss onClose={handleToggleGenerateCss} />}
      </main>
    </div>
  );
}

export default App;

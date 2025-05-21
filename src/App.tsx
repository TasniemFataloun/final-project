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

function App() {
  const [showGenerateCss, setShowGenerateCss] = useState(false);
  const alertOpen = useAppSelector((state) => state.alert.isOpen);
  /*   const [showSplash, setShowSplash] = useState(true);
   */
  const handleToggleGenerateCss = () => {
    setShowGenerateCss((prev) => !prev);
  };

  /*   useEffect(() => {
    const endTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

    return () => clearTimeout(endTimeout);
  }, []); */

  return (
    <div className="appContainer">
      {/*  {showSplash && <SplashScreen />}
      {!showSplash && */}{" "}
      {/* ( */}
      <>
        <Header onToggleGenerateCss={handleToggleGenerateCss} />
        {alertOpen && <Alert message="Copied CSS Code" />}

        <main className="main">
          <div className="canvasPropertiesTimeline">
            <Sidebar />
            <Canvas />
            <PropertiesPanel />
          </div>
          <TimelineEditor />
          {showGenerateCss && <GenerateCss onClose={handleToggleGenerateCss} />}
        </main>
      </>
      {/*   )} */}
    </div>
  );
}

export default App;

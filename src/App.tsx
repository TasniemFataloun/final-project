import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import GenerateCss from "./components/GenerateCss/GenerateCss";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import { useState } from "react";

function App() {
  const [showGenerateCss, setShowGenerateCss] = useState(false);

  const handleToggleGenerateCss = () => {
    setShowGenerateCss((prev) => !prev);
  };

  return (
    <div className="container">
      <Header onToggleGenerateCss={handleToggleGenerateCss} />
      
      <main className="main">
        <Sidebar />
        <Canvas />
        <PropertiesPanel />
        {showGenerateCss && <GenerateCss onClose={handleToggleGenerateCss} />}
      </main>
    </div>
  );
}

export default App;

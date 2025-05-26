import React, { useState } from "react";
import style from "./CloseIcon.module.css";
import { PanelRightClose } from "lucide-react";
import { useAppSelector } from "../../redux/store";

const CloseIcon = () => {
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const { selectedLayerId, layers } = useAppSelector(
    (state) => state.animation
  );

  const selectedLayer = layers.find((el) => el.id === selectedLayerId);

  const handleTogglePropertiesPanel = () => {
    setIsPropertiesPanelOpen((prev) => !prev);
  };

  return (
    <div className={style.iconh2}>
      <button
        onClick={handleTogglePropertiesPanel}
        className={style.iconClosePanel}
      >
        <PanelRightClose color="var(--white)" />
      </button>
    </div>
  );
};

export default CloseIcon;

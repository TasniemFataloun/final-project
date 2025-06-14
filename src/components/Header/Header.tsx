import style from "./Header.module.css";
import ExportCss from "../ExportCss/ExportCss";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import { useAppSelector } from "../../redux/store";
import { Info } from "lucide-react";

type HeaderProps = {
  onToggleGenerateCss: () => void;
  onStartTour: () => void;
};

const Header = ({ onToggleGenerateCss, onStartTour }: HeaderProps) => {
  const layers = useAppSelector((state) => state.animation.layers);

  return (
    <header className={style.header}>
      <div className={style.headerContent}>
        <div className={style.logoTitleContainer}>
          <img src="/logo.png" className={style.logo} />
          <h1>CSS Motion Studio</h1>
        </div>

        <div className={style.cssAndToggleContainer}>
          <ExportCss onClick={onToggleGenerateCss} />
          <Info onClick={onStartTour} className={style.tourButton} />
          <ToggleSwitch />
        </div>
      </div>
    </header>
  );
};

export default Header;

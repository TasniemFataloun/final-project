import style from "./Header.module.css";
import ExportCss from "../ExportCss/ExportCss";

type HeaderProps = {
  onToggleGenerateCss: () => void;
}

const Header = ({ onToggleGenerateCss }: HeaderProps) => {

  return (
    <header className={style.header}>
      <div className={style.headerContent}>
        <img src="/logo.png" className={style.logo} />
        <h1>CSS Motion Studio</h1>

        <ExportCss onClick={onToggleGenerateCss} />
      </div>
    </header>
  );
};

export default Header;

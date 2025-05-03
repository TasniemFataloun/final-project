import style from "./ExportCss.module.css";

const ExportCss: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className={style.exportCss} onClick={onClick}>
      Export CSS
    </div>
  );
};

export default ExportCss;
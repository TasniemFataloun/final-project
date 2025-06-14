import style from "./MobileWarning.module.css"; 

const MobileWarning = () => {
  return (
    <>
      <div className={style.mobileWarning}>
        <h2>For the best experience, please use a desktop device</h2>
        <p>This animation editor is optimized for larger screens.</p>
      </div>
    </>
  );
};

export default MobileWarning;

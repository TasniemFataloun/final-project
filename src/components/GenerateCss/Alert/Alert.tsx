import style from "./Alert.module.css";
import { useAppDispatch } from "../../../redux/store";
import { setIsOpen } from "../../../redux/slices/alertSlice";
import { SquareX } from "lucide-react";

type AlertProps = {
  message: string;
};

const Alert = ({ message }: AlertProps) => {
  const dispatch = useAppDispatch();

  const closeAlert = () => {
    dispatch(setIsOpen(false));
  };
  return (
    <div className={style.container}>
      <p className={style.messageText}>{message}</p>
      <div>
        <SquareX onClick={closeAlert} className={style.closeButton} />
      </div>
    </div>
  );
};

export default Alert;

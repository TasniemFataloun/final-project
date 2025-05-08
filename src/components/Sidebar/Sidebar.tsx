import style from "./Sidebar.module.css";
import { useAppDispatch } from "../../redux/store";
import { addElement } from "../../redux/slices/elementsSlice";

const Sidebar = () => {
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "rectangle" || value === "circle" || value === "square") {
      dispatch(addElement(value));
    }
  };

  return (
    <div className={style.sidebar}>
      <p>Add</p>
      <select className={style.select} onChange={handleChange}>
        <option value="">-- Select --</option>
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="square">Square</option>
      </select>
    </div>
  );
};

export default Sidebar;

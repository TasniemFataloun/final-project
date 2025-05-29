import { configureStore, Store } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import animationReducer, { AnimationActionType } from "./slices/animationSlice";
import alertReducer from "./slices/alertSlice";
import timelineReducer from "./slices/timelineSlice";
import editModeReducer from "./slices/editModeSlice"; 

const store = configureStore({
  reducer: {
    animation: animationReducer,
    alert: alertReducer,
    timeline: timelineReducer,
    editMode: editModeReducer,
  },
});

export type AppStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
export type AppActionsType = AnimationActionType;

export type AppStoreType = Store<AppStateType, AppActionsType>; //this is the type of the store object

export const useAppSelector = useSelector.withTypes<AppStateType>();
export const useAppDispatch = useDispatch.withTypes<AppDispatchType>();
export const useAppStore = useStore.withTypes<AppStoreType>(); // this useAppStore is used to get the store object

export default store;

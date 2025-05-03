/* import { create } from 'zustand';

interface AnimationState {
  config: {
    duration: string;
    timingFunction: string;
    delay: string;
    iterationCount: string;
    transform: {
      scale: string;
      rotate: string;
      translateX: string;
      translateY: string;
    };
    opacity: string;
    width: string;
    height: string;
  };
  isPlaying: boolean;
  setConfig: (config: any) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  TestAnimation: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  config: {
    duration: '1',
    timingFunction: 'ease',
    delay: '0',
    iterationCount: 'infinite',
    transform: {
      scale: '1',
      rotate: '0',
      translateX: '0',
      translateY: '0',
    },
    opacity: '1',
    width: '128',
    height: '128',
  },
  isPlaying: true,
  setConfig: (config) => set({ config }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  TestAnimation: () => set({
    config: {
      duration: '2',
      timingFunction: 'ease-in-out',
      delay: '0',
      iterationCount: 'infinite',
      transform: {
        scale: '0',
        rotate: '360',
        translateX: '0',
        translateY: '0',
      },
      opacity: '1',
      width: '128',
      height: '128',
    },
    isPlaying:true
  }),
})); */

import { configureStore, Store } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import animationReducer, { AnimationActionType } from "./slices/animationSlice";
import alertReducer from "./slices/alertSlice";

const store = configureStore({
  reducer: {
    animation: animationReducer,
    alert: alertReducer,
    // other reducers...
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

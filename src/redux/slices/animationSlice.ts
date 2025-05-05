import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationType } from "../../types/animationType";

export type AnimationState = {
  config: AnimationType;
  isPlaying: boolean;
};

export const initialState: AnimationState = {
  config:
    {
      id: "square",
      type: "square",
      animation: {
        duration: "1",
        timingFunction: "ease-in-out",
        delay: "0",
        iterationCount: "infinite",
      },
      size: {
        width: "200",
        height: "200",
      },
      transform: {
        scale: "1",
        rotate: "0",
        translateX: "0",
        translateY: "0",
      },
      opacity: "1",
    },
  isPlaying: true,
};

const animationSlice = createSlice({
  name: "animationSlice",
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<AnimationType>) => {
      state.config = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    }
  },
});

export const { setConfig, setIsPlaying } =
  animationSlice.actions;
export type AnimationActionType =
  | typeof setConfig
  | typeof setIsPlaying

export default animationSlice.reducer;

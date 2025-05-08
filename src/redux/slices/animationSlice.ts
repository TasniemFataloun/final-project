import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationType } from "../../types/animationType";

export type AnimationState = {
  config: AnimationType;
  isPlaying: boolean;
};

export const initialState: AnimationState = {
  config: {
    id: "",
    type: "",
    animation: {
      duration: "",
      timingFunction: "",
      delay: "",
      iterationCount: "",
    },
    size: {
      width: "",
      height: "",
    },
    transform: {
      scale: "",
      rotate: "",
      translateX: "",
      translateY: "",
    },
    opacity:{
      opacity: "",
      borderRadius: "",
    },
    backgroundColor: "",
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
    },
  },
});

export const { setConfig, setIsPlaying } = animationSlice.actions;
export type AnimationActionType = typeof setConfig | typeof setIsPlaying;

export default animationSlice.reducer;

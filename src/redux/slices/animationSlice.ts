import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TransformConfig = {
  scale: string;
  rotate: string;
  translateX: string;
  translateY: string;
};

export type AnimationConfig = {
  duration: string;
  timingFunction: string;
  delay: string;
  iterationCount: string;
  transform: TransformConfig;
  opacity: string;
  width: string;
  height: string;
};

export type AnimationState = {
  config: AnimationConfig;
  isPlaying: boolean;
};

const initialState: AnimationState = {
  config: {
    duration: "1",
    timingFunction: "ease",
    delay: "0",
    iterationCount: "infinite",
    transform: {
      scale: "1",
      rotate: "0",
      translateX: "0",
      translateY: "0",
    },
    opacity: "1",
    width: "128",
    height: "128",
  },
  isPlaying: true,
};

const animationSlice = createSlice({
  name: "animationSlice",
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<AnimationConfig>) => {
      state.config = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    testAnimation: (state) => {
      state.config = {
        duration: "2",
        timingFunction: "ease-in-out",
        delay: "0",
        iterationCount: "infinite",
        transform: {
          scale: "0",
          rotate: "360",
          translateX: "0",
          translateY: "0",
        },
        opacity: "1",
        width: "128",
        height: "128",
      };
      state.isPlaying = true;
    },
  },
});

export const { setConfig, setIsPlaying, testAnimation } =
  animationSlice.actions;
export type AnimationActionType =
  | typeof setConfig
  | typeof setIsPlaying
  | typeof testAnimation;

export default animationSlice.reducer;

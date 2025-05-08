// timelineSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TimelineState = {
  selectedKeyframe: "default" | "current" | null;
  isOpenLayer: boolean;
};

const initialState: TimelineState = {
  selectedKeyframe: null,
  isOpenLayer: false,
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    setSelectedKeyframe: (
      state,
      action: PayloadAction<"default" | "current" | null>
    ) => {
      state.selectedKeyframe = action.payload;
    },
    toggleLayer: (state) => {
      state.isOpenLayer = !state.isOpenLayer;
    },
  },
});

export const { setSelectedKeyframe, toggleLayer } = timelineSlice.actions;
export type TimelineActionType =
  | typeof setSelectedKeyframe
  | typeof toggleLayer;

export default timelineSlice.reducer;

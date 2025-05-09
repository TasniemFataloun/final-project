import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TimelineState = {
  selectedKeyframe: "default" | "current" | null;
  openLayers: Record<string, boolean>; // key = element ID
};

const initialState: TimelineState = {
  selectedKeyframe: null,
  openLayers: {},
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
    toggleLayer: (state, action) => {
      const elementId = action.payload;
      state.openLayers[elementId] = !state.openLayers[elementId];
    },
    setOpenLayer: (state, action) => {
      const elementId = action.payload;
      state.openLayers[elementId] = true;
    },
  },
});

export const { setSelectedKeyframe, toggleLayer, setOpenLayer } =
  timelineSlice.actions;
export type TimelineActionType =
  | typeof setSelectedKeyframe
  | typeof toggleLayer
  | typeof setOpenLayer;

export default timelineSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TimelineState {
  expandedLayers: Record<string, boolean>;
  expandedProperties: Record<string, boolean>;
  isDragging: boolean;
  isSelectedKeyframe: {
    layerId: string;
    property: string;
    keyframeId: string;
  } | null;
}

const initialState: TimelineState = {
  expandedLayers: {},
  expandedProperties: {} as Record<string, boolean>,
  isDragging: false,
  isSelectedKeyframe: null,
};

const timelineSlice = createSlice({
  name: "timeline",
  initialState,
  reducers: {
    toggleLayer(state, action: PayloadAction<string>) {
      const layerId = action.payload;
      state.expandedLayers[layerId] = !state.expandedLayers[layerId];
    },
    togglePropertyGroup: (
      state,
      action: PayloadAction<{ layerId: string; groupName: string }>
    ) => {
      const { layerId, groupName } = action.payload;
      const key = `${layerId}-${groupName}`;
      state.expandedProperties[key] = !state.expandedProperties[key];
    },
    setIsDragging(state, action: PayloadAction<boolean>) {
      state.isDragging = action.payload;
    },
    resetTimelineUI(state) {
      state.expandedLayers = {};
      state.expandedProperties = {};
      state.isDragging = false;
    },
    setIsSelectedKeyframe(
      state,
      action: PayloadAction<{
        layerId: string;
        property: string;
        keyframeId: string;
      } | null>
    ) {
      state.isSelectedKeyframe = action.payload;
    },
  },
});

export const {
  toggleLayer,
  togglePropertyGroup,
  setIsDragging,
  resetTimelineUI,
  setIsSelectedKeyframe,
} = timelineSlice.actions;

export type TimelineStateType =
  | typeof toggleLayer
  | typeof togglePropertyGroup
  | typeof setIsDragging
  | typeof resetTimelineUI
  | typeof setIsSelectedKeyframe;

export default timelineSlice.reducer;

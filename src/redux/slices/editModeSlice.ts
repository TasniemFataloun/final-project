// store/slices/editModeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type EditMode = "class" | "timeline";

interface EditModeState {
  value: EditMode;
}

const initialState: EditModeState = {
  value: "timeline",
};

const editModeSlice = createSlice({
  name: "editMode",
  initialState,
  reducers: {
    setEditMode: (state, action: PayloadAction<EditMode>) => {
      state.value = action.payload;
    },
  },
});

export const { setEditMode } = editModeSlice.actions;
export type EditModeType = typeof setEditMode;

export default editModeSlice.reducer;

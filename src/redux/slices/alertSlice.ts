import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AlertState = {
  message: string;
  isOpen: boolean;
};

const initialState: AlertState = {
  message: "",
  isOpen: false,
};

const alertSlice = createSlice({
  name: "alertState",
  initialState,
  reducers: {
    setMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setMessage, setIsOpen } = alertSlice.actions;
export type AlertActionType = typeof setMessage | typeof setIsOpen;

export default alertSlice.reducer;

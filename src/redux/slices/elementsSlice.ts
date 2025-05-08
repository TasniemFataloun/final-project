import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationType } from "../../types/animationType";
import {
  importCircle,
  importRectangle,
  importSquare,
} from "../../config/importElementsProperties.config";

export type ElementType = "rectangle" | "circle" | "square";
export type ElementItem = {
  id: string;
  config: AnimationType;
};

type ElementsState = {
  elements: ElementItem[];
  selectedElementId: string | null;
};

const initialState: ElementsState = {
  elements: [],
  selectedElementId: null,
};

const elementsSlice = createSlice({
  name: "elements",
  initialState,
  reducers: {
    addElement: (state, action: PayloadAction<ElementType>) => {
      let config: AnimationType;

      switch (action.payload) {
        case "circle":
          config = importCircle;
          break;
        case "rectangle":
          config = importRectangle;
          break;
        case "square":
          config = importSquare;
          break;
      }

      const newElement: ElementItem = {
        id: Date.now().toString(),
        config: { ...config }, // copy to avoid mutation
      };

      state.elements.push(newElement);
    },

    setSelectedElementId: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },

    updateElementConfig: (state, action) => {
      const { id, config } = action.payload;
      const index = state.elements.findIndex((el) => el.id === id);
      if (index !== -1) {
        state.elements[index].config = config;
      }
      
      console.log("Updated element config:", 
        state.elements[index].config
      );
      
    },

    removeElement: (state, action: PayloadAction<string>) => {
      state.elements = state.elements.filter((el) => el.id !== action.payload);
    },
  },
});

export const {
  addElement,
  setSelectedElementId,
  updateElementConfig,
  removeElement,
} = elementsSlice.actions;

export type ElementsActionType =
  | typeof addElement
  | typeof setSelectedElementId
  | typeof updateElementConfig
  | typeof removeElement;

export default elementsSlice.reducer;

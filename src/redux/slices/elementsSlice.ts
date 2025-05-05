import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationType } from "../../types/animationType";
import {
  importCircle,
  importSquare,
} from "../../config/importElementsProperties.config";

export type ElementType = "rectangle" | "circle" | "square";
export type ElementItem = {
  id: string;
  type: ElementType;
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
          config = importSquare;
          break;
        case "square":
          config = importSquare;
          break;
        default:
          // fallback to square if unknown (optional)
          config = importSquare;
      }

      const newElement: ElementItem = {
        id: Date.now().toString(),
        type: action.payload,
        config: { ...config }, // copy to avoid mutation
      };

      state.elements.push(newElement);
    },

    setSelectedElementId: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },

    updateElementConfig: (state, action) => {
      const { id, config } = action.payload;
      const element = state.elements.find((el) => el.id === id);
      if (element) {
        element.config = config;
      }
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

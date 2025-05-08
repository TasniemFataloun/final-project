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
  type: ElementType;
  defaultConfig: AnimationType;
  currentConfig: AnimationType;
  keyframes?: Record<string, AnimationType>;
};

type ElementsState = {
  elements: ElementItem[];
  selectedElementId: string | null;
  defaultConfig?: AnimationType;
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
        type: action.payload, // store type so we know what it is
        defaultConfig: { ...config }, // default (from) values
        currentConfig: { ...config }, // initial current (to) values (same at first)
      };

      state.elements.push(newElement);
    },

    setSelectedElementId: (state, action: PayloadAction<string | null>) => {
      state.selectedElementId = action.payload;
    },

    updateElementConfig: (
      state,
      action: PayloadAction<{
        id: string;
        keyframe: string;
        config: AnimationType;
      }>
    ) => {
      const { id, keyframe, config } = action.payload;
      const element = state.elements.find((el) => el.id === id);
    
      if (element) {
        // Update only the relevant config field without overwriting the whole config
        if (keyframe === "default") {
          element.defaultConfig = {
            ...element.defaultConfig,
            ...config,  // Only update the relevant properties
          };
        } else if (keyframe === "current") {
          element.currentConfig = {
            ...element.currentConfig,
            ...config,  // Only update the relevant properties
          };
        }
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

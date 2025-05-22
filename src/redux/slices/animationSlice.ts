import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationConfigType, styleConfig } from "../../types/animationType";
import { Layer } from "../types/animations.type";
import {
  getDefaultConfig,
  getDefaultPropertiesGroup,
} from "../../helpers/GetDefaultPropertiesGroup";

export interface AnimationState {
  layers: Layer[];
  selectedLayerId: string | null;
  isPlaying: boolean;
  currentPosition: number;
  selectedKeyframe: {
    layerId: string;
    property: string;
    keyframeId: string;
  } | null;
}

export const initialState: AnimationState = {
  layers: [],
  selectedLayerId: null,
  isPlaying: false,
  currentPosition: 0,
  selectedKeyframe: null,
};

const animationSlice = createSlice({
  name: "animationSlice",
  initialState,
  reducers: {
    addLayer: (state, action: PayloadAction<Layer>) => {
      const type = action.payload.type;

      const existingCount = state.layers.filter(
        (layer) => layer.type === type
      ).length;

      const newLayer = {
        ...action.payload,
        name: `${type} ${existingCount + 1}`,
        editedPropertiesGroup: [],
        config: getDefaultConfig(type),
        style: {
          width:
            action.payload.style?.width ??
            getDefaultPropertiesGroup(type)?.width ??
            "",
          height:
            action.payload.style?.height ??
            getDefaultPropertiesGroup(type)?.height ??
            "",
          backgroundColor:
            action.payload.style?.backgroundColor ??
            getDefaultPropertiesGroup(type)?.backgroundColor ??
            "",
          borderRadius:
            action.payload.style?.borderRadius ??
            getDefaultPropertiesGroup(type)?.borderRadius ??
            "",
          opacity:
            action.payload.style?.opacity ??
            getDefaultPropertiesGroup(type)?.opacity ??
            "",
          transform:
            action.payload.style?.transform ??
            getDefaultPropertiesGroup(type)?.transform ??
            "",
          ...getDefaultPropertiesGroup(type),
          ...action.payload.style,
        },
      };
      state.layers.push(newLayer);
      state.selectedLayerId = newLayer.id;
    },

    removeLayer: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.layers = state.layers.filter((layer) => layer.id !== id);
      if (state.selectedLayerId === id) {
        state.selectedLayerId = null;
      }
    },
    updateLayer: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Layer> }>
    ) => {
      const { id, updates } = action.payload;
      const layer = state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      );
      state.layers = layer;
    },

    setSelectedLayer: (state, action: PayloadAction<string | null>) => {
      state.selectedLayerId = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    addKeyframe: (
      state,
      action: PayloadAction<{
        layerId: string;
        propertyName: string;
        percentage: number;
        value: any;
      }>
    ) => {
      const { layerId, propertyName, percentage, value } = action.payload;
      const roundedPercentage = Math.round(percentage * 100) / 100;

      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;

      if (!layer.editedPropertiesGroup) {
        layer.editedPropertiesGroup = [];
      }

      let prop = layer.editedPropertiesGroup.find(
        (p) => p.propertyName === propertyName
      );

      if (!prop) {
        prop = {
          propertyName,
          keyframes: [],
        };
        layer.editedPropertiesGroup.push(prop);
      }

      // Set unit
      const unit =
        propertyName === "rotate"
          ? "deg"
          : propertyName === "opacity" ||
            propertyName === "backgroundColor" ||
            propertyName === "scale"
          ? ""
          : "px";

      const existingKeyframe = prop.keyframes.find(
        (kf) => kf.percentage === roundedPercentage
      );

      if (existingKeyframe) {
        existingKeyframe.value = value;
      } else {
        prop.keyframes.push({
          id: `${propertyName}-${roundedPercentage}`,
          value,
          unit,
          percentage: roundedPercentage,
        });
      }

      prop.keyframes.sort((a, b) => a.percentage - b.percentage);
    },
    updatePropertyValue: (
      state,
      action: PayloadAction<{
        section: keyof AnimationConfigType; // used for layerPropertiesValue
        field: string;
        value: string;
      }>
    ) => {
      const { section, field, value } = action.payload;
      const layer = state.layers.find((l) => l.id === state.selectedLayerId);
       if (!layer || !layer.layerPropertiesValue) return;

      // 1. Update layerPropertiesValue
      if (!layer.layerPropertiesValue) {
        layer.layerPropertiesValue = {
          width: "",
          height: "",
          transform: "",
          opacity: "",
          backgroundColor: "",
          borderRadius: "",
        };
      }
      layer.layerPropertiesValue[section] = value;

      // 2. Ensure editedPropertiesGroup is initialized
      if (!layer.editedPropertiesGroup) {
        layer.editedPropertiesGroup = [];
      }

      // 3. Check if property exists
      const existingProperty = layer.editedPropertiesGroup.find(
        (p) => p.propertyName === field
      );

      // 4. Add if it doesn’t exist
      if (!existingProperty) {
        layer.editedPropertiesGroup.push({
          propertyName: field,
          keyframes: [],
        });
      }
    },
    setConfig: (
      state,
      action: PayloadAction<{
        section: keyof AnimationConfigType;
        field: string;
        value: string;
      }>
    ) => {
      const { field, value } = action.payload;
      const layer = state.layers.find((l) => l.id === state.selectedLayerId);
      if (!layer || !layer.config) return;
      layer.config = { ...layer.config, [field]: value };
    },

    setLayerConfigSettings: (
      state,
      action: PayloadAction<{
        layerId: string;
        style: styleConfig;
      }>
    ) => {
      const { layerId, style } = action.payload;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;

      layer.style = {
        ...layer.style,
        ...style,
      };
    },

    setSelectedKeyframe: (
      state,
      action: PayloadAction<{
        layerId: string;
        property: string;
        keyframeId: string;
      }>
    ) => {
      state.selectedKeyframe = {
        layerId: action.payload.layerId,
        property: action.payload.property,
        keyframeId: action.payload.keyframeId,
      };
    },

    setCurrentPosition: (state, action: PayloadAction<number>) => {
      state.currentPosition = action.payload;
    },
    removeSelectedKeyframe: (state) => {
      const selected = state.selectedKeyframe;
      if (!selected) return;

      const { layerId, property, keyframeId } = selected;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer || !layer.editedPropertiesGroup) return;

      const propIndex = layer.editedPropertiesGroup.findIndex(
        (p) => p.propertyName === property
      );

      if (propIndex === -1) return;

      const prop = layer.editedPropertiesGroup[propIndex];

      // Remove the selected keyframe
      prop.keyframes = prop.keyframes.filter((kf) => kf.id !== keyframeId);

      // Remove the entire property if keyframes are empty or only one with 0%
      if (
        prop.keyframes.length === 0 ||
        (prop.keyframes.length === 1 && prop.keyframes[0].percentage === 0)
      ) {
        layer.editedPropertiesGroup.splice(propIndex, 1);
      }

      state.selectedKeyframe = null;
    },
  },
});

export const {
  addLayer,
  addKeyframe,
  updatePropertyValue,
  removeLayer,
  updateLayer,
  setSelectedLayer,
  setIsPlaying,
  setConfig,
  setLayerConfigSettings,
  setSelectedKeyframe,
  setCurrentPosition,
  removeSelectedKeyframe,
} = animationSlice.actions;

export type AnimationActionType =
  | typeof addLayer
  | typeof addKeyframe
  | typeof updatePropertyValue
  | typeof removeLayer
  | typeof updateLayer
  | typeof setSelectedLayer
  | typeof setIsPlaying
  | typeof setConfig
  | typeof setLayerConfigSettings
  | typeof setSelectedKeyframe
  | typeof setCurrentPosition
  | typeof removeSelectedKeyframe;

export default animationSlice.reducer;

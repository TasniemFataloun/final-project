import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationConfigType } from "../../types/animationType";
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
      const newLayer = {
        ...action.payload,
        editedPropertiesGroup: [],
        config: getDefaultConfig(action.payload.type),
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
        groupName: string;
        propertyName: string;
        percentage: number;
        value: any;
      }>
    ) => {
      const { layerId, groupName, propertyName, percentage, value } =
        action.payload;
      const roundedPercentage = Math.round(percentage * 100) / 100;

      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;

      const group = layer.editedPropertiesGroup?.find(
        (g) => g.name === groupName
      );
      if (!group) return;

      const prop = group.propertiesList.find(
        (p) => p.propertyName === propertyName
      );
      if (!prop) return;

      const unit =
        groupName === "transform" && propertyName === "rotate"
          ? "deg"
          : groupName === "opacity"
          ? ""
          : "px";

      // If this property has no keyframes yet, add a default 0% keyframe
      const hasZeroKeyframe = prop.keyframes.some((kf) => kf.percentage === 0);
      if (!hasZeroKeyframe) {
        const defaultValue =
          getDefaultPropertiesGroup(layer.type)?.[groupName]?.[propertyName] ??
          0;

        prop.keyframes.push({
          id: `${propertyName}-0`,
          value: defaultValue,
          unit,
          percentage: 0,
        });
      }

      if (roundedPercentage !== 0) {
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
      }

      prop.keyframes.sort((a, b) => a.percentage - b.percentage);
    },
    updatePropertyValue: (
      state,
      action: PayloadAction<{
        section: keyof AnimationConfigType;
        field: string;
        value: string;
      }>
    ) => {
      const { section, field, value } = action.payload;
      const layer = state.layers.find((l) => l.id === state.selectedLayerId);
      if (!layer || !layer.layerPropertiesValue) return;
      // Update the layer properties value
      layer.layerPropertiesValue[section] = {
        ...(layer.layerPropertiesValue[section] || {}),
        [field]: value,
      };
      const propertyExists = layer.editedPropertiesGroup?.some((group) =>
        group.propertiesList.some((p) => p.propertyName === field)
      );

      if (!propertyExists) {
        const newProperty = {
          propertyName: field,
          keyframes: [],
        };

        const group = layer.editedPropertiesGroup?.find(
          (g) => g.name === section
        );

        if (group) {
          group.propertiesList.push(newProperty);
        } else {
          layer.editedPropertiesGroup?.push({
            name: section as string,
            propertiesList: [newProperty],
          });
        }
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

      // Remove the keyframe from the selected layer's edited properties group
      for (const group of layer.editedPropertiesGroup) {
        const prop = group.propertiesList.find(
          (p) => p.propertyName === property
        );
        // If the property exists, filter out the keyframe
        if (prop) {
          prop.keyframes = prop.keyframes.filter((kf) => kf.id !== keyframeId);
        }
      }

      if (layer.layerPropertiesValue) {
        for (const groupName in layer.layerPropertiesValue) {
          if (layer.layerPropertiesValue[groupName].hasOwnProperty(property)) {
            layer.layerPropertiesValue[groupName][property] = ""; // or undefined if you prefer
            break;
          }
        }
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
  | typeof setSelectedKeyframe
  | typeof setCurrentPosition
  | typeof removeSelectedKeyframe;

export default animationSlice.reducer;

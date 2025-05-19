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
          ...(getDefaultPropertiesGroup(type) || {}),
          ...(action.payload.style || {}),
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
          ? "px"
          : groupName === "opacity"
          ? ""
          : groupName === "transform" && propertyName === "scale"
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
      if (!layer) return;
      if (!layer.style) {
        layer.style = {};
      }
      if (!layer.editedPropertiesGroup) return;

      for (let i = layer.editedPropertiesGroup.length - 1; i >= 0; i--) {
        const group = layer.editedPropertiesGroup[i];

        const propIndex = group.propertiesList.findIndex(
          (p) => p.propertyName === property
        );
        if (propIndex === -1) continue;

        const prop = group.propertiesList[propIndex];

        // Remove the selected keyframe
        prop.keyframes = prop.keyframes.filter((kf) => kf.id !== keyframeId);

        if (prop.keyframes.length === 1 && prop.keyframes[0].percentage === 0) {
          prop.keyframes = [];
        }

        if (prop.keyframes.length === 0) {
          group.propertiesList.splice(propIndex, 1);

          if (layer.style && property in layer.style) {
            delete (layer.style as any)[property];
          }
        }

        if (group.propertiesList.length === 0) {
          layer.editedPropertiesGroup.splice(i, 1);
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

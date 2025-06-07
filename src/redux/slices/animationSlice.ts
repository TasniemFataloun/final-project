import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AnimationConfigType, styleConfig } from "../../types/animationType";
import { Layer, Propertykeyframes } from "../types/animations.type";
import { getDefaultConfig } from "../../helpers/GetDefaultPropertiesGroup";
import { transformKeys } from "../../config/importElementsProperties.config";
import { RootState } from "@reduxjs/toolkit/query";

export interface AnimationState {
  layers: Layer[];
  selectedLayerId: string | null;
  isPlaying: boolean;
  currentPosition: number;
  selectedKeyframe: {
    layerId: string;
    property: string;
    keyframe: Propertykeyframes;
  } | null;
  copyKeyframe: Propertykeyframes | null;
}

export const initialState: AnimationState = {
  layers: [],
  selectedLayerId: null,
  isPlaying: false,
  currentPosition: 0,
  selectedKeyframe: null,
  copyKeyframe: null,
};

const animationSlice = createSlice({
  name: "animationSlice",
  initialState,
  reducers: {
    addLayer: (state, action: PayloadAction<Layer>) => {
      const type = action.payload.type;
      const layer = action.payload;
      const existingCount = state.layers.filter(
        (layer) => layer.type === type
      ).length;

      const newLayer = {
        ...layer,
        id: action.payload.id,
        name: `${type} ${existingCount + 1}`,
        type,
        visible: true,
        locked: false,
        editedPropertiesGroup: [],
        config: getDefaultConfig(type),
      };
      state.layers.push(newLayer);
      state.selectedLayerId = newLayer.id;
    },
    removeLayer: (state, action: PayloadAction<string>) => {
      const idToRemove = action.payload;

      // Recursive helper function to get all descendant IDs
      const getAllDescendants = (parentId: string): string[] => {
        const directChildren = state.layers.filter(
          (layer) => layer.parentId === parentId
        );
        const descendants = directChildren.flatMap((child) =>
          getAllDescendants(child.id)
        );
        return directChildren.map((child) => child.id).concat(descendants);
      };

      // Get all IDs to remove: target + all descendants
      const allIdsToRemove = [idToRemove, ...getAllDescendants(idToRemove)];

      // Filter out all these IDs from layers
      state.layers = state.layers.filter(
        (layer) => !allIdsToRemove.includes(layer.id)
      );

      // Clear selectedLayerId
      if (
        state.selectedLayerId &&
        allIdsToRemove.includes(state.selectedLayerId)
      ) {
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
    renameLayer: (
      state,
      action: PayloadAction<{ id: string; newName: string }>
    ) => {
      const { id, newName } = action.payload;
      const layer = state.layers.find((layer) => layer.id === id);
      if (layer) {
        layer.name = newName;
      }
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
      const { layerId, propertyName, groupName, percentage, value } =
        action.payload;
      const roundedPercentage = Math.round(
        Math.max(0, Math.min(100, percentage))
      );

      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer || !layer.editedPropertiesGroup) return;

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

      const unit =
        groupName === "transform" && propertyName === "rotate"
          ? "deg"
          : groupName === "opacity"
          ? ""
          : groupName === "backgroundColor" &&
            propertyName === "backgroundColor"
          ? ""
          : groupName === "transform" && propertyName === "scale"
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
      // 5. Sort keyframes
    },
    updateKeyframePercentage: (
      state,
      action: PayloadAction<{
        layerId: string;
        property: string;
        keyframeId: string;
        newPercentage: number;
      }>
    ) => {
      const { layerId, property, keyframeId, newPercentage } = action.payload;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;

      const prop = layer.editedPropertiesGroup?.find(
        (p) => p.propertyName === property
      );
      if (!prop) return;

      const keyframe = prop.keyframes.find((kf) => kf.id === keyframeId);
      if (!keyframe) return;

      // Clamp and round to 2 decimal places
      keyframe.percentage = Math.round(
        Math.max(0, Math.min(100, newPercentage))
      );
    },
    copyKeyframe: (state, action: PayloadAction<Propertykeyframes>) => {
      state.copyKeyframe = action.payload;
    },
    pasteKeyframe: (
      state,
      action: PayloadAction<{
        layerId: string;
        property: string;
        newPercentage: number;
      }>
    ) => {
      const { layerId, property, newPercentage } = action.payload;
      const copied = state.copyKeyframe;
      if (!copied) return;

      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer || !layer.editedPropertiesGroup) return;

      const prop = layer.editedPropertiesGroup.find(
        (p) => p.propertyName === property
      );
      if (!prop) return;

      // Create a new keyframe with the NEW position (not the copied one)
      const newKeyframe = {
        ...copied,
        id: `${copied.id}-pasted-${Date.now()}`, // Ensure unique ID
        percentage: Math.round(Math.max(0, Math.min(100, newPercentage))), // Use newPercentage
      };

      prop.keyframes.push(newKeyframe);
    },
    duplicateLayer: (state, action: PayloadAction<string>) => {
      const layerId = action.payload;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;
      const newLayer: Layer = {
        ...layer,
        id: `${layer.id} copy`, // Ensure unique ID
        name: `${layer.name} copy`, // Ensure unique name
        editedPropertiesGroup:
          layer.editedPropertiesGroup?.map((prop) => ({
            ...prop,
            keyframes: prop.keyframes.map((kf) => ({
              ...kf,
              id: `${kf.id}-copy-${Date.now()}`, // Ensure unique ID
            })),
          })) || [],
        style: { ...layer.style }, // Duplicate style
        config: {
          ...layer.config,
          duration: layer.config?.duration ?? 0,
          timingFunction: layer.config?.timingFunction ?? "linear",
          delay: layer.config?.delay ?? 0,
          iterationCount: layer.config?.iterationCount ?? 1,
        },
      };
      state.layers.push(newLayer);
      state.selectedLayerId = newLayer.id;
    },

    updatePropertyValue: (
      state,
      action: PayloadAction<{
        section: keyof AnimationConfigType;
        field: string;
        value: string;
        unit?: string;
      }>
    ) => {
      const { field, value, unit } = action.payload;

      const selected = state.selectedKeyframe;
      if (!selected) return;

      const { layerId, property, keyframe } = selected;
      if (property !== field) return;

      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return;

      const prop = layer.editedPropertiesGroup?.find(
        (p) => p.propertyName === property
      );
      if (!prop) return;

      const kf = prop.keyframes.find((kf) => kf.id === keyframe.id);
      if (!kf) return;
      kf.value = value;
      if (unit !== undefined) kf.unit = unit;
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
        keyframe: Propertykeyframes;
      }>
    ) => {
      state.selectedKeyframe = {
        layerId: action.payload.layerId,
        property: action.payload.property,
        keyframe: action.payload.keyframe,
      };
    },

    setCurrentPosition: (state, action: PayloadAction<number>) => {
      state.currentPosition = action.payload;
    },
    removeSelectedKeyframe: (state) => {
      const selected = state.selectedKeyframe;
      if (!selected) return;

      const { layerId, property, keyframe } = selected;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer || !layer.editedPropertiesGroup) return;

      layer.editedPropertiesGroup = layer.editedPropertiesGroup
        .map((prop) => {
          if (prop.propertyName !== property) return prop;

          const filteredKeyframes = prop.keyframes.filter(
            (kf) => kf.id !== keyframe.id
          );

          if (filteredKeyframes.length === 0) {
            const el = document.querySelector(
              `[data-layer-id="${layer.id}"]`
            ) as HTMLElement | null;

            if (el && layer.style) {
              if (transformKeys.includes(property as any)) {
                el.style.transform = layer.style.transform;
              } else {
                el.style[property as any] = String(
                  layer.style[property as any]
                );
              }
            }
          }

          return { ...prop, keyframes: filteredKeyframes };
        })
        .filter((prop) => prop.keyframes.length > 0);
    },
  },
});

export const {
  addLayer,
  addKeyframe,
  renameLayer,
  updateKeyframePercentage,
  copyKeyframe,
  duplicateLayer,
  pasteKeyframe,
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
  | typeof renameLayer
  | typeof updateKeyframePercentage
  | typeof copyKeyframe
  | typeof duplicateLayer
  | typeof pasteKeyframe
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

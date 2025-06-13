import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { AnimationConfigType, styleConfig } from "../../types/animationType";
import { Layer, Propertykeyframes } from "../types/animations.type";
import { getDefaultConfig } from "../../helpers/GetDefaultPropertiesGroup";
import { transformKeys } from "../../config/elementsProperties.config";
import { defaultUnits } from "../../config/defaultUnits.config";

const loadStateFromLocalStorage = (): AnimationState | undefined => {
  try {
    const serializedState = localStorage.getItem("animationState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState) as AnimationState;
  } catch (e) {
    console.error("Failed to load state", e);
    return undefined;
  }
};

const persistedState = loadStateFromLocalStorage();

export const initialState: AnimationState = persistedState || {
  layers: [],
  selectedLayerId: null,
  isPlaying: false,
  currentPosition: 0,
  selectedKeyframe: null,
  copyKeyframe: null,
};

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
        propertyName: string;
        percentage: number;
        value: any;
        unit?: string;
      }>
    ) => {
      const {
        layerId,
        propertyName,
        percentage,
        value,
        unit: unitFromPayload,
      } = action.payload;
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

      // use unit from payload if provided, otherwise fallback to default
      const unit =
        (unitFromPayload && unitFromPayload !== "" ? unitFromPayload : null) ||
        defaultUnits[propertyName] ||
        defaultUnits["default"] ||
        "";

      const existingKeyframe = prop.keyframes.find(
        (kf) => kf.percentage === roundedPercentage
      );

      if (existingKeyframe) {
        existingKeyframe.value = value;
        if (unit !== undefined) existingKeyframe.unit = unit;
      } else {
        prop.keyframes.push({
          id: `${propertyName}-${roundedPercentage}-${nanoid()}`,
          value,
          unit,
          percentage: roundedPercentage,
        });
      }
    },

    updateKeyframeUnit: (
      state,
      action: PayloadAction<{
        layerId: string;
        propertyName: string;
        percentage: number;
        unit: string;
      }>
    ) => {
      const { layerId, propertyName, percentage, unit } = action.payload;
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer || !layer.editedPropertiesGroup) return;

      const prop = layer.editedPropertiesGroup.find(
        (p) => p.propertyName === propertyName
      );
      if (!prop) return;

      const keyframe = prop.keyframes.find(
        (kf) => kf.percentage === percentage
      );
      if (keyframe) {
        keyframe.unit = unit;
      }
    },

    updateKeyframe: (
      state,
      action: PayloadAction<{
        layerId: string;
        property: string;
        keyframe: Propertykeyframes;
      }>
    ) => {
      const { layerId, property, keyframe } = action.payload;
      const layer = state.layers.find((l) => l.id === layerId);

      if (!layer || !layer.editedPropertiesGroup) return;

      layer.editedPropertiesGroup = layer.editedPropertiesGroup.map((prop) => {
        if (prop.propertyName !== property) return prop;

        const updatedKeyframes = prop.keyframes.map((kf) =>
          kf.id === keyframe.id ? keyframe : kf
        );
        return {
          ...prop,
          keyframes: updatedKeyframes,
        };
      });
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
        id: `${copied.id}-pasted-${nanoid()}`, // Ensure unique ID
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
        id: `${layer.id} copy -${nanoid()}`,
        name: `${layer.name} copy`,
        editedPropertiesGroup:
          layer.editedPropertiesGroup?.map((prop) => ({
            ...prop,
            keyframes: prop.keyframes.map((kf) => ({
              ...kf,
              id: `${kf.id}-copy-${Date.now()}`,
            })),
          })) || [],
        style: { ...layer.style },
        config: {
          ...layer.config,
          duration: layer.config?.duration ?? 0,
          timingFunction: layer.config?.timingFunction ?? "linear",
          delay: layer.config?.delay ?? 0,
          iterationCount: layer.config?.iterationCount ?? "1",
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

    lockLayer: (
      state,
      action: PayloadAction<{ id: string; locked: boolean }>
    ) => {
      const { id, locked } = action.payload;
      const layer = state.layers.find((l) => l.id === id);
      if (layer) {
        layer.locked = locked;
      }
    },
    updateLayerOrder(state, action: PayloadAction<Layer[]>) {
      state.layers = action.payload;
    },
  },
});

export const {
  addLayer,
  addKeyframe,
  updateKeyframeUnit,
  renameLayer,
  updateKeyframe,
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
  lockLayer,
  updateLayerOrder,
} = animationSlice.actions;

export type AnimationActionType =
  | typeof addLayer
  | typeof addKeyframe
  | typeof updateKeyframeUnit
  | typeof renameLayer
  | typeof updateKeyframe
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
  | typeof removeSelectedKeyframe
  | typeof lockLayer
  | typeof updateLayerOrder;

export default animationSlice.reducer;

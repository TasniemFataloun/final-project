import { AnimationType } from "../types/animationType";

export function getSelectedConfig(
    keyframe: string,
    defaultConfig: AnimationType,
    currentConfig: AnimationType,
/*     keyframes: Record<string, AnimationType>
 */  ) {
    // If keyframe is "default" or not selected, return empty values
    if (keyframe !== "current" && keyframe !== "default") {
      return {}; // Return empty fields if no keyframe is selected
    }

    // Else, return currentConfig or defaultConfig
    return {
      ...defaultConfig,
      ...currentConfig,
    };
  }
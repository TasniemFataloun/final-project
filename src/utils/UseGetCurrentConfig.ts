import { ElementItem } from "../redux/slices/elementsSlice";
import { AnimationType } from "../types/animationType";

export const getCurrentConfig = (
  el: ElementItem,
  keyframe: string
): AnimationType => {
  if (keyframe === "default" || !el.keyframes?.[keyframe]) {
    return el.defaultConfig;
  }
  return { ...el.defaultConfig, ...el.keyframes[keyframe] };
};

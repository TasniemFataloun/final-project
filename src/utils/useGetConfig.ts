export const getSelectedConfig = (
  selectedKeyframe: string,
  defaultElementValue: any,
  currentElementValue: any,
  keyframes: Record<string, any> = {}
) => {
  if (selectedKeyframe === "default" && defaultElementValue) {
    return defaultElementValue;
  } else if (selectedKeyframe === "current" && currentElementValue) {
    return currentElementValue;
  } else if (keyframes[selectedKeyframe]) {
    return keyframes[selectedKeyframe];
  }
  // fallback to current if nothing else
  return currentElementValue || defaultElementValue || {};
};

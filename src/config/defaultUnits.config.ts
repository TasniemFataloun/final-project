export const defaultUnits: Record<string, string> = {
  translateX: "px",
  translateY: "px",
  rotate: "deg",
  scale: "",
  opacity: "",
  backgroundColor: "",
  borderRadius: "%",
  border: "px",
  borderColor: "",
  width: "px",
  height: "px",
  // fallback
  size: "px",
};

export const propertiesUnits: Record<string, string[]> = {
  width: ["px", "rem"],
  height: ["px", "rem"],
  borderRadius: ["px", "rem", "%"],
  borderWidth: ["px", "rem"],
  opacity: [],
  transform: ["px", "rem", "deg"],
  translateX: ["px", "rem"],
  translateY: ["px", "rem"],
  rotate: ["deg"],
  scale: [],
};

export const getAllowedUnits = (propertyName: string): string[] => {
  return propertiesUnits[propertyName] || [];
};

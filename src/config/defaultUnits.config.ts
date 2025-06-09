export const defaultUnits: Record<string, string> = {
  translateX: "px",
  translateY: "px",
  rotate: "deg",
  scale: "",
  opacity: "",
  backgroundColor: "",
  borderRadius: "%",
  width: "px", 
  height: "px",
  // fallback
  size: "px",
};

export const propertiesUnits: Record<string, string[]> = {
  width: ["px", "rem", "%"],
  height: ["px", "rem", "%"],
  borderRadius: ["px", "rem", "%"],
  opacity: [],
  background: [],
  translateX: ["px", "rem", "%"],
  translateY: ["px", "rem", "%"],
  rotate: ["deg", "rad"],
  scale: [],
};

export const getAllowedUnits = (propertyName: string): string[] => {
  return propertiesUnits[propertyName] || [];
};

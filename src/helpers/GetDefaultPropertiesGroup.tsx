import {
  importCircle,
  importRectangle,
  importSquare,
} from "../config/importElementsProperties.config";

export const getDefaultPropertiesGroup = (type: string) => {
  switch (type) {
    case "circle":
      return importCircle;
    case "rectangle":
      return importRectangle;
    case "square":
      return importSquare;
    default:
      return importSquare;
  }
};

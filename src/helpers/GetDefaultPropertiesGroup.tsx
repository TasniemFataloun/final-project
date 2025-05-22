import {
  importCircleProps,
  importCircleConfig,
  importRectangleProps,
  importRectangleConfig,
  importSquareProps,
  importSquareConfig,
} from "../config/importElementsProperties.config";

//props
export const getDefaultPropertiesGroup = (type: string) => {
  switch (type) {
    case "circle":
      return importCircleProps;
    case "rectangle":
      return importRectangleProps;
    case "square":
      return importSquareProps;
  }
};

//config
export const getDefaultConfig = (type: string) => {
  switch (type) {
    case "circle":
      return importCircleConfig;
    case "rectangle":
      return importRectangleConfig;
    case "square":
      return importSquareConfig;
    default:
      return importSquareConfig;
  }
};

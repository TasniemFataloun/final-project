import {
  importCircleProps,
  importCircleConfig,
  importRectangleProps,
  importRectangleConfig,
  importSquareProps,
  importSquareConfig,
  importCodeConfig,
  importOvalProps,
  importOvalConfig,
} from "../config/elementsProperties.config";

//props
export const getDefaultPropertiesGroup = (type: string) => {
  switch (type) {
    case "circle":
      return importCircleProps;
    case "rectangle":
      return importRectangleProps;
    case "square":
      return importSquareProps;
    case "oval":
      return importOvalProps;
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
    case "oval":
      return importOvalConfig;
    case "code":
      return importCodeConfig;
  }
};

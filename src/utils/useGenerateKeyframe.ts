import {
  importCircle,
  importRectangle,
  importSquare,
} from "../config/importElementsProperties.config";
import { AnimationType } from "../types/animationType";

export const UseGenerateKeyframes = (config: AnimationType) => {
  const {
    type, // Used as class name
    size,
    transform,
    opacity,
    backgroundColor,
  } = config;

  // Default values for each type (to use in the "from" state)
  const defaultValues = {
    circle: {
      size: {
        width: importCircle.size.width,
        height: importCircle.size.height,
      },
      transform: {
        scale: importCircle.transform.scale,
        rotate: importCircle.transform.rotate,
        translateX: importCircle.transform.translateX,
        translateY: importCircle.transform.translateY,
      },
      opacity: {
        opacity: importCircle.opacity.opacity,
        borderRadius: importCircle.opacity.borderRadius,
      },
      backgroundColor: importCircle.backgroundColor.backgroundColor,
    },
    rectangle: {
      size: {
        width: importRectangle.size.width,
        height: importRectangle.size.height,
      },
      transform: {
        scale: importRectangle.transform.scale,
        rotate: importRectangle.transform.rotate,
        translateX: importRectangle.transform.translateX,
        translateY: importRectangle.transform.translateY,
      },
      opacity: {
        opacity: importRectangle.opacity.opacity,
        borderRadius: importRectangle.opacity.borderRadius,
      },
      backgroundColor: importRectangle.backgroundColor.backgroundColor,
    },
    square: {
      size: {
        width: importSquare.size.width,
        height: importSquare.size.height,
      },
      transform: {
        scale: importSquare.transform.scale,
        rotate: importSquare.transform.rotate,
        translateX: importSquare.transform.translateX,
        translateY: importSquare.transform.translateY,
      },
      opacity: {
        opacity: importSquare.opacity.opacity,
        borderRadius: importSquare.opacity.borderRadius,
      },
      backgroundColor: importSquare.backgroundColor.backgroundColor,
    },
  };

  // Select the default configuration based on the element type
  const defaultConfig =
    defaultValues[config.type as keyof typeof defaultValues];

  // "From" state (initial state - default values)
  const fromWidth = defaultConfig.size.width;
  const fromHeight = defaultConfig.size.height;
  const fromTransform = `transform: scale(${defaultConfig.transform.scale}) rotate(${defaultConfig.transform.rotate}deg) translate(${defaultConfig.transform.translateX}px, ${defaultConfig.transform.translateY}px)`;
  const fromOpacity = defaultConfig.opacity.opacity;
  const fromBgColor = defaultConfig.backgroundColor;
  const fromBorderRadius = defaultConfig.opacity.borderRadius;

  // "To" state (modified state)
  const toWidth = size.width;
  const toHeight = size.height;
  const toTransform = `transform: scale(${transform.scale}) rotate(${transform.rotate}deg) translate(${transform.translateX}px, ${transform.translateY}px)`;
  const toOpacity = opacity.opacity;
  const toBgColor = backgroundColor || defaultConfig.backgroundColor;
  const toBorderRadius =
    opacity.borderRadius || defaultConfig.opacity.borderRadius;

  return `
/* Keyframes */
@keyframes animation-${type} {
  0% {
    /* This is the FROM state: always the default (initial state) */
    width: ${fromWidth}px;
    height: ${fromHeight}px;
    ${fromTransform};
    opacity: ${fromOpacity};
    background-color: ${fromBgColor};
    border-radius: ${fromBorderRadius}px;
  }
  100% {
    /* TO state: reflects the current config */
    width: ${toWidth}px;
    height: ${toHeight}px;
    ${toTransform};
    opacity: ${toOpacity};
    background-color: ${toBgColor};
    border-radius: ${toBorderRadius}px;
  }
}
`.trim();
};

import { AnimationConfigType, AnimationType } from "../types/animationType";

//animation config
export const importCircleConfig: AnimationConfigType = {
  type: "circle",
  duration: 1,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

export const importRectangleConfig: AnimationConfigType = {
  type: "rectangle",
  duration: 1,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

export const importSquareConfig: AnimationConfigType = {
  type: "square",
  duration: 1,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

//animation properties
export const importCircleProps: AnimationType = {
  type: "circle",
  size: {
    width: "50",
    height: "50",
  },
  transform: {
    scale: "1",
    rotate: "0",
    translateX: "0",
    translateY: "0",
  },
  opacity: {
    opacity: "1",
    borderRadius: "100",
  },
  backgroundColor: { backgroundColor: "#FFFFFF" },
};

export const importRectangleProps: AnimationType = {
  type: "rectangle",
  size: {
    width: "70",
    height: "50",
  },
  transform: {
    scale: "1",
    rotate: "0",
    translateX: "0",
    translateY: "0",
  },
  opacity: {
    opacity: "1",
    borderRadius: "0",
  },
  backgroundColor: { backgroundColor: "#000000" },
};

export const importSquareProps: AnimationType = {
  type: "square",
  size: {
    width: "50",
    height: "50",
  },
  transform: {
    scale: "1",
    rotate: "0",
    translateX: "0",
    translateY: "0",
  },
  opacity: {
    opacity: "1",
    borderRadius: "0",
  },
  backgroundColor: { backgroundColor: "#4A90E2" },
};

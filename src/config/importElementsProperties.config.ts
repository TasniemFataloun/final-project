import { AnimationType } from "../types/animationType";

export const importCircle: AnimationType = {
  type: "circle",
  animation: {
    duration: 1,
    timingFunction: "ease-in-out",
    delay: 0,
    iterationCount: "infinite",
  },
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

export const importRectangle: AnimationType = {
  type: "rectangle",
  animation: {
    duration: 1,
    timingFunction: "ease-in-out",
    delay: 0,
    iterationCount: "infinite",
  },
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

export const importSquare: AnimationType = {
  type: "square",
  animation: {
    duration: 1,
    timingFunction: "ease-in-out",
    delay: 0,
    iterationCount: "infinite",
  },
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

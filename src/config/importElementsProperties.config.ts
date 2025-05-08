import { AnimationType } from "../types/animationType";

export const importCircle: AnimationType = {
  id: "circle",
  type: "circle",
  animation: {
    duration: "1",
    timingFunction: "ease-in-out",
    delay: "0",
    iterationCount: "infinite",
  },
  size: {
    width: "200",
    height: "200",
  },
  transform: {
    scale: "1",
    rotate: "0",
    translateX: "0",
    translateY: "0",
  },
  opacity: {
    opacity: "1",
    borderRadius: "50",
  },
  backgroundColor: { backgroundColor: "#FFFFFF" },
};

export const importRectangle: AnimationType = {
  id: "rectangle",
  type: "rectangle",
  animation: {
    duration: "1",
    timingFunction: "ease-in-out",
    delay: "0",
    iterationCount: "infinite",
  },
  size: {
    width: "400",
    height: "200",
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
  id: "square",
  type: "square",
  animation: {
    duration: "1",
    timingFunction: "ease-in-out",
    delay: "0",
    iterationCount: "infinite",
  },
  size: {
    width: "200",
    height: "200",
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

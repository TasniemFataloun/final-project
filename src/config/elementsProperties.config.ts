import { AnimationConfigType, styleConfig } from "../types/animationType";

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

export const importCodeConfig: AnimationConfigType = {
  type: "code",
  duration: 3,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

export const importOvalConfig: AnimationConfigType = {
  type: "oval",
  duration: 1,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

export const defaultLayerConfig: AnimationConfigType = {
  type: "code",
  duration: 1,
  timingFunction: "ease-in-out",
  delay: 0,
  iterationCount: "infinite",
};

//transform properties

export const transformKeys = [
  "scale",
  "rotate",
  "translateX",
  "translateY",
] as const;
//end transform properties

// animation properties
export const importCircleProps: styleConfig = {
  type: "circle",
  width: "50px",
  height: "50px",
  backgroundColor: "#09CEFF",
  borderRadius: "50%",
  border: "",
  borderWidth: "",
  borderColor: "",
  borderStyle: "",
  opacity: "1",
  transform: "scale(1) rotate(0deg) translateX(0px) translateY(0px)",
};

export const importRectangleProps: styleConfig = {
  type: "rectangle",
  width: "70px",
  height: "50px",
  backgroundColor: "#FF3F34",
  borderRadius: "0%",
  opacity: "1",
  transform: "scale(1) rotate(0deg) translateX(0px) translateY(0px)",
};

export const importSquareProps: styleConfig = {
  type: "square",
  width: "50px",
  height: "50px",
  backgroundColor: "#fab687",
  borderRadius: "0%",
  opacity: "1",
  transform: "scale(1) rotate(0deg) translateX(0px) translateY(0px)",
};

export const importOvalProps: styleConfig = {
  type: "oval",
  width: "200px",
  height: "100px",
  backgroundColor: "#09CEFF",
  borderRadius: "100px / 50px",
  opacity: "1",
  transform: "scale(1) rotate(0deg) translateX(0px) translateY(0px)",
};

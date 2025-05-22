export type AnimationConfigType = {
  duration: number;
  timingFunction: string;
  delay: number;
  iterationCount: string;
  [key: string]: string | number;
};

export type styleConfig = {
  width: string;
  height: string;
  backgroundColor: string;
  borderRadius: string;
  opacity: string;
  transform: string;
  [key: string]: string;
};

/* export type sizeType = {
  width: string;
  height: string;
  [key: string]: string;
}; */

/* export type TransformType = {
  scale: string;
  rotate: string;
  translateX: string;
  translateY: string;
  [key: string]: string;
};

export type OpacityType = {
  opacity: string;
  [key: string]: string;
};

export type borderRadiusType = {
  borderRadius: string;
  [key: string]: string;
};

export type BackgroundColorType = {
  backgroundColor: string;
  [key: string]: string;
};
 */
export type AnimationType = {
  width: string;
  height: string;
  transform: string;
  opacity: string;
  borderRadius: string;
  backgroundColor: string;
  [key: string]: string; 
};

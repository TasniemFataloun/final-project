export type AnimationConfigType = {
  duration: string;
  timingFunction: string;
  delay: string;
  iterationCount: string;
  [key: string]: string;
};

export type sizeType = {
  width: string;
  height: string;
  [key: string]: string;
};

export type TransformType = {
  scale: string;
  rotate: string;
  translateX: string;
  translateY: string;
  [key: string]: string;
};

export type OpacityType = {
  opacity: string;
  borderRadius: string;
  [key: string]: string;
};

export type BackgroundColorType = {
  backgroundColor: string;
  [key: string]: string;
};

export type AnimationType = {
  animation: AnimationConfigType;
  size: sizeType;
  transform: TransformType;
  opacity: OpacityType;
  backgroundColor: BackgroundColorType;
  [key: string]: any;
};
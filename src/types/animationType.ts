export type AnimationConfigType = {
  duration: number;
  timingFunction: string;
  delay: number;
  iterationCount: string;
  [key: string]: string | number;
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
  [key: string]: string;
};

export type borderRadiusType = {
  borderRadius: string;
  [key: string]: string;  
}

export type BackgroundColorType = {
  backgroundColor: string;
  [key: string]: string;
};

export type AnimationType = {
  size: sizeType;
  transform: TransformType;
  opacity: OpacityType;
  borderRadius: borderRadiusType;
  backgroundColor: BackgroundColorType;
  [key: string]: any;
};

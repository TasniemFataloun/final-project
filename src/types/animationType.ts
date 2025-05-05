export type AnimationConfigType = {
  duration: string;
  timingFunction: string;
  delay: string;
  iterationCount: string;
};

export type sizeType = {
  width: string;
  height: string;
};

export type TransformType = {
  scale: string;
  rotate: string;
  translateX: string;
  translateY: string;
};

export type AnimationType = {
  id: string;
  type: string;
  animation: AnimationConfigType;
  size: sizeType;
  transform: TransformType;
  opacity: string;
  borderRadius?: string;
};

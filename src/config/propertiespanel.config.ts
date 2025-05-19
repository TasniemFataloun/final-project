import { AnimationType } from "../types/animationType";

export const defaultConfig:AnimationType = {
  size: {
    width: "",
    height: "",
  },
  transform: {
    scale: "",
    rotate: "",
    translateX: "",
    translateY: "",
  },
  opacity: {
    opacity: "",
  },
  borderRadius: {
    borderRadius: "",
  },
  backgroundColor: {
    backgroundColor: "",
  },
};

export const ConfigSchema = {
  animation: {
    title: "Animation",
    fields: {
      duration: {
        label: "Duration (seconds)",
        type: "number",
        step: "0.1",
        min: "0",
      },
      timingFunction: {
        label: "Timing Function",
        type: "select",
        options: ["ease", "linear", "ease-in", "ease-out", "ease-in-out"],
      },
      delay: {
        label: "Delay (seconds)",
        type: "number",
        step: "0.1",
        min: "0",
      },
      iterationCount: {
        label: "Iteration Count",
        type: "select",
        options: ["infinite", "2", "3", "1"],
      },
    },
  },
};

export const propertiesSchema = {
  size: {
    title: "Size",
    fields: {
      width: { label: "Width (px)", type: "number", step: "1", min: "0" },
      height: { label: "Height (px)", type: "number", step: "1", min: "0" },
    },
  },
  opacity: {
    title: "Opacity",
    fields: {
      opacity: {
        label: "",
        type: "number",
        step: "0.1",
        min: "0",
        max: "1",
      },
    },
  },
  borderRadius: {
    title: "Border Radius",
    fields: {
      borderRadius: {
        label: "",
        type: "number",
        step: "1",
        min: "0",
      },
    },
  },
  backgroundColor: {
    title: "Background",
    fields: {
      backgroundColor: { label: "", type: "color" },
    },
  },
  transform: {
    title: "Transform",
    fields: {
      scale: { label: "Scale", type: "number", step: "0.1", min: "0" },
      rotate: { label: "Rotate (degrees)", type: "number" },
      translateX: { label: "Translate X (px)", type: "number" },
      translateY: { label: "Translate Y (px)", type: "number" },
    },
  },
};

type BaseFieldProps = {
  label: string;
  type: "text" | "number" | "select";
};

type NumberFieldProps = BaseFieldProps & {
  type: "number";
  step?: string;
  min?: string;
  max?: string;
};

type SelectFieldProps = BaseFieldProps & {
  type: "select";
  options: string[];
};

export type FieldProps = BaseFieldProps | NumberFieldProps | SelectFieldProps;

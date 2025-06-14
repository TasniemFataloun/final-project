import { AnimationType } from "../types/animationType";

export const defaultConfig: AnimationType = {
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
        type: "text",
      },
    },
  },
};

export const propertiesSchema = {
  size: {
    title: "Size",
    fields: {
      width: { label: "Width", type: "number", step: "1", min: "0" },
      height: { label: "Height", type: "number", step: "1", min: "0" },
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
  border: {
    title: "Border",
    fields: {
      borderWidth: {
        label: "Border Width",
        type: "number",
        step: "1",
        min: "0",
      },
      borderColor: {
        label: "Border color",
        type: "color",
      },
      borderStyle: {
        label: "Border style",
        type: "select",
        options: [
          "solid",
          "dashed",
          "dotted",
          "double",
          "groove",
          "ridge",
          "inset",
          "outset",
          "none",
          "hidden",
        ],
      },
    },
  },
  backgroundColor: {
    title: "Background Color",
    fields: {
      backgroundColor: { label: "", type: "color" },
    },
  },
  transform: {
    title: "Transform",
    fields: {
      scale: { label: "Scale", type: "number", step: "0.1", min: "0" },
      rotate: { label: "Rotate (degrees)", type: "number" },
      translateX: { label: "Translate X", type: "number" },
      translateY: { label: "Translate Y", type: "number" },
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

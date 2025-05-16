import { AnimationType } from "../../types/animationType";

export type ElementType = "rectangle" | "circle" | "square" | "code";

export interface Propertykeyframes {
  id: string;
  value: string;
  unit: string;
  percentage: number;
}

type PropertyItem = {
  propertyName: string;
  keyframes: Propertykeyframes[];
};

//properties in the layer
export type PropertiesGroup = {
  name: string;
  propertiesList: PropertyItem[];
};

export interface Layer {
  id: string;
  name: string;
  type: ElementType;
  visible?: boolean;
  locked?: boolean;
  style?: any;
  editedPropertiesGroup?: PropertiesGroup[];
  customHtml?: string;
  customCss?: string;
  config?: AnimationType;
}

import {
  AnimationConfigType,
  styleConfig,
} from "../../types/animationType";

export type ElementType = "rectangle" | "circle" | "square" | "code";

export interface Propertykeyframes {
  id: string;
  value: string;
  unit: string;
  percentage: number;
}

export type PropertyItem = {
  propertyName: string;
  keyframes: Propertykeyframes[];
};

export interface Layer {
  id: string;
  name?: string;
  tag?: any;
  type: ElementType;
  visible?: boolean;
  locked?: boolean;
  style: styleConfig;
  editedPropertiesGroup?: PropertyItem[];
  customHtml?: any;
 // customCss?: string;
  parentId?: string | null;
  selector?: string;
  config?: AnimationConfigType;
}

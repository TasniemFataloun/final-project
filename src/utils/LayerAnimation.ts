const interpolate = (from: number, to: number, t: number) => {
  return from + (to - from) * t;
};

const hexToRgba = (hex: string) => {
  if (hex === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  if (cleanHex.length === 6) {
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else if (cleanHex.length === 8) {
    r = (bigint >> 24) & 255;
    g = (bigint >> 16) & 255;
    b = (bigint >> 8) & 255;
    a = (bigint & 255) / 255;
  }

  return { r, g, b, a };
};

const interpolateColor = (from: string, to: string, t: number): string => {
  const fromRgba = hexToRgba(from);
  const toRgba = hexToRgba(to);

  const r = Math.round(interpolate(fromRgba.r, toRgba.r, t));
  const g = Math.round(interpolate(fromRgba.g, toRgba.g, t));
  const b = Math.round(interpolate(fromRgba.b, toRgba.b, t));
  const a = interpolate(fromRgba.a, toRgba.a, t);

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
};

function isValidCSSValue(property: string, valueWithUnit: string): boolean {
  const testEl = document.createElement("div");
  testEl.style[property as any] = "";
  testEl.style[property as any] = valueWithUnit;
  return testEl.style[property as any] !== "";
}

const isValidTransformFunction = (fnName: string, value: string): boolean => {
  const testEl = document.createElement("div");
  const transformValue = `${fnName}(${value})`;

  try {
    testEl.style.transform = "";
    testEl.style.transform = transformValue;
    return testEl.style.transform !== "";
  } catch {
    return false;
  }
};

const getDefaultValue = (propertyName: string, layer: any): string => {
  if (
    propertyName.includes("translate") ||
    propertyName === "scale" ||
    propertyName === "rotate" ||
    propertyName === "borderColor" ||
    propertyName === "borderStyle"
  ) {
    const matrix = new DOMMatrix(layer.style.transform || "none");

    switch (propertyName) {
      case "translateX":
        return `${matrix.m41}px`;
      case "translateY":
        return `${matrix.m42}px`;
      case "scale":
        return matrix.a.toString();
      case "rotate": {
        const angle = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;
        return `${angle}deg`;
      }
      case "borderColor":
        const val = layer.style[propertyName];
        return val && val.trim() ? val : "transparent";
      case "borderStyle":
        return layer.style[propertyName] || "dashed";
    }
  }

  return layer.style[propertyName] || "0";
};

const extractUnit = (value: string): string => {
  const match = value.match(/[a-z%]+$/i);
  return match ? match[0] : "";
};

const convert = (value: number, unit: string): number => {
  switch (unit) {
    case "px":
      return value;
    case "rem":
      return value * 16;
    case "deg":
      return value;
    case "rad":
      return value * (180 / Math.PI);
    default:
      return value;
  }
};

const applyInterpolatedStyle = (
  style: Record<string, string>,
  propertyName: string,
  fromVal: string,
  toVal: string,
  progress: number,
  fromUnit: string = "",
  toUnit: string = ""
) => {
  if (
    (fromVal.startsWith("#") || fromVal === "transparent") &&
    (toVal.startsWith("#") || toVal === "transparent")
  ) {
    style[propertyName] = interpolateColor(
      fromVal === "transparent" ? "#00000000" : fromVal,
      toVal === "transparent" ? "#00000000" : toVal,
      progress
    );
  } else {
    const from = convert(parseFloat(fromVal), fromUnit);
    const to = convert(parseFloat(toVal), toUnit);
    const interpolated = interpolate(from, to, progress);

    if (propertyName === "rotate") {
      style[propertyName] = `${interpolated}deg`;
    } else if (propertyName === "borderStyle") {
      // Discrete interpolation for borderStyle
      style[propertyName] = progress < 0.5 ? fromVal : toVal;
    } else if (propertyName === "opacity" || propertyName === "scale") {
      style[propertyName] = `${interpolated}`;
    } else {
      style[propertyName] = `${interpolated}px`;
    }
  }
};

export const animateLayer = (
  element: HTMLElement,
  layer: any,
  time: number
) => {
  const style: Record<string, string> = {};
  const properties = layer.editedPropertiesGroup || [];

  // Handle border properties separately
  const borderProps = {
    width: layer.style?.borderWidth || "0px",
    color: layer.style?.borderColor || "#000000",
    style: layer.style?.borderStyle || "solid",
  };

  for (const prop of properties) {
    const kfs = [...prop.keyframes].sort((a, b) => a.percentage - b.percentage);
    if (kfs.length === 0) continue;

    // 2. Inject default at 0% if missing
    if (kfs[0].percentage > 0) {
      const defaultValue = getDefaultValue(prop.propertyName, layer);
      const unit = extractUnit(defaultValue);
      kfs.unshift({
        percentage: 0,
        value: defaultValue,
        unit: unit,
      });
    }

    // 3. Inject dummy at 100% if needed
    if (kfs[kfs.length - 1].percentage < 100) {
      const defaultValue = getDefaultValue(prop.propertyName, layer);
      const unit = extractUnit(defaultValue);
      kfs.push({
        percentage: 100,
        value: defaultValue,
        unit: unit,
      });
    }

    // Ensure there's a keyframe at 100%
    if (kfs[kfs.length - 1].percentage < 100) {
      const defaultValue = getDefaultValue(prop.propertyName, layer);
      const unit = extractUnit(defaultValue);
      kfs.push({
        percentage: 100,
        value: defaultValue,
        unit: unit,
      });
    }

    let prev = kfs[0];
    let next = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (time >= kfs[i].percentage && time <= kfs[i + 1].percentage) {
        prev = kfs[i];
        next = kfs[i + 1];
        break;
      }
    }

    let progress =
      prev === next
        ? 0
        : (time - prev.percentage) / (next.percentage - prev.percentage);

    applyInterpolatedStyle(
      style,
      prop.propertyName,
      prev.value,
      next.value,
      progress,
      prev.unit,
      next.unit
    );
    if (prop.propertyName === "borderWidth") {
      borderProps.width = style[prop.propertyName];
      delete style[prop.propertyName];
    } else if (prop.propertyName === "borderColor") {
      borderProps.color = style[prop.propertyName];
      delete style[prop.propertyName];
    } else if (prop.propertyName === "borderStyle") {
      borderProps.style = style[prop.propertyName];
      delete style[prop.propertyName];
    }

    style.border = `${borderProps.width} ${borderProps.style} ${borderProps.color}`;
    delete style.borderColor;
    delete style.borderStyle;
    continue;
  }

  const transformProps = ["translateX", "translateY", "scale", "rotate"];
  const validTransforms: string[] = [];

  for (const tf of transformProps) {
    const val = style[tf];
    if (val && isValidTransformFunction(tf, val)) {
      validTransforms.push(`${tf}(${val})`);
      delete style[tf];
    } else if (val) {
      console.warn(`Invalid transform function: ${tf}(${val})`);
    }
  }

  if (validTransforms.length) {
    element.style.transform = validTransforms.join(" ");
  }

  for (const [key, value] of Object.entries(style)) {
    if (!transformProps.includes(key) && value !== undefined) {
      if (key in element.style) {
        if (isValidCSSValue(key, value)) {
          (element.style as any)[key] = value;
        } else {
          console.warn(`Invalid CSS value "${value}" for property "${key}"`);
        }
      } else {
        console.error(`Invalid CSS property: ${key}`);
      }
    }
  }
};

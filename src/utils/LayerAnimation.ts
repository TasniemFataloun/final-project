const interpolate = (from: any, to: any, t: number) => {
  return from + (to - from) * t;
};

const interpolateColor = (from: string, to: string, t: number): string => {
  // Converts a hex color (#rrggbb) to RGB object { r, g, b }
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Converts RGB values back to hex color string
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (value: number) => value.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Get RGB from both input colors
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);

  // Interpolate each color channel
  const r = Math.round(interpolate(fromRgb.r, toRgb.r, t));
  const g = Math.round(interpolate(fromRgb.g, toRgb.g, t));
  const b = Math.round(interpolate(fromRgb.b, toRgb.b, t));

  // Convert back to hex
  return rgbToHex(r, g, b);
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

export const animateLayer = (
  element: HTMLElement,
  layer: any,
  time: number
) => {
  const style: Record<string, string> = {};
  if (layer.type === "code" && element.firstElementChild) {
    element = element.firstElementChild as HTMLElement;
  }

  const properties =
    layer.editedPropertiesGroup?.flatMap((g: any) => g.propertiesList) || [];
  for (const prop of properties) {
    const kfs = [...prop.keyframes].sort((a, b) => a.percentage - b.percentage);
    if (kfs.length == 0) return;
    let prev = kfs[0];
    let next = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length - 1; i++) {
      if (time >= kfs[i].percentage && time <= kfs[i + 1].percentage) {
        prev = kfs[i];
        next = kfs[i + 1];
        break;
      }
    }

    const localProgress =
      (time - prev.percentage) / (next.percentage - prev.percentage || 1);

    if (time <= kfs[0].percentage) {
      prev = next = kfs[0];
    } else if (time >= kfs[kfs.length - 1].percentage) {
      prev = next = kfs[kfs.length - 1];
    }
    if (prev.value.startsWith("#") && next.value.startsWith("#")) {
      style[prop.propertyName] = interpolateColor(
        prev.value,
        next.value,
        localProgress
      );
    } else {
      const interpolated = interpolate(
        parseFloat(prev.value),
        parseFloat(next.value),
        localProgress
      );
      style[prop.propertyName] = `${interpolated}${prev.unit}`;
    }
  }

  const transformProperties = ["translateX", "translateY", "scale", "rotate"];
  const validTransforms: string[] = [];

  // Handle transform functions
  for (const tf of transformProperties) {
    const val = style[tf];
    if (val && isValidTransformFunction(tf, val)) {
      validTransforms.push(`${tf}(${val})`);
      delete style[tf]; // Remove from regular CSS so it doesn't get applied below
    } else if (val) {
      console.warn(`Invalid transform function: ${tf}(${val})`);
    }
  }

  if (validTransforms.length) {
    element.style.transform = validTransforms.join(" ");
  }

  // Apply all other styles dynamically (excluding transform properties)
  for (const [key, value] of Object.entries(style)) {
    if (!transformProperties.includes(key) && value !== undefined) {
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

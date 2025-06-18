import { Layer } from "../redux/types/animations.type";

const parseLayerTransform = (layer: Layer) => {
  const raw = layer.style.transform || "none";
  const el = document.createElement("div");
  el.style.transform = raw;
  document.body.appendChild(el);
  const cs = getComputedStyle(el).transform;
  document.body.removeChild(el);

  const m = new DOMMatrixReadOnly(cs === "none" ? "matrix(1,0,0,1,0,0)" : cs);
  return {
    x: `${m.m41}px`,
    y: `${m.m42}px`,
  };
};

export const camelToKebab = (str: string) =>
  str
    .replace(/\s+/g, "-")
    .replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());

interface KeyframeStep {
  styles: string[];
  borderProps?: {
    width?: string;
    color?: string;
    style?: string;
  };
}

export const UseGenerateKeyframes = (layer: Layer) => {
  if (!layer || !layer.editedPropertiesGroup) return "";

  const sanitizedLayerName = layer.name?.toLowerCase().replace(/\s+/g, "-");

  const className = `.${sanitizedLayerName}`;
  const baseStyles: string[] = [];
  const keyframeSteps: Record<number, KeyframeStep> = {};

  const defaultTransform = {
    translateX: parseLayerTransform(layer).x || "0px",
    translateY: parseLayerTransform(layer).y || "0px",
    rotate: "0deg",
    scale: "1",
  };

  const transformMap: Record<number, Record<string, string>> = {};

  layer.editedPropertiesGroup.forEach((group) => {
    group.keyframes.forEach((kf) => {
      const percentage = kf.percentage;
      const prop = group.propertyName;
      const val = `${kf.value}${
        kf.unit || (prop === "borderWidth" ? "px" : "")
      }`;

      if (!keyframeSteps[percentage]) {
        keyframeSteps[percentage] = {
          styles: [],
          borderProps: {},
        };
      }

      if (["translateX", "translateY", "rotate", "scale"].includes(prop)) {
        if (!transformMap[percentage]) transformMap[percentage] = {};
        transformMap[percentage][prop] = val;
      } else if (["borderWidth", "borderStyle", "borderColor"].includes(prop)) {
        if (prop === "borderWidth") {
          keyframeSteps[percentage].borderProps!.width = val;
        } else if (prop === "borderColor") {
          keyframeSteps[percentage].borderProps!.color = val;
        } else if (prop === "borderStyle") {
          keyframeSteps[percentage].borderProps!.style = val;
        }
      } else {
        keyframeSteps[percentage].styles.push(
          `    ${camelToKebab(prop)}: ${val};`
        );
        if (percentage === 0) {
          baseStyles.push(`  ${camelToKebab(prop)}: ${val};`);
        }
      }
    });
  });

  Object.entries(transformMap).forEach(([pctStr, transforms]) => {
    const pct = Number(pctStr);
    const tx = transforms.translateX || defaultTransform.translateX;
    const ty = transforms.translateY || defaultTransform.translateY;
    const rot = transforms.rotate || defaultTransform.rotate;
    const scale = transforms.scale || defaultTransform.scale;

    const transformLine = `    transform: translateX(${tx}) translateY(${ty}) rotate(${rot}) scale(${scale});`;

    if (!keyframeSteps[pct]) keyframeSteps[pct] = { styles: [] };
    keyframeSteps[pct].styles.push(transformLine);

    if (pct === 0) {
      baseStyles.push(
        `  transform: translateX(${tx}) translateY(${ty}) rotate(${rot}) scale(${scale});`
      );
    }
  });

  Object.entries(keyframeSteps).forEach(([pctStr, step]) => {
    const border = step.borderProps || {};
    const width = border.width || layer.style?.borderWidth || "0px";
    const color = border.color || layer.style?.borderColor || "#000000";
    const style = border.style || layer.style?.borderStyle || "solid";

    if (border.width || border.color || border.style) {
      step.styles.push(`    border: ${width} ${style} ${color};`);
    }
  });

  const animationName = `animation-${sanitizedLayerName}`;
  const anim = layer.config;
  const props = layer.style || {};

  const styleKeys = new Set(Object.keys(props));

  const filteredProps = Object.entries(props).filter(([key, value]) => {
    if (key === "type") return false;
    if (value === "" || value === null || value === undefined) return false;

    if (typeof value === "object" && value !== null) {
      const subKeys = Object.keys(value);
      const allSubPropsExist = subKeys.every((subKey) => styleKeys.has(subKey));
      if (allSubPropsExist) return false;
    }

    if (typeof value === "number") {
      if (value === 0) return false;
    }

    return true;
  });

  const propsClassName = filteredProps
    .map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return Object.entries(value)
          .map(
            ([subKey, subValue]) =>
              `  ${camelToKebab(`${key}-${subKey}`)}: ${subValue};`
          )
          .join("\n");
      } else {
        return `  ${camelToKebab(key)}: ${value};`;
      }
    })
    .join("\n");

  const animationCss = `  animation: ${animationName} ${
    anim?.duration || "1"
  }s ${anim?.timingFunction || "ease"} ${anim?.delay || "0"}s ${
    anim?.iterationCount || "infinite"
  };`;

  const baseClassCss = `
${className} {
  position: relative;

${propsClassName}
${animationCss}
}
`.trim();

  const sortedPercentages = Object.keys(keyframeSteps)
    .map((k) => parseFloat(k))
    .sort((a, b) => a - b);

  const keyframesCss =
    layer.editedPropertiesGroup.length > 0
      ? `
@keyframes ${animationName} {
${sortedPercentages
  .map((pct) => `  ${pct}% {\n${keyframeSteps[pct].styles.join("\n")}\n  }`)
  .join("\n")}
}`
      : "";

  return `
${baseClassCss}

${keyframesCss}
`.trim();
};

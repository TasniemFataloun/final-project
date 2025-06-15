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

  const transformMap: Record<number, Record<string, string>> = {};

  layer.editedPropertiesGroup.forEach((group) => {
    group.keyframes.forEach((kf) => {
      const percentage = kf.percentage;
      const prop = group.propertyName;
      const val = `${kf.value}${
        kf.unit || (prop === "borderWidth" ? "px" : "")
      }`;

      if (!keyframeSteps[percentage]) {
        keyframeSteps[percentage] = { styles: [] };
      }

      if (prop === "translateX" || prop === "translateY") {
        if (!transformMap[percentage]) transformMap[percentage] = {};
        transformMap[percentage][prop] = val;
      } else {
        keyframeSteps[percentage].styles.push(`    ${prop}: ${val};`);
        if (percentage === 0) {
          baseStyles.push(`  ${prop}: ${val};`);
        }
      }
    });
  });
  const { x: defaultX, y: defaultY } = parseLayerTransform(layer);

  Object.entries(transformMap).forEach(([pctStr, transforms]) => {
    const pct = Number(pctStr);
    console.log(transforms);
    const x = transforms.translateX ?? defaultX;
    const y = transforms.translateY ?? defaultY;

    const transformLine = `    transform: translate(${x}, ${y});`;

    if (!keyframeSteps[pct]) keyframeSteps[pct] = { styles: [] };

    const alreadyHasTransform = keyframeSteps[pct].styles.some((line) =>
      line.trim().startsWith("transform:")
    );
    if (!alreadyHasTransform) {
      keyframeSteps[pct].styles.push(transformLine);
    }

    if (pct === 0) {
      const baseAlreadyHasTransform = baseStyles.some((line) =>
        line.trim().startsWith("transform:")
      );
      if (!baseAlreadyHasTransform) {
        baseStyles.push(`  transform: translate(${x}, ${y});`);
      }
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

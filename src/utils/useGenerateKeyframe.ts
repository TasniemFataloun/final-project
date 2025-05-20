import { Layer } from "../redux/types/animations.type";

export const UseGenerateKeyframes = (layer: Layer) => {
  if (!layer || !layer.editedPropertiesGroup) return "";

  const sanitizedLayerName = layer.name.toLowerCase().replace(/\s+/g, "-");
  const camelToKebab = (str: string) =>
    str.replace(/[A-Z]/g, (match) => "-" + match.toLowerCase());

  const className = `.${sanitizedLayerName}`;
  const baseStyles: string[] = [];
  const keyframeSteps: Record<number, string[]> = {};

  layer.editedPropertiesGroup.forEach((group) => {
    group.propertiesList.forEach((property) => {
      property.keyframes.forEach((kf) => {
        const percentage = kf.percentage;
        const line = `    ${property.propertyName}: ${kf.value}${kf.unit};`;

        if (!keyframeSteps[percentage]) {
          keyframeSteps[percentage] = [];
        }
        keyframeSteps[percentage].push(line);

        if (percentage === 0) {
          baseStyles.push(`  ${property.propertyName}: ${kf.value}${kf.unit};`);
        }
      });
    });
  });

  const animationName = `animation-${sanitizedLayerName}`;
  const anim = layer.config;
  const props = layer.style || {};

  const styleKeys = new Set(Object.keys(props));

  const filteredProps = Object.entries(props).filter(([key, value]) => {
    if (key === "type") return false; // ⛔️ Skip the 'type' property
    if (value === "" || value === null || value === undefined) return false;

    const zeroValues = new Set(["0", "0px", "0deg", "0%", 0]);

    if (typeof value === "object" && value !== null) {
      const subKeys = Object.keys(value);
      const allSubPropsExist = subKeys.every((subKey) => styleKeys.has(subKey));
      if (allSubPropsExist) return false;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (zeroValues.has(normalized)) return false;
    } else if (typeof value === "number") {
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

  const baseClassCss = `${
    layer.editedPropertiesGroup.length > 0
      ? `
${className} {
${propsClassName}
${animationCss}
  }
`
      : ""
  }`.trim();

  const sortedPercentages = Object.keys(keyframeSteps)
    .map((k) => parseFloat(k))
    .sort((a, b) => a - b);

  const keyframesCss =
    layer.editedPropertiesGroup.length > 0
      ? `
@keyframes ${animationName} {
${sortedPercentages
  .map((pct) => `  ${pct}% {\n${keyframeSteps[pct].join("\n")}\n  }`)
  .join("\n")}
}`
      : "";

  return `
${baseClassCss}

${keyframesCss}
`.trim();
};

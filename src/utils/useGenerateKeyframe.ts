import { Layer } from "../redux/types/animations.type";

export const UseGenerateKeyframes = (layer: Layer) => {
  if (!layer || !layer.editedPropertiesGroup) return "";

  const className = `.layer-${layer.id}`; // ⬅️ Unique class name
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

  const animationName = `animation-${layer.id}`; // ⬅️ Also use unique animation name
  const anim = layer.config;
  const animationCss = `
  animation: ${animationName} ${anim?.duration || "1"}s ${
    anim?.timingFunction || "ease"
  } ${anim?.delay || "0"}s ${anim?.iterationCount || "infinite"};
  `;

  const baseClassCss = `
${className} {
${baseStyles.join("\n")}
${animationCss.trim()}
}`.trim();

  const sortedPercentages = Object.keys(keyframeSteps)
    .map((k) => parseFloat(k))
    .sort((a, b) => a - b);

  const keyframesCss = `
@keyframes ${animationName} {
${sortedPercentages
  .map((pct) => `  ${pct}% {\n${keyframeSteps[pct].join("\n")}\n  }`)
  .join("\n")}
}`.trim();

  return `
${baseClassCss}

${keyframesCss}
`.trim();
};
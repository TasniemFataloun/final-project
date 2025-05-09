import { AnimationType } from "../types/animationType";

export const UseGenerateKeyframes = (
  updatedConfig: AnimationType,
  defaultConfigFull: AnimationType
) => {
  if (!updatedConfig || !defaultConfigFull) {
    return "";
  }

  const cssPropertyMap: Record<
    string,
    (val: any, defaultVal: any) => { key: string; from: string; to: string }[]
  > = {
    size: (val, defaultVal) => {
      const props: any[] = [];
      if (val.width !== undefined) {
        props.push({
          key: "width",
          from: `${defaultVal.width}px`,
          to: `${val.width}px`,
        });
      }
      if (val.height !== undefined) {
        props.push({
          key: "height",
          from: `${defaultVal.height}px`,
          to: `${val.height}px`,
        });
      }
      return props;
    },
    transform: (val, defaultVal) => {
      const fromParts: string[] = [];
      const toParts: string[] = [];

      if (val.scale !== undefined) {
        fromParts.push(`scale(${defaultVal.scale})`);
        toParts.push(`scale(${val.scale})`);
      }
      if (val.rotate !== undefined) {
        fromParts.push(`rotate(${defaultVal.rotate}deg)`);
        toParts.push(`rotate(${val.rotate}deg)`);
      }
      if (val.translateX !== undefined || val.translateY !== undefined) {
        const defaultX = defaultVal.translateX ?? 0;
        const defaultY = defaultVal.translateY ?? 0;
        const newX = val.translateX ?? defaultX;
        const newY = val.translateY ?? defaultY;

        fromParts.push(`translate(${defaultX}px, ${defaultY}px)`);
        toParts.push(`translate(${newX}px, ${newY}px)`);
      }

      if (fromParts.length > 0) {
        return [
          {
            key: "transform",
            from: fromParts.join(" "),
            to: toParts.join(" "),
          },
        ];
      }

      return [];
    },
    opacity: (val, defaultVal) => {
      const props: any[] = [];
      if (val.opacity !== undefined) {
        props.push({
          key: "opacity",
          from: `${defaultVal.opacity}`,
          to: `${val.opacity}`,
        });
      }
      if (val.borderRadius !== undefined) {
        props.push({
          key: "border-radius",
          from: `${defaultVal.borderRadius}px`,
          to: `${val.borderRadius}px`,
        });
      }
      return props;
    },
    backgroundColor: (val, defaultVal) => {
      const props: any[] = [];
      if (val.backgroundColor !== undefined) {
        props.push({
          key: "background-color",
          from: `${defaultVal.backgroundColor}`,
          to: `${val.backgroundColor}`,
        });
      }
      return props;
    },
  };

  const fromLines: string[] = [];
  const toLines: string[] = [];

  // Loop through updated config and collect keyframe changes
  Object.entries(updatedConfig).forEach(([groupKey, val]) => {
    if (val && cssPropertyMap[groupKey]) {
      const defaultVal = defaultConfigFull[groupKey as keyof AnimationType];
      const propsList = cssPropertyMap[groupKey](val, defaultVal);

      propsList.forEach(({ key, from, to }) => {
        fromLines.push(`    ${key}: ${from};`);
        toLines.push(`    ${key}: ${to};`);
      });
    }
  });

  // Generate the full base class CSS
  const baseStyles: string[] = [];

  const defaultConf = defaultConfigFull;
  if (defaultConf.size) {
    if (defaultConf.size.width !== undefined) {
      baseStyles.push(`  width: ${defaultConf.size.width}px;`);
    }
    if (defaultConf.size.height !== undefined) {
      baseStyles.push(`  height: ${defaultConf.size.height}px;`);
    }
  }
  if (defaultConf.opacity) {
    if (defaultConf.opacity.opacity !== undefined) {
      baseStyles.push(`  opacity: ${defaultConf.opacity.opacity};`);
    }
    if (defaultConf.opacity.borderRadius !== undefined) {
      baseStyles.push(
        `  border-radius: ${defaultConf.opacity.borderRadius}px;`
      );
    }
  }
  if (defaultConf.backgroundColor) {
    if (defaultConf.backgroundColor.backgroundColor !== undefined) {
      baseStyles.push(
        `  background-color: ${defaultConf.backgroundColor.backgroundColor};`
      );
    }
  }
  if (defaultConf.transform) {
    const t = defaultConf.transform;
    const transformParts: string[] = [];
    if (t.scale !== undefined) transformParts.push(`scale(${t.scale})`);
    if (t.rotate !== undefined) transformParts.push(`rotate(${t.rotate}deg)`);
    if (t.translateX !== undefined || t.translateY !== undefined) {
      const tx = t.translateX ?? 0;
      const ty = t.translateY ?? 0;
      transformParts.push(`translate(${tx}px, ${ty}px)`);
    }
    if (transformParts.length > 0) {
      baseStyles.push(`  transform: ${transformParts.join(" ")};`);
    }
  }

  // Add the animation property (new part)
  const animationConfig =
    updatedConfig.animation || defaultConfigFull.animation;
  const animationName = `animation-${defaultConfigFull.type}`;
  const animationDuration = animationConfig?.duration || "3s";
  const animationTimingFunction = animationConfig?.timingFunction || "linear";
  const animationDelay = animationConfig?.delay || "0s";
  const animationIterationCount = animationConfig?.iterationCount || "infinite";

  baseStyles.push(`
  animation: ${animationName} ${animationDuration}s ${animationTimingFunction} ${animationDelay}s ${animationIterationCount}s;
  `);

  const className = `.${defaultConfigFull.type}`;

  const baseClassCss = `
${className} {
${baseStyles.join("\n")}
}
`.trim();

  const keyframesCss =
    fromLines.length > 0
      ? `
@keyframes animation-${defaultConfigFull.type} {
  0% {
${fromLines.join("\n")}
  }
  100% {
${toLines.join("\n")}
  }
}`.trim()
      : `/* No changes to animate */`;

  return `
${baseClassCss}

${keyframesCss}
`.trim();
};

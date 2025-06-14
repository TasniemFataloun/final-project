import { nanoid } from "@reduxjs/toolkit";
import { Propertykeyframes } from "../redux/types/animations.type";

/* export function mergeTransforms(
  animation: {
    property: string;
    keyframes: Propertykeyframes[];
  }[]
): {
  property: string;
  keyframes: Propertykeyframes[];
}[] {
  const transformProps = [
    "rotate",
    "rotateX",
    "rotateY",
    "scale",
    "scaleX",
    "scaleY",
    "translateX",
    "translateY",
    "skewX",
    "skewY",
    "perspective",
  ];
  const transformsByPercentage: Record<number, string[]> = {};
  const otherProps: typeof animation = [];

  for (const propObj of animation) {
    if (!transformProps.includes(propObj.property)) {
      otherProps.push(propObj);
      continue;
    }

    for (const kf of propObj.keyframes) {
      const key = kf.percentage;
      if (!transformsByPercentage[key]) transformsByPercentage[key] = [];
      transformsByPercentage[key].push(
        `${propObj.property}(${kf.value}${kf.unit})`
      );
    }
  }

  const mergedTransform = {
    property: "transform",
    keyframes: Object.entries(transformsByPercentage).map(
      ([percentageStr, parts]) => ({
        id: `merged-transform-${percentageStr}-${nanoid()}`,
        value: parts.join(" "),
        unit: "",
        percentage: Number(percentageStr),
      })
    ),
  };

  return [mergedTransform, ...otherProps];
} */

export const presentAnimations: Record<
  string,
  {
    property: string;
    keyframes: Propertykeyframes[];
  }[]
> = {
  fadeIn: [
    {
      property: "opacity",
      keyframes: [
        { id: `fade-in-${nanoid()}`, value: "0", unit: "", percentage: 0 },
        { id: `fade-in-${nanoid()}`, value: "1", unit: "", percentage: 100 },
      ],
    },
  ],
  fadeInUpBig: [
    {
      property: "opacity",
      keyframes: [
        {
          id: `fade-in-up-big-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 0,
        },
        {
          id: `fade-in-up-big-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `fade-in-up-big-${nanoid()}`,
          value: "200",
          unit: "px",
          percentage: 0,
        },
        {
          id: `fade-in-up-big-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],
  fadeInRight: [
    {
      property: "opacity",
      keyframes: [
        {
          id: `fade-in-right-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 0,
        },
        {
          id: `fade-in-right-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `fade-in-right-${nanoid()}`,
          value: "200",
          unit: "px",
          percentage: 0,
        },
        {
          id: `fade-in-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],
  fadeInBottomRight: [
    {
      property: "opacity",
      keyframes: [
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 0,
        },
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "200",
          unit: "px",
          percentage: 0,
        },
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "200",
          unit: "px",
          percentage: 0,
        },
        {
          id: `fade-in-bottom-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],

  fadeInUp: [
    {
      property: "opacity",
      keyframes: [
        { id: `fade-in-up-${nanoid()}`, value: "0", unit: "", percentage: 0 },
        { id: `fade-in-up-${nanoid()}`, value: "1", unit: "", percentage: 100 },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `fade-in-up-${nanoid()}`,
          value: "100",
          unit: "px",
          percentage: 0,
        },
        {
          id: `fade-in-up-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],
  slideInLeft: [
    {
      property: "left",
      keyframes: [
        { id: `slide-in${nanoid()}`, value: "-200", unit: "px", percentage: 0 },
        { id: `slide-in-${nanoid()}`, value: "0", unit: "px", percentage: 100 },
      ],
    },
  ],
  slideInRight: [
    {
      property: "left",
      keyframes: [
        { id: `slide-in-${nanoid()}`, value: "200", unit: "px", percentage: 0 },
        { id: `slide-in-${nanoid()}`, value: "0", unit: "px", percentage: 100 },
      ],
    },
  ],

  zoomIn: [
    {
      property: "scale",
      keyframes: [
        { id: `zoom-in-${nanoid()}`, value: "0.5", unit: "", percentage: 0 },
        { id: `zoom-in-${nanoid()}`, value: "1", unit: "", percentage: 100 },
      ],
    },
  ],
  zoomOut: [
    {
      property: "scale",
      keyframes: [
        { id: `zoom-out-${nanoid()}`, value: "1", unit: "", percentage: 0 },
        { id: `zoom-out-${nanoid()}`, value: "0.5", unit: "", percentage: 100 },
      ],
    },
  ],
  zoomOutLeft: [
    {
      property: "scale",
      keyframes: [
        {
          id: `zoom-out-up-left-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `zoom-out-up-left-${nanoid()}`,
          value: "0.5",
          unit: "",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `zoom-out-up-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `zoom-out-up-left-${nanoid()}`,
          value: "-50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],
  zoomOutRight: [
    {
      property: "scale",
      keyframes: [
        {
          id: `zoom-out-up-right-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `zoom-out-up-right-${nanoid()}`,
          value: "0.5",
          unit: "",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `zoom-out-up-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `zoom-out-up-right-${nanoid()}`,
          value: "50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
  ],
  bounce: [
    {
      property: "top",
      keyframes: [
        { id: `bounce-${nanoid()}`, value: "0px", unit: "", percentage: 0 },
        { id: `bounce-${nanoid()}`, value: "-50px", unit: "", percentage: 50 },
        { id: `bounce-${nanoid()}`, value: "0px", unit: "", percentage: 100 },
      ],
    },
  ],
  flash: [
    {
      property: "opacity",
      keyframes: [
        { id: `flash-${nanoid()}`, value: "1", unit: "", percentage: 0 },
        { id: `flash-${nanoid()}`, value: "0", unit: "", percentage: 25 },
        { id: `flash-${nanoid()}`, value: "1", unit: "", percentage: 50 },
        { id: `flash-${nanoid()}`, value: "0", unit: "", percentage: 75 },
        { id: `flash-${nanoid()}`, value: "1", unit: "", percentage: 100 },
      ],
    },
  ],
  swing: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `swing-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `swing-${nanoid()}`,
          value: "15",
          unit: "deg",
          percentage: 25,
        },
        {
          id: `swing-${nanoid()}`,
          value: "-10",
          unit: "deg",
          percentage: 50,
        },
        {
          id: `swing-${nanoid()}`,
          value: "5",
          unit: "deg",
          percentage: 75,
        },
        {
          id: `swing-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
  ],
  tada: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `tada-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `tada-${nanoid()}`,
          value: "10",
          unit: "deg",
          percentage: 10,
        },
        {
          id: `tada-${nanoid()}`,
          value: "-10",
          unit: "deg",
          percentage: 20,
        },
        {
          id: `tada-${nanoid()}`,
          value: "10",
          unit: "deg",
          percentage: 30,
        },
        {
          id: `tada-${nanoid()}`,
          value: "-10",
          unit: "deg",
          percentage: 40,
        },
        {
          id: `tada-${nanoid()}`,
          value: "10",
          unit: "deg",
          percentage: 50,
        },
        {
          id: `tada-${nanoid()}`,
          value: "-10",
          unit: "deg",
          percentage: 60,
        },
        {
          id: `tada-${nanoid()}`,
          value: "10",
          unit: "deg",
          percentage: 70,
        },
        {
          id: `tada-${nanoid()}`,
          value: "-10",
          unit: "deg",
          percentage: 80,
        },
        {
          id: `tada-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "scale",
      keyframes: [
        { id: `tada-${nanoid()}`, value: "1", unit: "", percentage: 0 },
        { id: `tada-${nanoid()}`, value: "1.1", unit: "", percentage: 50 },
        { id: `tada-${nanoid()}`, value: "1", unit: "", percentage: 100 },
      ],
    },
  ],
  RotateOut: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `rotate-out-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `rotate-out-${nanoid()}`,
          value: "180",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        { id: `rotate-out-${nanoid()}`, value: "1", unit: "", percentage: 0 },
        { id: `rotate-out-${nanoid()}`, value: "0", unit: "", percentage: 100 },
      ],
    },
  ],
  rotateOutDownLeft: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "-45",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "-50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `rotate-out-down-left-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 100,
        },
      ],
    },
  ],
  rotateOutDownRight: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "45",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `rotate-out-down-right-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 100,
        },
      ],
    },
  ],
  rotateOutUpLeft: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "-45",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "-50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "-50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `rotate-out-up-left-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 100,
        },
      ],
    },
  ],
  rotateDownLeft: [
    {
      property: "rotate",
      keyframes: [
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "0",
          unit: "deg",
          percentage: 0,
        },
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "-45",
          unit: "deg",
          percentage: 100,
        },
      ],
    },
    {
      property: "top",
      keyframes: [
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "left",
      keyframes: [
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "0",
          unit: "px",
          percentage: 0,
        },
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "-50",
          unit: "px",
          percentage: 100,
        },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "1",
          unit: "",
          percentage: 0,
        },
        {
          id: `rotate-down-left-${nanoid()}`,
          value: "0",
          unit: "",
          percentage: 100,
        },
      ],
    },
  ],
};

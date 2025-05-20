import { Layer } from "../redux/types/animations.type";

export const getSortedUniqueKeyframes = (
  layers: Layer[],
  selectedLayerId: string | null,
  ascending: boolean
): number[] => {
  if (!selectedLayerId || !layers) return [];

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);
  if (!selectedLayer || !selectedLayer.editedPropertiesGroup) return [];

  const allKeyframePercentages = selectedLayer.editedPropertiesGroup.flatMap(
    (propertyGroup) =>
      propertyGroup.propertiesList.flatMap((property) =>
        property.keyframes.map((kf) => kf.percentage)
      )
  );

  const uniqueKeyframes = Array.from(new Set(allKeyframePercentages));
  return uniqueKeyframes.sort((a, b) => (ascending ? a - b : b - a));
};

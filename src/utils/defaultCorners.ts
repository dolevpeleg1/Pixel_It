import type { CornerSet } from '../types';

export function defaultCorners(
  imageWidth: number,
  imageHeight: number,
  insetRatio = 0.1,
): CornerSet {
  const insetX = imageWidth * insetRatio;
  const insetY = imageHeight * insetRatio;

  return {
    topLeft: { x: insetX, y: insetY },
    topRight: { x: imageWidth - insetX, y: insetY },
    bottomRight: { x: imageWidth - insetX, y: imageHeight - insetY },
    bottomLeft: { x: insetX, y: imageHeight - insetY },
  };
}

import type { Point } from '../types';

export type ImageLayout = {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
};

export type ContainLayout = {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  scale: number;
};

export function computeContainLayout(layout: ImageLayout): ContainLayout {
  const { containerWidth, containerHeight, imageWidth, imageHeight } = layout;
  const scale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;
  const offsetX = (containerWidth - displayWidth) / 2;
  const offsetY = (containerHeight - displayHeight) / 2;

  return { offsetX, offsetY, displayWidth, displayHeight, scale };
}

export function imageToScreen(point: Point, layout: ImageLayout): Point {
  const { offsetX, offsetY, scale } = computeContainLayout(layout);
  return {
    x: offsetX + point.x * scale,
    y: offsetY + point.y * scale,
  };
}

export function screenToImage(point: Point, layout: ImageLayout): Point {
  const { offsetX, offsetY, scale } = computeContainLayout(layout);
  return {
    x: (point.x - offsetX) / scale,
    y: (point.y - offsetY) / scale,
  };
}

export function clampScreenToImagePoint(
  screen: Point,
  layout: ImageLayout,
): Point {
  const { offsetX, offsetY, displayWidth, displayHeight } =
    computeContainLayout(layout);
  const clampedScreen = {
    x: Math.max(offsetX, Math.min(offsetX + displayWidth, screen.x)),
    y: Math.max(offsetY, Math.min(offsetY + displayHeight, screen.y)),
  };
  const imagePoint = screenToImage(clampedScreen, layout);
  return clampToImage(imagePoint, layout.imageWidth, layout.imageHeight);
}

export function clampToImage(
  point: Point,
  imageWidth: number,
  imageHeight: number,
): Point {
  return {
    x: Math.max(0, Math.min(imageWidth, point.x)),
    y: Math.max(0, Math.min(imageHeight, point.y)),
  };
}

import {
  DataTypes,
  ObjectType,
  OpenCV,
  type Mat,
  type Point2f,
  type PointVector,
} from 'react-native-fast-opencv';
import type { CornerSet, Point } from '../../types';

/** getPerspectiveTransform requires Point2fVector, not PointVector. */
function toPoint2fVector(points: Point[]): PointVector {
  const point2f: Point2f[] = points.map((point) =>
    OpenCV.createObject(ObjectType.Point2f, point.x, point.y),
  );
  return OpenCV.createObject(ObjectType.Point2fVector, point2f);
}

export function cornerSetToPointVector(corners: CornerSet): PointVector {
  return toPoint2fVector([
    corners.topLeft,
    corners.topRight,
    corners.bottomRight,
    corners.bottomLeft,
  ]);
}

export function rectToPointVector(width: number, height: number): PointVector {
  return toPoint2fVector([
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ]);
}

export function outputSizeFromCorners(corners: CornerSet): {
  width: number;
  height: number;
} {
  const topWidth = distance(corners.topLeft, corners.topRight);
  const bottomWidth = distance(corners.bottomLeft, corners.bottomRight);
  const leftHeight = distance(corners.topLeft, corners.bottomLeft);
  const rightHeight = distance(corners.topRight, corners.bottomRight);

  const width = Math.max(1, Math.round(Math.max(topWidth, bottomWidth)));
  const height = Math.max(1, Math.round(Math.max(leftHeight, rightHeight)));

  return { width, height };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function createMatLike(source: Mat, rows: number, cols: number): Mat {
  const { channels } = OpenCV.matToBuffer(source, 'uint8');
  const dataType =
    channels === 4
      ? DataTypes.CV_8UC4
      : channels === 1
        ? DataTypes.CV_8UC1
        : DataTypes.CV_8UC3;

  return OpenCV.createObject(ObjectType.Mat, rows, cols, dataType);
}

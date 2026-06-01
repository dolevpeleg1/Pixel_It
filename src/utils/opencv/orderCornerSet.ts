import type { CornerSet, Point } from '../../types';

/** Order four points as topLeft, topRight, bottomRight, bottomLeft (image coordinates). */
export function orderCornerSet(points: Point[]): CornerSet {
  if (points.length !== 4) {
    throw new Error('orderCornerSet requires exactly 4 points.');
  }

  const sortedBySum = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const sortedByDiff = [...points].sort((a, b) => a.y - a.x - (b.y - b.x));

  return {
    topLeft: sortedBySum[0],
    topRight: sortedByDiff[0],
    bottomRight: sortedBySum[3],
    bottomLeft: sortedByDiff[3],
  };
}

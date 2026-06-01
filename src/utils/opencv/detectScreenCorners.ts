import {
  ColorConversionCodes,
  ContourApproximationModes,
  DataTypes,
  InterpolationFlags,
  MorphShapes,
  MorphTypes,
  ObjectType,
  OpenCV,
  RetrievalModes,
  ThresholdTypes,
  type Mat,
  type PointVector,
  type PointVectorOfVectors,
  type RotatedRect,
} from 'react-native-fast-opencv';
import type { CornerSet, Point } from '../../types';
import { loadMatFromUri } from './imageIO';
import { orderCornerSet } from './orderCornerSet';

const MAX_DETECTION_SIDE = 800;
const MIN_AREA_RATIO = 0.02;
const MAX_AREA_RATIO = 0.96;
const MIN_ASPECT = 0.2;
const MAX_ASPECT = 5;
const MIN_CONTOUR_AREA_RATIO = 0.015;
const MAX_BORDER_AREA_RATIO = 0.92;
const MAX_CONTOURS_TO_CHECK = 20;

const CANNY_PAIRS: [number, number][] = [
  [40, 120],
  [25, 80],
  [60, 180],
  [20, 55],
  [15, 40],
];

const APPROX_EPSILON_FACTORS = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06];

function createGrayMat(rows: number, cols: number): Mat {
  return OpenCV.createObject(ObjectType.Mat, rows, cols, DataTypes.CV_8UC1);
}

function computeScale(width: number, height: number): number {
  const longest = Math.max(width, height);
  if (longest <= MAX_DETECTION_SIDE) {
    return 1;
  }
  return MAX_DETECTION_SIDE / longest;
}

function scalePoint(point: Point, scale: number): Point {
  if (scale === 1) {
    return point;
  }
  const factor = 1 / scale;
  return { x: point.x * factor, y: point.y * factor };
}

function quadArea(points: Point[]): number {
  let sum = 0;
  for (let i = 0; i < 4; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % 4];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

function isConvexQuad(points: Point[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % 4];
    const c = points[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-4) {
      continue;
    }
    if (sign === 0) {
      sign = cross > 0 ? 1 : -1;
    } else if ((cross > 0 ? 1 : -1) !== sign) {
      return false;
    }
  }
  return sign !== 0;
}

function quadAspectRatio(points: Point[]): number {
  const ordered = orderCornerSet(points);
  const topWidth = Math.hypot(
    ordered.topRight.x - ordered.topLeft.x,
    ordered.topRight.y - ordered.topLeft.y,
  );
  const bottomWidth = Math.hypot(
    ordered.bottomRight.x - ordered.bottomLeft.x,
    ordered.bottomRight.y - ordered.bottomLeft.y,
  );
  const leftHeight = Math.hypot(
    ordered.bottomLeft.x - ordered.topLeft.x,
    ordered.bottomLeft.y - ordered.topLeft.y,
  );
  const rightHeight = Math.hypot(
    ordered.bottomRight.x - ordered.topRight.x,
    ordered.bottomRight.y - ordered.topRight.y,
  );

  const width = Math.max(topWidth, bottomWidth);
  const height = Math.max(leftHeight, rightHeight);
  const longer = Math.max(width, height, 1);
  const shorter = Math.max(Math.min(width, height), 1);
  return longer / shorter;
}

function scoreQuad(points: Point[], imageWidth: number, imageHeight: number): number {
  const imageArea = imageWidth * imageHeight;
  const area = quadArea(points);
  const areaRatio = area / imageArea;

  if (areaRatio < MIN_AREA_RATIO || areaRatio > MAX_AREA_RATIO) {
    return -1;
  }

  const aspect = quadAspectRatio(points);
  if (aspect < MIN_ASPECT || aspect > MAX_ASPECT) {
    return -1;
  }

  const centroid = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  );
  centroid.x /= 4;
  centroid.y /= 4;

  const centerX = imageWidth / 2;
  const centerY = imageHeight / 2;
  const centerDist = Math.hypot(centroid.x - centerX, centroid.y - centerY);
  const maxDist = Math.hypot(centerX, centerY);
  const centerScore = 1 - Math.min(1, centerDist / maxDist) * 0.35;
  const aspectScore = 1 / Math.max(1, aspect - 1);

  return areaRatio * centerScore * (0.6 + aspectScore * 0.4);
}

function cornersFromRotatedRect(rect: {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  angle: number;
}): Point[] {
  const theta = (rect.angle * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const dx1 = (rect.width / 2) * cos;
  const dy1 = (rect.width / 2) * sin;
  const dx2 = (rect.height / 2) * -sin;
  const dy2 = (rect.height / 2) * cos;

  return [
    { x: rect.centerX - dx1 - dx2, y: rect.centerY - dy1 - dy2 },
    { x: rect.centerX + dx1 - dx2, y: rect.centerY + dy1 - dy2 },
    { x: rect.centerX + dx1 + dx2, y: rect.centerY + dy1 + dy2 },
    { x: rect.centerX - dx1 + dx2, y: rect.centerY - dy1 + dy2 },
  ];
}

type SearchState = {
  bestScore: number;
  bestCorners: CornerSet | null;
};

function considerQuad(
  points: Point[],
  imageWidth: number,
  imageHeight: number,
  state: SearchState,
): void {
  if (!isConvexQuad(points)) {
    return;
  }

  const score = scoreQuad(points, imageWidth, imageHeight);
  if (score > state.bestScore) {
    state.bestScore = score;
    state.bestCorners = orderCornerSet(points);
  }
}

function tryContourApprox(
  contour: PointVector,
  imageWidth: number,
  imageHeight: number,
  state: SearchState,
): void {
  const perimeter = OpenCV.invoke('arcLength', contour, true).value;
  if (perimeter < 40) {
    return;
  }

  for (const factor of APPROX_EPSILON_FACTORS) {
    const approx = OpenCV.createObject(ObjectType.PointVector);
    OpenCV.invoke('approxPolyDP', contour, approx, factor * perimeter, true);
    const { array: vertices } = OpenCV.toJSValue(approx);

    if (vertices.length !== 4) {
      continue;
    }

    const points: Point[] = vertices.map((vertex) => ({
      x: vertex.x,
      y: vertex.y,
    }));
    considerQuad(points, imageWidth, imageHeight, state);
  }
}

function tryContourMinAreaRect(
  contour: PointVector,
  imageWidth: number,
  imageHeight: number,
  state: SearchState,
): void {
  try {
    const rotated = OpenCV.invoke(
      'minAreaRect',
      contour as unknown as Mat,
    ) as RotatedRect;
    const rect = OpenCV.toJSValue(rotated);
    if (rect.width < 10 || rect.height < 10) {
      return;
    }
    considerQuad(cornersFromRotatedRect(rect), imageWidth, imageHeight, state);
  } catch {
    // minAreaRect is best-effort; some contour types may not be supported.
  }
}

function searchContours(
  binary: Mat,
  imageWidth: number,
  imageHeight: number,
  retrievalMode: RetrievalModes,
  state: SearchState,
): void {
  const contours = OpenCV.createObject(ObjectType.PointVectorOfVectors);
  OpenCV.invoke(
    'findContours',
    binary,
    contours,
    retrievalMode,
    ContourApproximationModes.CHAIN_APPROX_SIMPLE,
  );

  const imageArea = imageWidth * imageHeight;
  const minArea = imageArea * MIN_CONTOUR_AREA_RATIO;
  const maxBorderArea = imageArea * MAX_BORDER_AREA_RATIO;
  const ranked: { index: number; area: number }[] = [];

  const { array: contourList } = OpenCV.toJSValue(contours);
  for (let index = 0; index < contourList.length; index += 1) {
    const contour = OpenCV.copyObjectFromVector(contours, index);
    const area = OpenCV.invoke('contourArea', contour).value;
    if (area >= minArea && area <= maxBorderArea) {
      ranked.push({ index, area });
    }
  }

  ranked.sort((a, b) => b.area - a.area);
  const top = ranked.slice(0, MAX_CONTOURS_TO_CHECK);

  for (const { index } of top) {
    const contour = OpenCV.copyObjectFromVector(contours, index);
    tryContourApprox(contour, imageWidth, imageHeight, state);
    tryContourMinAreaRect(contour, imageWidth, imageHeight, state);
  }
}

function detectOnScaledMat(
  src: Mat,
  scaledWidth: number,
  scaledHeight: number,
): CornerSet | null {
  const gray = createGrayMat(scaledHeight, scaledWidth);
  const blurred = createGrayMat(scaledHeight, scaledWidth);
  const edges = createGrayMat(scaledHeight, scaledWidth);
  const closed = createGrayMat(scaledHeight, scaledWidth);
  const thresholded = createGrayMat(scaledHeight, scaledWidth);

  const state: SearchState = { bestScore: -1, bestCorners: null };

  try {
    OpenCV.invoke('cvtColor', src, gray, ColorConversionCodes.COLOR_BGR2GRAY);

    const blurKernel = OpenCV.createObject(ObjectType.Size, 5, 5);
    OpenCV.invoke('GaussianBlur', gray, blurred, blurKernel, 0);

    const morphKernel = OpenCV.invoke(
      'getStructuringElement',
      MorphShapes.MORPH_RECT,
      OpenCV.createObject(ObjectType.Size, 5, 5),
    );

    const searchBinary = (binary: Mat) => {
      searchContours(
        binary,
        scaledWidth,
        scaledHeight,
        RetrievalModes.RETR_LIST,
        state,
      );
      searchContours(
        binary,
        scaledWidth,
        scaledHeight,
        RetrievalModes.RETR_EXTERNAL,
        state,
      );
    };

    for (const [low, high] of CANNY_PAIRS) {
      OpenCV.invoke('Canny', blurred, edges, low, high);
      OpenCV.invoke('morphologyEx', edges, closed, MorphTypes.MORPH_CLOSE, morphKernel);
      searchBinary(closed);
    }

    try {
      OpenCV.invoke(
        'threshold',
        blurred,
        thresholded,
        0,
        255,
        ThresholdTypes.THRESH_BINARY | ThresholdTypes.THRESH_OTSU,
      );
      OpenCV.invoke(
        'morphologyEx',
        thresholded,
        closed,
        MorphTypes.MORPH_CLOSE,
        morphKernel,
      );
      searchBinary(closed);
    } catch {
      // Otsu threshold is optional.
    }

    return state.bestCorners;
  } finally {
    // Mats are cleared via OpenCV.clearBuffers() in the caller.
  }
}

export type DetectScreenCornersResult = {
  corners: CornerSet | null;
  width: number;
  height: number;
};

export async function detectScreenCorners(
  uri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<DetectScreenCornersResult> {
  const src = await loadMatFromUri(uri);

  try {
    const { cols, rows } = OpenCV.toJSValue(src);
    const width = cols > 0 ? cols : imageWidth;
    const height = rows > 0 ? rows : imageHeight;
    const scale = computeScale(width, height);
    const scaledWidth = Math.max(1, Math.round(width * scale));
    const scaledHeight = Math.max(1, Math.round(height * scale));

    let working = src;
    if (scale < 1) {
      const resized = OpenCV.createObject(
        ObjectType.Mat,
        scaledHeight,
        scaledWidth,
        DataTypes.CV_8UC3,
      );
      const size = OpenCV.createObject(ObjectType.Size, scaledWidth, scaledHeight);
      OpenCV.invoke(
        'resize',
        src,
        resized,
        size,
        0,
        0,
        InterpolationFlags.INTER_AREA,
      );
      working = resized;
    }

    const detected = detectOnScaledMat(working, scaledWidth, scaledHeight);

    if (!detected) {
      return { corners: null, width, height };
    }

    return {
      corners: {
        topLeft: scalePoint(detected.topLeft, scale),
        topRight: scalePoint(detected.topRight, scale),
        bottomRight: scalePoint(detected.bottomRight, scale),
        bottomLeft: scalePoint(detected.bottomLeft, scale),
      },
      width,
      height,
    };
  } finally {
    OpenCV.clearBuffers();
  }
}

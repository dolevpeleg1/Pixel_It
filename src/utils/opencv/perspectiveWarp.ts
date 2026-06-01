import {
  BorderTypes,
  DecompTypes,
  InterpolationFlags,
  ObjectType,
  OpenCV,
  type Mat,
} from 'react-native-fast-opencv';
import type { CornerSet } from '../../types';
import {
  cornerSetToPointVector,
  createMatLike,
  outputSizeFromCorners,
  rectToPointVector,
} from './pointVector';
import { assertMatHasPixels } from './matValidation';

export function perspectiveWarp(src: Mat, corners: CornerSet): Mat {
  assertMatHasPixels(src, 'source image');
  const { width, height } = outputSizeFromCorners(corners);
  const srcPoints = cornerSetToPointVector(corners);
  const dstPoints = rectToPointVector(width, height);

  const transform = OpenCV.invoke(
    'getPerspectiveTransform',
    srcPoints,
    dstPoints,
    DecompTypes.DECOMP_LU,
  );

  const dst = createMatLike(src, height, width);
  const size = OpenCV.createObject(ObjectType.Size, width, height);
  const borderValue = OpenCV.createObject(ObjectType.Scalar, 0, 0, 0);

  OpenCV.invoke(
    'warpPerspective',
    src,
    dst,
    transform,
    size,
    InterpolationFlags.INTER_LINEAR,
    BorderTypes.BORDER_CONSTANT,
    borderValue,
  );

  return dst;
}

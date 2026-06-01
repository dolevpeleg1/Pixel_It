import { ObjectType, OpenCV, type Mat } from 'react-native-fast-opencv';
import { createMatLike } from './pointVector';

/** Mild contrast + unsharp mask for a cleaner "screenshot" look. */
export function enhanceScreenshot(src: Mat): Mat {
  const { rows, cols } = OpenCV.matToBuffer(src, 'uint8');
  const contrasted = createMatLike(src, rows, cols);
  OpenCV.invoke('convertScaleAbs', src, contrasted, 1.12, 8);

  const blurred = createMatLike(src, rows, cols);
  const blurKernel = OpenCV.createObject(ObjectType.Size, 3, 3);
  OpenCV.invoke('GaussianBlur', contrasted, blurred, blurKernel, 0);

  const sharpened = createMatLike(src, rows, cols);
  OpenCV.invoke('addWeighted', contrasted, 1.35, blurred, -0.35, 0, sharpened);

  return sharpened;
}

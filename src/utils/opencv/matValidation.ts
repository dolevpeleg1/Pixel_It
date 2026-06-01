import { OpenCV, type Mat } from 'react-native-fast-opencv';

export function assertMatHasPixels(mat: Mat, label: string): void {
  const { rows, cols } = OpenCV.toJSValue(mat);
  if (rows <= 0 || cols <= 0) {
    throw new Error(`${label} is empty (${rows}x${cols}).`);
  }
}

import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import type { Mat } from 'react-native-fast-opencv';
import { OpenCV } from 'react-native-fast-opencv';

export async function loadMatFromUri(uri: string): Promise<Mat> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return OpenCV.base64ToMat(base64);
}

export function saveMatToCacheJpeg(mat: Mat, quality = 0.92): string {
  const file = new File(Paths.cache, `pixel-it-${Date.now()}.jpg`);
  OpenCV.saveMatToFile(mat, file.uri, 'jpeg', quality);
  return file.uri;
}

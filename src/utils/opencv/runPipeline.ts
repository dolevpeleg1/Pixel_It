import { OpenCV } from 'react-native-fast-opencv';
import type { CornerSet } from '../../types';
import { enhanceScreenshot } from './enhance';
import { loadMatFromUri, saveMatToCacheJpeg } from './imageIO';
import { perspectiveWarp } from './perspectiveWarp';

export async function runOpenCVPipeline(
  uri: string,
  corners: CornerSet,
): Promise<string> {
  const src = await loadMatFromUri(uri);

  try {
    const warped = perspectiveWarp(src, corners);
    const enhanced = enhanceScreenshot(warped);
    return saveMatToCacheJpeg(enhanced);
  } finally {
    OpenCV.clearBuffers();
  }
}

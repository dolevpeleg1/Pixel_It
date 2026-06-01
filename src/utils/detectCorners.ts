import type { CornerSet } from '../types';
import type { DetectScreenCornersResult } from './opencv/detectScreenCorners';

export type DetectCornersResult = DetectScreenCornersResult;

export async function detectCorners(
  uri: string,
  imageWidth: number,
  imageHeight: number,
): Promise<DetectCornersResult> {
  try {
    const { detectScreenCorners } = await import('./opencv/detectScreenCorners');
    return await detectScreenCorners(uri, imageWidth, imageHeight);
  } catch (error) {
    if (__DEV__) {
      console.warn('[Pixel It] corner detection failed:', error);
    }
    return { corners: null, width: imageWidth, height: imageHeight };
  }
}

import type { CornerSet } from '../types';

export async function processImage(
  uri: string,
  corners: CornerSet,
): Promise<string> {
  try {
    const { runOpenCVPipeline } = await import('./opencv/runPipeline');
    return await runOpenCVPipeline(uri, corners);
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : 'Unknown processing error.';
    throw new Error(
      `Could not process image (${detail}). Use a development build with OpenCV.`,
    );
  }
}

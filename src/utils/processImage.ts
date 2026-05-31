import type { CornerSet } from '../types';

/** Stub until OpenCV pipeline is wired in Step 6. */
export async function processImage(
  uri: string,
  _corners: CornerSet,
): Promise<string> {
  return uri;
}

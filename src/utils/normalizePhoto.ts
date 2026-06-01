import { Image } from 'react-native';

/** Longest edge cap — keeps OpenCV processing fast on 12MP+ photos. */
export const MAX_IMAGE_DIMENSION = 2048;

function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error),
    );
  });
}

function warnManipulatorUnavailable(error: unknown): void {
  if (__DEV__) {
    console.warn(
      '[Pixel It] expo-image-manipulator unavailable — rebuild the dev client (npm run ios or Xcode Run). Using original photo.',
      error,
    );
  }
}

/**
 * Bakes EXIF orientation into pixels and downscales very large photos before corner UI / OpenCV.
 * Requires a dev client rebuild that includes `expo-image-manipulator`; otherwise falls back to the original URI.
 */
export async function normalizePhotoUri(uri: string): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  const { width, height } = await getImageDimensions(uri);
  const longest = Math.max(width, height);
  const scale =
    longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;

  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  let manipulateAsync: typeof import('expo-image-manipulator').manipulateAsync;
  let saveFormat: import('expo-image-manipulator').SaveFormat;

  try {
    const manipulator = await import('expo-image-manipulator');
    if (typeof manipulator.manipulateAsync !== 'function') {
      warnManipulatorUnavailable(new Error('manipulateAsync is missing'));
      return { uri, width, height };
    }
    manipulateAsync = manipulator.manipulateAsync;
    saveFormat = manipulator.SaveFormat?.JPEG ?? ('jpeg' as import('expo-image-manipulator').SaveFormat);
  } catch (error) {
    warnManipulatorUnavailable(error);
    return { uri, width, height };
  }

  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: targetWidth, height: targetHeight } }],
      { compress: 0.92, format: saveFormat },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    warnManipulatorUnavailable(error);
    return { uri, width, height };
  }
}

import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'react-native';

/** Longest edge cap — keeps OpenCV processing fast on 12MP+ photos. */
export const MAX_IMAGE_DIMENSION = 2048;

export type NormalizePhotoHints = {
  width?: number;
  height?: number;
  mimeType?: string;
};

function extensionFromUri(uri: string): string | null {
  const path = uri.split(/[?#]/)[0];
  const match = path.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function extensionFromMimeType(mimeType?: string): string | null {
  if (!mimeType) {
    return null;
  }
  const normalized = mimeType.toLowerCase();
  if (normalized.includes('heic') || normalized.includes('heif')) {
    return 'heic';
  }
  if (normalized.includes('png')) {
    return 'png';
  }
  if (normalized.includes('jpeg') || normalized.includes('jpg')) {
    return 'jpg';
  }
  return null;
}

async function waitForReadableFile(uri: string, attempts = 12): Promise<void> {
  for (let index = 0; index < attempts; index += 1) {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && (!('size' in info) || (info.size ?? 0) > 0)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error('Photo file is not ready yet.');
}

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

/**
 * Copy the picker/camera URI into app cache immediately so iOS cannot delete the
 * temp file before normalization/OpenCV run.
 */
export async function persistPickerUri(
  uri: string,
  mimeType?: string,
): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir || !uri.startsWith('file://')) {
    return uri;
  }

  const ext =
    extensionFromUri(uri) ?? extensionFromMimeType(mimeType) ?? 'jpg';
  const dest = `${cacheDir}pixel-it-capture-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

/**
 * Bakes EXIF orientation into pixels, converts to JPEG, and downscales very large photos.
 */
export async function normalizePhotoUri(
  uri: string,
  hints: NormalizePhotoHints = {},
): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  await waitForReadableFile(uri);

  let width = hints.width ?? 0;
  let height = hints.height ?? 0;
  if (width <= 0 || height <= 0) {
    ({ width, height } = await getImageDimensions(uri));
  }

  const longest = Math.max(width, height);
  const scale =
    longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;
  const targetWidth = Math.max(1, Math.round(width * scale));

  const manipulator = await import('expo-image-manipulator');
  if (typeof manipulator.manipulateAsync !== 'function') {
    throw new Error('expo-image-manipulator is unavailable in this build.');
  }

  const saveFormat =
    manipulator.SaveFormat?.JPEG ??
    ('jpeg' as import('expo-image-manipulator').SaveFormat);

  const actions =
    scale < 1
      ? [{ resize: { width: targetWidth } }]
      : [];

  const result = await manipulator.manipulateAsync(uri, actions, {
    compress: 0.92,
    format: saveFormat,
  });

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
}

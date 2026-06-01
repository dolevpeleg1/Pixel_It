import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import type { Mat } from 'react-native-fast-opencv';
import { OpenCV } from 'react-native-fast-opencv';

const DECODABLE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'bmp',
]);

function stripBase64Prefix(data: string): string {
  const match = data.match(/^data:image\/[a-z+]+;base64,(.*)$/i);
  return match?.[1] ?? data;
}

function extensionFromUri(uri: string): string | null {
  const path = uri.split(/[?#]/)[0];
  const match = path.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

async function ensureLocalFileUri(uri: string): Promise<string> {
  if (uri.startsWith('file://')) {
    return uri;
  }

  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache directory is unavailable.');
  }

  const ext = extensionFromUri(uri) ?? 'jpg';
  const dest = `${cacheDir}pixel-it-input-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

function assertMatDecoded(mat: Mat, uri: string): void {
  const { rows, cols } = OpenCV.toJSValue(mat);
  if (rows > 0 && cols > 0) {
    return;
  }

  const ext = extensionFromUri(uri);
  if (ext && !DECODABLE_EXTENSIONS.has(ext)) {
    throw new Error(
      `OpenCV cannot decode .${ext} images. Rebuild the dev client so photo normalization works, or pick a JPEG/PNG.`,
    );
  }

  throw new Error(
    'Image could not be decoded for processing. Try another photo or rebuild the dev client.',
  );
}

export async function loadMatFromUri(uri: string): Promise<Mat> {
  const fileUri = await ensureLocalFileUri(uri);
  const info = await FileSystem.getInfoAsync(fileUri);

  if (!info.exists) {
    throw new Error('Image file is missing.');
  }

  if ('size' in info && info.size === 0) {
    throw new Error('Image file is empty.');
  }

  let base64: string;
  try {
    base64 = await new File(fileUri).base64();
  } catch {
    base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  if (!base64) {
    throw new Error('Could not read image bytes.');
  }

  const mat = OpenCV.base64ToMat(stripBase64Prefix(base64));
  assertMatDecoded(mat, fileUri);
  return mat;
}

export function saveMatToCacheJpeg(mat: Mat, quality = 0.92): string {
  const file = new File(Paths.cache, `pixel-it-${Date.now()}.jpg`);
  OpenCV.saveMatToFile(mat, file.uri, 'jpeg', quality);
  return file.uri;
}

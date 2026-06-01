import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type ExportResult =
  | { ok: true }
  | { ok: false; reason: 'permission_denied' }
  | { ok: false; reason: 'sharing_unavailable' }
  | { ok: false; reason: 'error'; message: string };

const IMAGE_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
  webp: 'image/webp',
  gif: 'image/gif',
};

const DEFAULT_IMAGE_MIME_TYPE = 'image/jpeg';

function getImageMimeType(uri: string): string {
  const path = uri.split(/[?#]/)[0];
  const match = path.match(/\.([a-z0-9]+)$/i);
  const ext = match?.[1]?.toLowerCase();
  if (ext && ext in IMAGE_MIME_TYPES) {
    return IMAGE_MIME_TYPES[ext];
  }
  return DEFAULT_IMAGE_MIME_TYPE;
}

async function requestSaveToPhotosPermission(): Promise<MediaLibrary.PermissionResponse> {
  // iOS: write-only is enough for saveToLibraryAsync (NSPhotoLibraryAddUsageDescription).
  // Android: default scope matches what saveToLibraryAsync expects on all API levels.
  if (Platform.OS === 'ios') {
    return MediaLibrary.requestPermissionsAsync(true);
  }
  return MediaLibrary.requestPermissionsAsync();
}

export async function saveToPhotos(uri: string): Promise<ExportResult> {
  const { status } = await requestSaveToPhotosPermission();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not save to Photos.';
    return { ok: false, reason: 'error', message };
  }
}

export async function shareImage(uri: string): Promise<ExportResult> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { ok: false, reason: 'sharing_unavailable' };
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: getImageMimeType(uri),
      dialogTitle: 'Share screenshot',
    });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not share image.';
    return { ok: false, reason: 'error', message };
  }
}

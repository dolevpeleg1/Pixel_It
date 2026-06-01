import * as ImagePicker from 'expo-image-picker';
import { normalizePhotoUri } from './normalizePhoto';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 1,
};

/** Prefer JPEG/PNG from the library so OpenCV can decode without expo-image-manipulator. */
const libraryPickerOptions: ImagePicker.ImagePickerOptions = {
  ...pickerOptions,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

export type PickPhotoResult =
  | { ok: true; uri: string; width: number; height: number }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission_denied'; source: 'camera' | 'library' }
  | { ok: false; reason: 'prepare_failed' };

async function preparePickedUri(uri: string): Promise<PickPhotoResult> {
  try {
    const normalized = await normalizePhotoUri(uri);
    return {
      ok: true,
      uri: normalized.uri,
      width: normalized.width,
      height: normalized.height,
    };
  } catch {
    return { ok: false, reason: 'prepare_failed' };
  }
}

export async function pickFromCamera(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'camera' };
  }

  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  return preparePickedUri(result.assets[0].uri);
}

export async function pickFromLibrary(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'library' };
  }

  const result = await ImagePicker.launchImageLibraryAsync(libraryPickerOptions);
  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  return preparePickedUri(result.assets[0].uri);
}

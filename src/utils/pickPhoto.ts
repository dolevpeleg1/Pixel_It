import * as ImagePicker from 'expo-image-picker';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 1,
};

export type PickPhotoResult =
  | { ok: true; uri: string }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission_denied'; source: 'camera' | 'library' };

export async function pickFromCamera(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'camera' };
  }

  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  return { ok: true, uri: result.assets[0].uri };
}

export async function pickFromLibrary(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'library' };
  }

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled || !result.assets[0]?.uri) {
    return { ok: false, reason: 'cancelled' };
  }

  return { ok: true, uri: result.assets[0].uri };
}

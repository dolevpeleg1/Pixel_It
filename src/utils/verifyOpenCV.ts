export type OpenCVVerifyResult =
  | { ok: true }
  | { ok: false; message: string };

/** Smoke test that OpenCV JSI bindings load in a dev client build. */
export async function verifyOpenCVLoaded(): Promise<OpenCVVerifyResult> {
  try {
    const { DataTypes, ObjectType, OpenCV } = await import(
      'react-native-fast-opencv'
    );

    const mat = OpenCV.createObject(ObjectType.Mat, 1, 1, DataTypes.CV_8UC3);

    if (!mat?.id) {
      return { ok: false, message: 'OpenCV Mat creation returned an invalid handle.' };
    }

    OpenCV.clearBuffers();
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'OpenCV module is unavailable.';
    return { ok: false, message };
  }
}

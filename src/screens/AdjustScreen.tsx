import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import CornerOverlay from '../components/CornerOverlay';
import type { CornerSet, RootStackParamList } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { detectCorners } from '../utils/detectCorners';
import { defaultCorners } from '../utils/defaultCorners';
import { processImage } from '../utils/processImage';

type Props = NativeStackScreenProps<RootStackParamList, 'Adjust'>;

type DetectionSource = 'auto' | 'default';

export default function AdjustScreen({ navigation, route }: Props) {
  const { photoUri, imageWidth, imageHeight } = route.params;
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [corners, setCorners] = useState<CornerSet | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [detectionSource, setDetectionSource] = useState<DetectionSource | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const processRequestRef = useRef(0);
  const detectRequestRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      processRequestRef.current += 1;
      detectRequestRef.current += 1;
    };
  }, []);

  const runDetection = useCallback(
    async (uri: string, width: number, height: number) => {
      const requestId = ++detectRequestRef.current;
      const isActive = () =>
        isMountedRef.current && detectRequestRef.current === requestId;

      if (!isActive()) {
        return;
      }

      setDetecting(true);
      setCorners(null);
      setDetectionSource(null);
      setProcessError(null);

      const result = await detectCorners(uri, width, height);

      if (!isActive()) {
        return;
      }

      setImageSize({ width: result.width, height: result.height });

      if (result.corners) {
        setCorners(result.corners);
        setDetectionSource('auto');
      } else {
        setCorners(defaultCorners(result.width, result.height));
        setDetectionSource('default');
      }

      setDetecting(false);
    },
    [],
  );

  useEffect(() => {
    void runDetection(photoUri, imageWidth, imageHeight);

    return () => {
      detectRequestRef.current += 1;
    };
  }, [photoUri, imageWidth, imageHeight, runDetection]);

  async function handleDetectAgain() {
    if (!imageSize || detecting || processing) {
      return;
    }
    await runDetection(photoUri, imageSize.width, imageSize.height);
  }

  async function handleProcess() {
    if (!corners || !isMountedRef.current) {
      return;
    }

    const requestId = ++processRequestRef.current;
    const isActive = () =>
      isMountedRef.current && processRequestRef.current === requestId;

    if (!isActive()) {
      return;
    }

    setProcessError(null);
    setProcessing(true);

    try {
      const processedUri = await processImage(photoUri, corners);
      if (!isActive()) {
        return;
      }
      navigation.navigate('Result', {
        originalUri: photoUri,
        processedUri,
      });
    } catch (error) {
      if (!isActive()) {
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Could not process this image.';
      setProcessError(message);
    } finally {
      if (isActive()) {
        setProcessing(false);
      }
    }
  }

  const hintText = detecting
    ? 'Finding corners…'
    : detectionSource === 'auto'
      ? 'Corners detected automatically. Drag to fine-tune.'
      : "Couldn't detect edges — adjust the corners manually.";

  const busy = processing || detecting;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.imageArea}>
          {detecting || !imageSize || !corners ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Finding corners…</Text>
            </View>
          ) : (
            <CornerOverlay
              photoUri={photoUri}
              imageWidth={imageSize.width}
              imageHeight={imageSize.height}
              corners={corners}
              onCornersChange={setCorners}
            />
          )}
        </View>

        <Text style={styles.hint}>{hintText}</Text>

        {processError ? <Text style={styles.error}>{processError}</Text> : null}

        <View style={styles.actions}>
          <AppButton
            label="Detect again"
            variant="secondary"
            onPress={() => void handleDetectAgain()}
            disabled={busy || !corners}
            style={styles.actionButton}
          />
          <AppButton
            label="Process"
            onPress={() => void handleProcess()}
            loading={processing}
            disabled={busy || !corners}
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  imageArea: {
    flex: 1,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.imageBackdrop,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  hint: {
    ...typography.caption,
    color: colors.textSubtle,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

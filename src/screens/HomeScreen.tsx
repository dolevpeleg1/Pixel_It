import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import OnboardingModal from '../components/OnboardingModal';
import type { RootStackParamList } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from '../utils/onboardingStorage';
import { pickFromCamera, pickFromLibrary } from '../utils/pickPhoto';
import { verifyOpenCVLoaded } from '../utils/verifyOpenCV';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function NeonAccentBar() {
  return (
    <View style={styles.accentRow}>
      <View style={[styles.accentSegment, { backgroundColor: colors.neon.magenta }]} />
      <View style={[styles.accentSegment, { backgroundColor: colors.neon.cyan }]} />
      <View style={[styles.accentSegment, { backgroundColor: colors.neon.lime }]} />
      <View style={[styles.accentSegment, { backgroundColor: colors.neon.violet }]} />
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opencvStatus, setOpencvStatus] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void hasCompletedOnboarding().then((completed) => {
      if (!isMounted) {
        return;
      }
      if (!completed) {
        setShowOnboarding(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    let isMounted = true;

    void verifyOpenCVLoaded().then((result) => {
      if (!isMounted) {
        return;
      }

      if (result.ok) {
        setOpencvStatus('OpenCV ready');
        console.log('[Pixel It] OpenCV module loaded successfully.');
      } else {
        setOpencvStatus('OpenCV unavailable (dev client required)');
        console.warn('[Pixel It] OpenCV check failed:', result.message);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleOnboardingComplete() {
    await markOnboardingComplete();
    setShowOnboarding(false);
  }

  async function handlePick(source: 'camera' | 'library') {
    setErrorMessage(null);
    setLoading(true);

    try {
      const result =
        source === 'camera' ? await pickFromCamera() : await pickFromLibrary();

      if (result.ok) {
        navigation.navigate('Adjust', {
          photoUri: result.uri,
          imageWidth: result.width,
          imageHeight: result.height,
        });
        return;
      }

      if (result.reason === 'prepare_failed') {
        setErrorMessage('Could not prepare that photo. Try another image.');
        return;
      }

      if (result.reason === 'permission_denied') {
        setErrorMessage(
          source === 'camera'
            ? 'Camera access is required to take a photo. Enable it in Settings.'
            : 'Photo library access is required to choose a photo. Enable it in Settings.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.glowTop} pointerEvents="none" />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appIcon}
            accessibilityLabel="Pixel It app icon"
          />
          <NeonAccentBar />
          <Text style={styles.title}>Pixel It</Text>
          <Text style={styles.subtitle}>
            Flatten any screen photo into a clean, screenshot-like image.
          </Text>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <AppButton
            label="Take Photo"
            onPress={() => void handlePick('camera')}
            loading={loading}
            disabled={loading}
          />
          <AppButton
            label="Choose from Library"
            variant="secondary"
            onPress={() => void handlePick('library')}
            disabled={loading}
          />
        </View>

        {opencvStatus ? (
          <Text style={styles.devStatus}>{opencvStatus}</Text>
        ) : null}
      </View>

      <OnboardingModal
        visible={showOnboarding}
        onComplete={() => void handleOnboardingComplete()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.neon.violet,
    opacity: 0.12,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: spacing.xxl,
  },
  appIcon: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  accentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    width: 72,
  },
  accentSegment: {
    flex: 1,
    height: 3,
    borderRadius: radii.full,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.md,
  },
  devStatus: {
    ...typography.small,
    color: colors.devStatus,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});

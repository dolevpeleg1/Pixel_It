import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { CornerKey, CornerSet, Point } from '../types';
import { CORNER_KEYS } from '../types';
import {
  clampScreenToImagePoint,
  imageToScreen,
  type ImageLayout,
} from '../utils/imageCoords';
import { colors, radii, spacing, typography } from '../theme';
import DraggableHandle from './DraggableHandle';
import QuadLine from './QuadLine';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type Props = {
  photoUri: string;
  imageWidth: number;
  imageHeight: number;
  corners: CornerSet;
  editable?: boolean;
  onCornersChange: (corners: CornerSet) => void;
};

export default function CornerOverlay({
  photoUri,
  imageWidth,
  imageHeight,
  corners,
  editable = true,
  onCornersChange,
}: Props) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoomScale, setZoomScale] = useState(1);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const layoutRef = useRef<ImageLayout | null>(null);
  const cornersRef = useRef(corners);
  const editableRef = useRef(editable);
  const onCornersChangeRef = useRef(onCornersChange);

  const layout: ImageLayout | null = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return null;
    }
    return {
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      imageWidth,
      imageHeight,
    };
  }, [containerSize, imageWidth, imageHeight]);

  layoutRef.current = layout;
  cornersRef.current = corners;
  editableRef.current = editable;
  onCornersChangeRef.current = onCornersChange;

  const screenCorners = useMemo(() => {
    if (!layout) {
      return null;
    }
    return {
      topLeft: imageToScreen(corners.topLeft, layout),
      topRight: imageToScreen(corners.topRight, layout),
      bottomRight: imageToScreen(corners.bottomRight, layout),
      bottomLeft: imageToScreen(corners.bottomLeft, layout),
    };
  }, [corners, layout]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(editable)
        .onUpdate((event) => {
          const next = Math.min(
            MAX_ZOOM,
            Math.max(MIN_ZOOM, savedScale.value * event.scale),
          );
          scale.value = next;
          runOnJS(setZoomScale)(next);
        })
        .onEnd(() => {
          savedScale.value = scale.value;
          if (scale.value <= 1.02) {
            scale.value = withTiming(1);
            savedScale.value = 1;
            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
            runOnJS(setZoomScale)(1);
          }
        }),
    [editable, savedScale, scale, translateX, translateY, savedTranslateX, savedTranslateY],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(editable)
        .minPointers(2)
        .onUpdate((event) => {
          translateX.value = savedTranslateX.value + event.translationX;
          translateY.value = savedTranslateY.value + event.translationY;
        })
        .onEnd(() => {
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        }),
    [editable, translateX, translateY, savedTranslateX, savedTranslateY],
  );

  const zoomGesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, panGesture),
    [pinchGesture, panGesture],
  );

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }),
    [translateX, translateY, scale],
  );

  const handleCornerMove = useCallback(
    (key: CornerKey, screenX: number, screenY: number) => {
      const currentLayout = layoutRef.current;
      if (!currentLayout || !editableRef.current) {
        return;
      }

      const imagePoint = clampScreenToImagePoint(
        { x: screenX, y: screenY },
        currentLayout,
      );

      onCornersChangeRef.current({
        ...cornersRef.current,
        [key]: imagePoint,
      });
    },
    [],
  );

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  const quadPoints: Point[] | null = screenCorners
    ? [
        screenCorners.topLeft,
        screenCorners.topRight,
        screenCorners.bottomRight,
        screenCorners.bottomLeft,
      ]
    : null;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={zoomGesture}>
        <Animated.View style={[styles.zoomLayer, animatedStyle]}>
          <Image
            source={{ uri: photoUri }}
            style={styles.image}
            resizeMode="contain"
          />
          {screenCorners && quadPoints ? (
            <View style={styles.overlay} pointerEvents="box-none">
              <QuadLine from={quadPoints[0]} to={quadPoints[1]} />
              <QuadLine from={quadPoints[1]} to={quadPoints[2]} />
              <QuadLine from={quadPoints[2]} to={quadPoints[3]} />
              <QuadLine from={quadPoints[3]} to={quadPoints[0]} />
              {CORNER_KEYS.map((key) => (
                <DraggableHandle
                  key={key}
                  cornerKey={key}
                  screenX={screenCorners[key].x}
                  screenY={screenCorners[key].y}
                  zoomScale={scale}
                  enabled={editable}
                  onMove={handleCornerMove}
                />
              ))}
            </View>
          ) : null}
        </Animated.View>
      </GestureDetector>

      {editable && zoomScale > 1 ? (
        <View style={styles.zoomHint} pointerEvents="none">
          <Text style={styles.zoomHintText}>Pinch · two-finger pan</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.imageBackdrop,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  zoomLayer: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomHint: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  zoomHintText: {
    ...typography.small,
    color: colors.textMuted,
  },
});

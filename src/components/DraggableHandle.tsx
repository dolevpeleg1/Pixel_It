import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';
import type { CornerKey } from '../types';
import { colors } from '../theme';

export const HANDLE_SIZE = 28;

const CORNER_LABELS: Record<CornerKey, string> = {
  topLeft: 'Top left corner',
  topRight: 'Top right corner',
  bottomRight: 'Bottom right corner',
  bottomLeft: 'Bottom left corner',
};

type Props = {
  cornerKey: CornerKey;
  screenX: number;
  screenY: number;
  zoomScale: SharedValue<number>;
  enabled: boolean;
  onMove: (key: CornerKey, x: number, y: number) => void;
};

export default function DraggableHandle({
  cornerKey,
  screenX,
  screenY,
  zoomScale,
  enabled,
  onMove,
}: Props) {
  const origin = useRef({ x: screenX, y: screenY });
  const onMoveRef = useRef(onMove);
  const screenPosRef = useRef({ x: screenX, y: screenY });

  onMoveRef.current = onMove;
  screenPosRef.current = { x: screenX, y: screenY };

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .runOnJS(true)
        .onBegin(() => {
          origin.current = { ...screenPosRef.current };
        })
        .onUpdate((event) => {
          const factor = zoomScale.value > 0 ? zoomScale.value : 1;
          onMoveRef.current(
            cornerKey,
            origin.current.x + event.translationX / factor,
            origin.current.y + event.translationY / factor,
          );
        })
        .onEnd((event) => {
          const factor = zoomScale.value > 0 ? zoomScale.value : 1;
          onMoveRef.current(
            cornerKey,
            origin.current.x + event.translationX / factor,
            origin.current.y + event.translationY / factor,
          );
        }),
    [cornerKey, enabled, zoomScale],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={CORNER_LABELS[cornerKey]}
        accessibilityHint="Drag to adjust the corner position"
        style={[
          styles.handle,
          {
            left: screenX - HANDLE_SIZE / 2,
            top: screenY - HANDLE_SIZE / 2,
          },
          !enabled && styles.handleDisabled,
        ]}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.overlayHandle,
    borderWidth: 3,
    borderColor: colors.overlayHandleBorder,
    shadowColor: colors.neon.lime,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 10,
  },
  handleDisabled: {
    opacity: 0.5,
  },
});

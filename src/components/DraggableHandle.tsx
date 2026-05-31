import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export const HANDLE_SIZE = 28;

type Props = {
  screenX: number;
  screenY: number;
  onMove: (x: number, y: number) => void;
};

export default function DraggableHandle({ screenX, screenY, onMove }: Props) {
  const origin = useRef({ x: screenX, y: screenY });

  const gesture = Gesture.Pan()
    .runOnJS(true)
    .onBegin(() => {
      origin.current = { x: screenX, y: screenY };
    })
    .onUpdate((event) => {
      onMove(
        origin.current.x + event.translationX,
        origin.current.y + event.translationY,
      );
    })
    .onEnd((event) => {
      onMove(
        origin.current.x + event.translationX,
        origin.current.y + event.translationY,
      );
    });

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          styles.handle,
          {
            left: screenX - HANDLE_SIZE / 2,
            top: screenY - HANDLE_SIZE / 2,
          },
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
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 10,
  },
});

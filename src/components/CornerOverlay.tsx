import { useMemo, useState } from 'react';
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import type { CornerKey, CornerSet, Point } from '../types';
import { CORNER_KEYS } from '../types';
import {
  clampScreenToImagePoint,
  imageToScreen,
  type ImageLayout,
} from '../utils/imageCoords';
import { colors, radii } from '../theme';
import DraggableHandle from './DraggableHandle';
import QuadLine from './QuadLine';

type Props = {
  photoUri: string;
  imageWidth: number;
  imageHeight: number;
  corners: CornerSet;
  onCornersChange: (corners: CornerSet) => void;
};

export default function CornerOverlay({
  photoUri,
  imageWidth,
  imageHeight,
  corners,
  onCornersChange,
}: Props) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  function handleCornerMove(key: CornerKey, screenX: number, screenY: number) {
    if (!layout) {
      return;
    }

    const imagePoint = clampScreenToImagePoint(
      { x: screenX, y: screenY },
      layout,
    );

    onCornersChange({
      ...corners,
      [key]: imagePoint,
    });
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
              screenX={screenCorners[key].x}
              screenY={screenCorners[key].y}
              onMove={(x, y) => handleCornerMove(key, x, y)}
            />
          ))}
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
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

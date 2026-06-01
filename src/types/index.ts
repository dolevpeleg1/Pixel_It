export type Point = {
  x: number;
  y: number;
};

export type CornerSet = {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
};

export type CornerKey = keyof CornerSet;

export const CORNER_KEYS: CornerKey[] = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
];

export type RootStackParamList = {
  Home: undefined;
  Adjust: { photoUri: string; imageWidth: number; imageHeight: number };
  Result: { originalUri: string; processedUri: string };
};

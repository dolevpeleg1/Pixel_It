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

export type RootStackParamList = {
  Home: undefined;
  Adjust: { photoUri: string };
  Result: { originalUri: string; processedUri: string };
};

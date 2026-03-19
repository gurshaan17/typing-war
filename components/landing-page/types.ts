export type CaretStyle = {
  left: number;
  top: number;
  height: number;
};

export type CharacterState = "pending" | "correct" | "incorrect";
export type TestMode = "time" | "words" | "custom";

export type TestMetrics = {
  accuracy: number;
  wpm: number;
};

export type PerformancePoint = {
  second: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errorCount: number;
};

export type ErrorEvent = {
  second: number;
  index: number;
};

export type ResultMetrics = {
  correctChars: number;
  incorrectChars: number;
  rawWpm: number;
  consistency: number;
  errors: number;
};

export type ChartPoint = {
  x: number;
  y: number;
  point: PerformancePoint;
};

export type ErrorMarker = {
  second: number;
  x: number;
  y: number;
};

export type ChartData = {
  yMax: number;
  gridLines: Array<{ value: number; y: number }>;
  wpmPoints: ChartPoint[];
  rawPoints: ChartPoint[];
  errorMarkers: ErrorMarker[];
  wpmPath: string;
  rawPath: string;
};

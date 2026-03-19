export const TEST_TIMES = [15, 30, 60, 120] as const;
export const CHART_WIDTH = 960;
export const CHART_HEIGHT = 320;
export const CHART_PADDING = { top: 18, right: 28, bottom: 36, left: 52 };

export function createRaceId() {
  return Math.random().toString(36).slice(2, 8);
}

export function getRandomSnippetIndex(
  sentences: string[],
  currentIndex?: number,
) {
  if (sentences.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * sentences.length);

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * sentences.length);
  }

  return nextIndex;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatDuration(seconds: number) {
  return `${seconds}s`;
}

export function buildLinePath(
  points: Array<{ x: number; y: number }>,
  baseline: number,
) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${baseline} L ${point.x} ${point.y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previousPoint = points[index - 1];
    const controlX = (previousPoint.x + point.x) / 2;

    return `${path} C ${controlX} ${previousPoint.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

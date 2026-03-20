"use client";

import {
  CHART_HEIGHT,
  CHART_PADDING,
  CHART_WIDTH,
  formatDuration,
} from "@/components/landing-page/helpers";
import type {
  ChartData,
  ResultMetrics,
  TestMetrics,
} from "@/components/landing-page/types";

type ResultsPanelProps = {
  isVisible: boolean;
  duration: number;
  metrics: TestMetrics;
  resultMetrics: ResultMetrics;
  chartData: ChartData | null;
};

export function ResultsPanel({
  isVisible,
  duration,
  metrics,
  resultMetrics,
  chartData,
}: ResultsPanelProps) {
  if (!isVisible || !chartData) {
    return null;
  }

  return (
    <section className="mt-10 rounded-[2.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:px-6 sm:py-6">
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-sm tracking-[0.22em] text-muted-foreground uppercase">
              test complete
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">wpm</p>
                <p className="text-6xl leading-none tracking-[-0.08em] text-primary">
                  {metrics.wpm}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">accuracy</p>
                <p className="text-5xl leading-none tracking-[-0.08em] text-foreground">
                  {metrics.accuracy}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-muted-foreground">raw</p>
              <p className="text-3xl tracking-[-0.06em] text-foreground">
                {resultMetrics.rawWpm}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">characters</p>
              <p className="text-3xl tracking-[-0.06em] text-foreground">
                {resultMetrics.correctChars}/{resultMetrics.incorrectChars}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">consistency</p>
              <p className="text-3xl tracking-[-0.06em] text-foreground">
                {resultMetrics.consistency}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">time</p>
              <p className="text-3xl tracking-[-0.06em] text-foreground">
                {formatDuration(duration)}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-black/8 p-3 sm:p-4">
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="h-auto w-full"
            role="img"
            aria-label="Typing test performance chart"
          >
            {chartData.gridLines.map((gridLine) => (
              <g key={gridLine.value}>
                <line
                  x1={CHART_PADDING.left}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y1={gridLine.y}
                  y2={gridLine.y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
                <text
                  x={CHART_PADDING.left - 14}
                  y={gridLine.y + 5}
                  fill="rgba(245,240,232,0.45)"
                  fontSize="14"
                  textAnchor="end"
                >
                  {gridLine.value}
                </text>
              </g>
            ))}

            {Array.from({ length: duration }, (_, index) => index + 1).map((second) => {
              const x =
                CHART_PADDING.left +
                ((second - 1) / Math.max(duration - 1, 1)) *
                  (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right);

              return (
                <g key={second}>
                  <line
                    x1={x}
                    x2={x}
                    y1={CHART_PADDING.top}
                    y2={CHART_HEIGHT - CHART_PADDING.bottom}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={CHART_HEIGHT - 10}
                    fill="rgba(245,240,232,0.45)"
                    fontSize="13"
                    textAnchor="middle"
                  >
                    {second}
                  </text>
                </g>
              );
            })}

            <path
              d={chartData.rawPath}
              fill="none"
              stroke="rgba(245,240,232,0.35)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={chartData.wpmPath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {chartData.wpmPoints.map(({ x, y, point }) => (
              <circle
                key={`wpm-${point.second}`}
                cx={x}
                cy={y}
                r="4.5"
                fill="var(--primary)"
              />
            ))}

            {chartData.errorMarkers.map((marker) => (
              <g key={`error-${marker.second}`}>
                <line
                  x1={marker.x - 6}
                  x2={marker.x + 6}
                  y1={marker.y - 6}
                  y2={marker.y + 6}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={marker.x - 6}
                  x2={marker.x + 6}
                  y1={marker.y + 6}
                  y2={marker.y - 6}
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </svg>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 px-3 py-3">
              <p className="mb-1 text-xs tracking-[0.16em] uppercase">wpm line</p>
              <p className="text-foreground">Net speed over time</p>
            </div>
            <div className="rounded-2xl border border-border/60 px-3 py-3">
              <p className="mb-1 text-xs tracking-[0.16em] uppercase">raw line</p>
              <p className="text-foreground">Uncorrected typing speed</p>
            </div>
            <div className="rounded-2xl border border-border/60 px-3 py-3">
              <p className="mb-1 text-xs tracking-[0.16em] uppercase">error markers</p>
              <p className="text-foreground">
                {resultMetrics.errors} mistake{resultMetrics.errors === 1 ? "" : "s"} logged
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

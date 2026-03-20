"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { ResultsPanel } from "@/components/landing-page/results-panel";
import type {
  ChartData,
  ResultMetrics,
  TestMetrics,
} from "@/components/landing-page/types";
import type { Player } from "@repo/shared";

const PLAYER_COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#7F77DD", "#BA7517", "#D4537E"];
const PLAYER_COLOR_CLASSES = [
  "text-[#378ADD]",
  "text-[#1D9E75]",
  "text-[#D85A30]",
  "text-[#7F77DD]",
  "text-[#BA7517]",
  "text-[#D4537E]",
] as const;

type RaceResultsPanelProps = {
  players: Player[];
  myConnId: string | null;
  isHost: boolean;
  isFinished: boolean;
  metrics: TestMetrics;
  resultMetrics: ResultMetrics;
  chartData: ChartData | null;
  elapsedSeconds: number;
  onStartRace: () => void;
};

function formatFinishTime(timeMs: number | null) {
  if (timeMs === null) {
    return "DNF";
  }

  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function RaceResultsPanel({
  players,
  myConnId,
  isHost,
  isFinished,
  metrics,
  resultMetrics,
  chartData,
  elapsedSeconds,
  onStartRace,
}: RaceResultsPanelProps) {
  const router = useRouter();

  const rankedPlayers = useMemo(
    () =>
      [...players].sort((left, right) => {
        if (left.rank !== null && right.rank !== null && left.rank !== right.rank) {
          return left.rank - right.rank;
        }

        if (left.finishTime !== null && right.finishTime !== null) {
          return left.finishTime - right.finishTime;
        }

        if (left.finishTime !== null) {
          return -1;
        }

        if (right.finishTime !== null) {
          return 1;
        }

        return right.progress - left.progress;
      }),
    [players],
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {rankedPlayers.slice(0, 3).map((player, index) => (
          <article
            key={player.connId}
            className={`rounded-xl border border-border bg-background p-6 ${
              index === 0 ? "lg:translate-y-[-8px]" : ""
            } ${player.connId === myConnId ? "ring-2 ring-ring" : ""}`}
          >
            <p className="text-sm text-muted-foreground">#{player.rank ?? index + 1}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
              {player.name}
            </h2>
            <p className="mt-3 text-4xl tracking-[-0.07em] text-primary">{player.wpm} wpm</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatFinishTime(player.finishTime)}
            </p>
            {player.connId === myConnId ? (
              <span className="mt-4 inline-flex rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                You
              </span>
            ) : null}
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-background p-6">
        <h3 className="text-xl font-semibold tracking-[-0.04em] text-foreground">
          Full results
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="pb-3 pr-4">Rank</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">WPM</th>
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody>
              {rankedPlayers.map((player, index) => (
                <tr key={player.connId} className="border-t border-border/60">
                  <td className="py-3 pr-4 text-foreground">{player.rank ?? index + 1}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={player.connId === myConnId ? "font-semibold text-foreground" : "text-foreground"}
                    >
                      {player.name}
                    </span>
                  </td>
                  <td className={`py-3 pr-4 ${PLAYER_COLOR_CLASSES[index % PLAYER_COLORS.length]}`}>
                    {player.wpm}
                  </td>
                  <td className="py-3 pr-4 text-foreground">{formatFinishTime(player.finishTime)}</td>
                  <td className="py-3 text-right text-foreground">{player.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFinished ? (
        <div>
          <h3 className="mb-4 text-xl font-semibold tracking-[-0.04em] text-foreground">
            Your personal results
          </h3>
          <ResultsPanel
            isVisible
            duration={elapsedSeconds}
            metrics={metrics}
            resultMetrics={resultMetrics}
            chartData={chartData}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background p-6">
        <div>
          {isHost ? (
            <>
              <button
                type="button"
                onClick={onStartRace}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Start next race
              </button>
              <p className="mt-2 text-sm text-muted-foreground">Same players, new passage</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Waiting for host to start next race...
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-[var(--site-panel-muted)] px-4 py-3 text-sm font-medium text-foreground"
        >
          Leave race
        </button>
      </div>
    </section>
  );
}

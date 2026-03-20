"use client";

import { useMemo } from "react";

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
const PLAYER_STROKE_CLASSES = [
  "stroke-[#378ADD]",
  "stroke-[#1D9E75]",
  "stroke-[#D85A30]",
  "stroke-[#7F77DD]",
  "stroke-[#BA7517]",
  "stroke-[#D4537E]",
] as const;
const PLAYER_FILL_CLASSES = [
  "fill-[#378ADD]",
  "fill-[#1D9E75]",
  "fill-[#D85A30]",
  "fill-[#7F77DD]",
  "fill-[#BA7517]",
  "fill-[#D4537E]",
] as const;

type PitLaneLeaderboardProps = {
  players: Player[];
  myConnId: string | null;
  wpmHistory: Map<string, number[]>;
};

function formatStanding(position: number) {
  if (position === 1) {
    return "1st";
  }

  if (position === 2) {
    return "2nd";
  }

  if (position === 3) {
    return "3rd";
  }

  return `${position}th`;
}

function formatFinishTime(timeMs: number) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PitLaneLeaderboard({
  players,
  myConnId,
  wpmHistory,
}: PitLaneLeaderboardProps) {
  const playerStyles = useMemo(() => {
    const styles = new Map<
      string,
      {
        colorClass: string;
        strokeClass: string;
        fillClass: string;
      }
    >();

    players.forEach((player, index) => {
      const colorIndex = index % PLAYER_COLORS.length;
      styles.set(player.connId, {
        colorClass: PLAYER_COLOR_CLASSES[colorIndex],
        strokeClass: PLAYER_STROKE_CLASSES[colorIndex],
        fillClass: PLAYER_FILL_CLASSES[colorIndex],
      });
    });

    return styles;
  }, [players]);

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((left, right) => {
        if (right.progress !== left.progress) {
          return right.progress - left.progress;
        }

        return right.wpm - left.wpm;
      }),
    [players],
  );

  return (
    <section className="mt-6 rounded-xl border border-border bg-background p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.04em] text-foreground">
            Pit lane leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Live order updates every progress tick.
          </p>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {players.length} racers
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="pb-2 pr-4">Rank</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Progress bar</th>
              <th className="pb-2 pr-4">Sparkline</th>
              <th className="pb-2 text-right">WPM</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const playerStyle = playerStyles.get(player.connId);
              const colorClass = playerStyle?.colorClass ?? PLAYER_COLOR_CLASSES[0];
              const strokeClass = playerStyle?.strokeClass ?? PLAYER_STROKE_CLASSES[0];
              const fillClass = playerStyle?.fillClass ?? PLAYER_FILL_CLASSES[0];
              const history = wpmHistory.get(player.connId) ?? [];
              const maxValue = Math.max(...history, 1);
              const points = history.map((value, pointIndex) => {
                const x = history.length === 1 ? 30 : (pointIndex / (history.length - 1)) * 60;
                const y = 24 - (value / maxValue) * 20 - 2;

                return `${x},${y}`;
              }).join(" ");

              return (
                <tr
                  key={player.connId}
                  className="rounded-lg border border-border/70 bg-[var(--site-panel-muted)]"
                >
                  <td className="rounded-l-lg px-4 py-3 text-foreground">
                    {player.finishTime !== null ? "✓" : formatStanding(index + 1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={player.connId === myConnId ? "font-semibold text-foreground" : "text-foreground"}
                      >
                        {player.name}
                      </span>
                      {player.connId === myConnId ? (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          You
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <svg viewBox="0 0 100 4" className="h-1 w-full overflow-hidden rounded-full">
                      <rect x="0" y="0" width="100" height="4" rx="2" className="fill-white/10" />
                      <rect
                        x="0"
                        y="0"
                        width={player.progress}
                        height="4"
                        rx="2"
                        className={fillClass}
                      />
                    </svg>
                  </td>
                  <td className="px-4 py-3">
                    {history.length >= 2 ? (
                      <svg viewBox="0 0 60 24" className="h-6 w-[60px]" aria-hidden="true">
                        <polyline
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                          className={strokeClass}
                        />
                      </svg>
                    ) : null}
                  </td>
                  <td className={`rounded-r-lg px-4 py-3 text-right font-medium ${colorClass}`}>
                    {player.finishTime !== null ? formatFinishTime(player.finishTime) : player.wpm}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

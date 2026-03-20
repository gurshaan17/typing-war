"use client";

import { useEffect, useState } from "react";
import { IconCopy } from "@tabler/icons-react";

import type { Player } from "@repo/shared";

type RaceLobbyProps = {
  players: Player[];
  myConnId: string | null;
  hostConnId: string | null;
  isHost: boolean;
  roomId: string;
  onStartRace: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function RaceLobby({
  players,
  myConnId,
  hostConnId,
  isHost,
  roomId,
  onStartRace,
}: RaceLobbyProps) {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInviteLink(window.location.href || `${window.location.origin}/race/${roomId}`);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [roomId]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    if (!inviteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-xl border border-border bg-background p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
          Waiting for players
        </h2>
        <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {players.length} joined
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {players.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No players yet
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.connId}
              className="flex items-center gap-3 rounded-lg border border-border/70 bg-[var(--site-panel-muted)] px-4 py-3"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {getInitials(player.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      player.connId === myConnId ? "font-semibold text-foreground" : "text-foreground"
                    }
                  >
                    {player.name}
                  </span>
                  {player.connId === hostConnId ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      host
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground">Invite others</p>
        <div className="mt-3 flex gap-3">
          <input
            value={inviteLink}
            readOnly
            className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-[var(--site-panel-muted)] px-4 text-sm font-medium text-foreground"
          >
            <IconCopy className="size-4" />
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {isHost ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onStartRace}
            disabled={players.length < 1}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start race
          </button>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Only you can start the race
          </p>
        </div>
      ) : null}
    </section>
  );
}

import WebSocket from "ws";

import type { Player, RoomState, ServerEvent } from "@repo/shared";

import { getRandomPassage } from "../passages";

const RACE_TIMEOUT_MS = 3 * 60 * 1000;
const PROGRESS_TICK_MS = 100;
const COUNTDOWN_SECONDS = 3;

export class RaceRoom {
  readonly roomId: string;
  state: RoomState = "lobby";
  hostConnId: string;
  passage: string;
  raceCount = 0;
  raceStartedAt = 0;
  createdAt = Date.now();
  lastActivityAt = Date.now();

  private players: Map<string, Player> = new Map();
  private clients: Map<string, WebSocket> = new Map();
  private countdownTimer: NodeJS.Timeout | null = null;
  private progressTimer: NodeJS.Timeout | null = null;
  private raceTimeoutTimer: NodeJS.Timeout | null = null;
  private lastBroadcastedProgress = "";

  constructor(roomId: string, hostConnId: string) {
    this.roomId = roomId;
    this.hostConnId = hostConnId;
    this.passage = getRandomPassage();
  }

  addClient(connId: string, ws: WebSocket, name: string): void {
    const isFirstClient = this.clients.size === 0;

    if (isFirstClient) {
      this.hostConnId = connId;
    }

    const player: Player = {
      connId,
      name,
      progress: 0,
      wpm: 0,
      finishTime: null,
      rank: null,
    };

    this.players.forEach((_, existingConnId) => {
      this.sendTo(existingConnId, {
        type: "player_joined",
        player,
      });
    });

    this.players.set(connId, player);
    this.clients.set(connId, ws);

    this.sendTo(connId, {
      type: "room_state",
      state: this.state,
      passage: this.passage,
      players: Array.from(this.players.values()),
      hostConnId: this.hostConnId,
      raceCount: this.raceCount,
    });

    this.lastActivityAt = Date.now();
  }

  removeClient(connId: string): void {
    const wasHost = this.hostConnId === connId;

    this.players.delete(connId);
    this.clients.delete(connId);
    this.lastActivityAt = Date.now();

    if (this.isEmpty()) {
      this.clearTimers();
      return;
    }

    let hostPromoted = false;

    if (wasHost) {
      const nextHostConnId = this.clients.keys().next().value;

      if (typeof nextHostConnId === "string") {
        this.hostConnId = nextHostConnId;
        hostPromoted = true;
      }
    }

    this.broadcast({
      type: "player_left",
      connId,
    });

    if (
      this.state === "racing" &&
      Array.from(this.players.values()).every((player) => player.finishTime !== null)
    ) {
      this.endRace();
    }

    if (hostPromoted) {
      this.broadcast({
        type: "room_state",
        state: this.state,
        passage: this.passage,
        players: Array.from(this.players.values()),
        hostConnId: this.hostConnId,
        raceCount: this.raceCount,
      });
    }
  }

  startRace(connId: string): void {
    if (connId !== this.hostConnId) {
      return;
    }

    if (this.state !== "lobby" && this.state !== "results") {
      return;
    }

    if (this.state === "results") {
      this.reset();
    }

    this.state = "countdown";
    this.lastActivityAt = Date.now();

    this.broadcast({
      type: "room_state",
      state: this.state,
      passage: this.passage,
      players: Array.from(this.players.values()),
      hostConnId: this.hostConnId,
      raceCount: this.raceCount,
    });

    const tickCountdown = (remaining: number) => {
      this.broadcast({
        type: "countdown_tick",
        remaining,
      });

      if (remaining > 0) {
        this.countdownTimer = setTimeout(() => {
          tickCountdown(remaining - 1);
        }, 1000);
        return;
      }

      this.state = "racing";
      this.passage = getRandomPassage(this.passage);
      this.raceStartedAt = Date.now();
      this.lastBroadcastedProgress = "";

      this.broadcast({
        type: "race_started",
        passage: this.passage,
        startedAt: this.raceStartedAt,
      });

      this.progressTimer = setInterval(() => {
        this.broadcastProgressTick();
      }, PROGRESS_TICK_MS);

      this.raceTimeoutTimer = setTimeout(() => {
        this.endRace();
      }, RACE_TIMEOUT_MS);
    };

    tickCountdown(COUNTDOWN_SECONDS);
  }

  handleKeystroke(connId: string, progress: number, wpm: number): void {
    if (this.state !== "racing") {
      return;
    }

    const player = this.players.get(connId);

    if (!player || player.finishTime !== null) {
      return;
    }

    player.progress = Math.max(0, Math.min(100, progress));
    player.wpm = Math.max(0, wpm);
    this.lastActivityAt = Date.now();
  }

  handleFinish(connId: string, wpm: number, timeMs: number): void {
    if (this.state !== "racing") {
      return;
    }

    const player = this.players.get(connId);

    if (!player || player.finishTime !== null) {
      return;
    }

    player.finishTime = timeMs;
    player.wpm = Math.max(0, wpm);
    player.progress = 100;
    player.rank = Array.from(this.players.values()).filter(
      (entry) => entry.finishTime !== null,
    ).length;
    this.lastActivityAt = Date.now();

    this.broadcast({
      type: "player_finished",
      connId: player.connId,
      name: player.name,
      wpm: player.wpm,
      rank: player.rank,
      timeMs,
    });

    if (Array.from(this.players.values()).every((entry) => entry.finishTime !== null)) {
      this.endRace();
    }
  }

  private endRace(): void {
    if (this.state === "results") {
      return;
    }

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }

    if (this.raceTimeoutTimer) {
      clearTimeout(this.raceTimeoutTimer);
      this.raceTimeoutTimer = null;
    }

    this.state = "results";
    this.lastActivityAt = Date.now();

    const finishedPlayers = Array.from(this.players.values())
      .filter((player) => player.finishTime !== null)
      .sort((left, right) => (left.finishTime ?? 0) - (right.finishTime ?? 0));
    const dnfPlayers = Array.from(this.players.values())
      .filter((player) => player.finishTime === null)
      .sort((left, right) => right.progress - left.progress);
    const rankings = [...finishedPlayers, ...dnfPlayers].map((player, index) => ({
      rank: index + 1,
      connId: player.connId,
      name: player.name,
      wpm: player.wpm,
      timeMs: player.finishTime,
    }));

    this.broadcast({
      type: "race_results",
      rankings,
    });

    this.broadcast({
      type: "room_state",
      state: this.state,
      passage: this.passage,
      players: Array.from(this.players.values()),
      hostConnId: this.hostConnId,
      raceCount: this.raceCount,
    });
  }

  private reset(): void {
    this.raceCount += 1;
    this.passage = getRandomPassage(this.passage);
    this.state = "lobby";
    this.raceStartedAt = 0;
    this.lastBroadcastedProgress = "";

    this.players.forEach((player) => {
      player.progress = 0;
      player.wpm = 0;
      player.finishTime = null;
      player.rank = null;
    });

    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }

    if (this.raceTimeoutTimer) {
      clearTimeout(this.raceTimeoutTimer);
      this.raceTimeoutTimer = null;
    }
  }

  private broadcastProgressTick(): void {
    const players = Array.from(this.players.values()).map((player) => ({
      connId: player.connId,
      progress: player.progress,
      wpm: player.wpm,
    }));
    const serializedSnapshot = JSON.stringify(players);

    if (serializedSnapshot === this.lastBroadcastedProgress) {
      return;
    }

    this.lastBroadcastedProgress = serializedSnapshot;

    this.broadcast({
      type: "progress_update",
      players,
    });
  }

  broadcast(event: ServerEvent): void {
    const payload = JSON.stringify(event);

    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  sendTo(connId: string, event: ServerEvent): void {
    const ws = this.clients.get(connId);

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify(event));
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  isEmpty(): boolean {
    return this.clients.size === 0;
  }
}

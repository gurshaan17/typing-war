export type RoomState = "lobby" | "countdown" | "racing" | "results";

export interface Player {
  connId: string;
  name: string;
  progress: number;
  wpm: number;
  finishTime: number | null;
  rank: number | null;
}

export type ServerEvent =
  | {
      type: "room_state";
      state: RoomState;
      passage: string;
      players: Player[];
      hostConnId: string;
      raceCount: number;
    }
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; connId: string }
  | { type: "countdown_tick"; remaining: number }
  | { type: "race_started"; passage: string; startedAt: number }
  | {
      type: "progress_update";
      players: Pick<Player, "connId" | "progress" | "wpm">[];
    }
  | {
      type: "player_finished";
      connId: string;
      name: string;
      wpm: number;
      rank: number;
      timeMs: number;
    }
  | {
      type: "race_results";
      rankings: {
        rank: number;
        connId: string;
        name: string;
        wpm: number;
        timeMs: number | null;
      }[];
    }
  | { type: "error"; message: string };

export type ClientEvent =
  | { type: "join"; name: string }
  | { type: "start_race" }
  | { type: "keystroke"; progress: number; wpm: number }
  | { type: "finish"; wpm: number; timeMs: number };

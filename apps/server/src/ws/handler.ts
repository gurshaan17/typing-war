import type { FastifyRequest } from "fastify";
import WebSocket from "ws";

import type { ClientEvent, ServerEvent } from "@repo/shared";

import { roomManager } from "../rooms/RoomManager";
import { generateConnId } from "../utils";

export function wsHandler(ws: WebSocket, req: FastifyRequest): void {
  const { roomId } = req.params as { roomId: string };
  const room = roomManager.getRoom(roomId);

  if (!room) {
    const payload: ServerEvent = {
      type: "error",
      message: "Room not found",
    };
    ws.send(JSON.stringify(payload));
    ws.close();
    return;
  }

  const connId = generateConnId();
  let didCleanup = false;

  const cleanup = () => {
    if (didCleanup) {
      return;
    }

    didCleanup = true;
    room.removeClient(connId);
    roomManager.pruneEmptyRooms();
  };

  ws.on("message", (rawMessage) => {
    let event: ClientEvent | null = null;

    try {
      event = JSON.parse(rawMessage.toString()) as ClientEvent;
    } catch {
      return;
    }

    switch (event.type) {
      case "join":
        room.addClient(connId, ws, event.name);
        break;
      case "update_config":
        room.updateConfig(connId, event.config);
        break;
      case "start_race":
        room.startRace(connId);
        break;
      case "keystroke":
        room.handleKeystroke(connId, event.progress, event.wpm);
        break;
      case "finish":
        room.handleFinish(connId, event.wpm, event.timeMs);
        break;
      default:
        break;
    }
  });

  ws.on("close", cleanup);
  ws.on("error", (error) => {
    console.error(error);
    cleanup();
  });
}

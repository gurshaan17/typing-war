import type { FastifyPluginAsync } from "fastify";

import { roomManager } from "../rooms/RoomManager";
import { generateConnId } from "../utils";

export const httpRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/rooms", async (_, reply) => {
    const tempHostConnId = generateConnId();
    const room = roomManager.createRoom(tempHostConnId);

    return reply.code(201).send({
      roomId: room.roomId,
    });
  });

  fastify.get("/api/rooms/:roomId", async (request, reply) => {
    const { roomId } = request.params as { roomId: string };
    const room = roomManager.getRoom(roomId);

    if (!room) {
      return reply.code(404).send({
        error: "Room not found",
      });
    }

    return {
      roomId: room.roomId,
      state: room.state,
      playerCount: room.getPlayerCount(),
    };
  });
};

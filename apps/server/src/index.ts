import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";

import { httpRoutes } from "./http/routes";
import { wsHandler } from "./ws/handler";

const server = Fastify();
const port = Number(process.env.PORT ?? 3001);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

async function start() {
  await server.register(cors, {
    origin: clientOrigins,
  });

  await server.register(websocket);
  await server.register(httpRoutes);

  server.get("/race/:roomId", { websocket: true }, (socket, request) => {
    wsHandler(socket.socket, request);
  });

  await server.listen({
    port,
    host: "0.0.0.0",
  });
}

void start().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { RaceRoom } from "./RaceRoom";
import { generateRoomId } from "../utils";

export class RoomManager {
  private rooms: Map<string, RaceRoom> = new Map();

  createRoom(hostConnId: string): RaceRoom {
    const roomId = generateRoomId(new Set(this.rooms.keys()));
    const room = new RaceRoom(roomId, hostConnId);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): RaceRoom | undefined {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  pruneEmptyRooms(): void {
    this.rooms.forEach((room, roomId) => {
      if (room.isEmpty()) {
        this.rooms.delete(roomId);
      }
    });
  }
}

export const roomManager = new RoomManager();

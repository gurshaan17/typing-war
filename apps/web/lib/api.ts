const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

export async function createRoom(): Promise<string> {
  const response = await fetch(`${SERVER_URL}/api/rooms`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const data = (await response.json()) as { roomId: string };
  return data.roomId;
}

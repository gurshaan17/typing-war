const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

export function getPreferredServerUrl(): string {
  return SERVER_URL;
}

export function getPreferredWsUrl(): string {
  return WS_URL;
}

export async function createRoom(): Promise<string> {
  const response = await fetch(`${getPreferredServerUrl()}/api/rooms`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const data = (await response.json()) as { roomId: string };
  return data.roomId;
}

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001";

function uniqueUrls(urls: string[]) {
  return [...new Set(urls.filter(Boolean))];
}

export function getPreferredServerUrl(): string {
  if (typeof window === "undefined") {
    return SERVER_URL;
  }

  const hostname = window.location.hostname;

  return uniqueUrls([
    `http://${hostname}:3001`,
    SERVER_URL,
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ])[0];
}

export function getPreferredWsUrl(): string {
  if (typeof window === "undefined") {
    return WS_URL;
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  return uniqueUrls([
    `${protocol}://${hostname}:3001`,
    WS_URL,
    "ws://localhost:3001",
    "ws://127.0.0.1:3001",
  ])[0];
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

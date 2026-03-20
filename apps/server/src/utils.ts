const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomId(length: number): string {
  let value = "";

  for (let index = 0; index < length; index += 1) {
    const nextCharIndex = Math.floor(Math.random() * ALPHABET.length);
    value += ALPHABET[nextCharIndex];
  }

  return value;
}

export function generateRoomId(existingIds: Set<string>): string {
  let roomId = randomId(6);

  while (existingIds.has(roomId)) {
    roomId = randomId(6);
  }

  return roomId;
}

export function generateConnId(): string {
  return randomId(12);
}

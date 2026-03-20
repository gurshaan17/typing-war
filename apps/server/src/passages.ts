export const passages = [
  "Typing races feel most satisfying when the text has a steady rhythm and enough variety to reward focus. A short burst of concentration can turn a simple practice run into a clean, competitive sprint. When every line is readable, players settle in faster and trust their pace.",
  "A smooth typing session depends on more than raw speed. Clear feedback, stable timing, and a readable passage help every keystroke feel intentional. When the interface stays quiet and responsive, the player can focus on cadence instead of fighting the screen.",
  "Multiplayer typing works best when each room feels alive without becoming noisy. Players should see who joined, who is leading, and when the race is about to begin. That light touch of presence makes the countdown more exciting and the finish line more meaningful.",
  "Good passages are long enough to reveal consistency but short enough to keep momentum high. They should contain natural punctuation, a few longer words, and clean sentence structure. That balance helps racers show accuracy, recovery, and control under pressure.",
  "A race room should recover gracefully when someone leaves, reconnects, or finishes early. The host role needs to stay obvious, the current state needs to be shared clearly, and results should arrive without delay. Reliability matters just as much as speed in a live match.",
  "Practice builds confidence when the experience stays predictable from start to finish. The countdown should feel crisp, progress updates should stay lightweight, and the final ranking should reflect what happened in real time. Small details make the whole session feel polished.",
  "Typing under a timer changes how people read. They stop scanning for meaning and start searching for rhythm, spacing, and punctuation patterns. A well chosen passage gives enough texture to stay interesting while remaining fair for everyone in the room.",
  "Fast interfaces create trust because they respond exactly when the user expects them to. There is no mystery around whether a keypress landed, whether a room exists, or whether the race has started. That sense of certainty keeps the competition focused and fun.",
  "A good results screen tells a quick story about the race. It shows who finished first, who stayed accurate, and who nearly caught up at the end. Even simple numbers feel engaging when they are tied to a race that unfolded clearly from countdown to finish.",
  "Lightweight room management can go a long way in a realtime game. Clean identifiers, predictable cleanup, and simple event contracts make the system easier to reason about. When the protocol is straightforward, both the client and server stay easier to debug."
];

const commonWords = [
  "the", "focus", "track", "race", "quick", "signal", "steady", "launch",
  "typing", "speed", "drift", "clean", "final", "score", "corner", "boost",
  "exact", "rhythm", "sprint", "quiet", "smart", "react", "press", "input",
  "crowd", "meter", "glide", "flash", "start", "finish", "frame", "light",
  "storm", "calm", "pixel", "circuit", "leader", "smooth", "timing", "shift",
  "align", "pace", "focuses", "brisk", "motion", "signal", "engine", "pulse",
  "screen", "streak", "center", "anchor", "rapid", "energy", "vector", "gold",
  "mint", "rally", "sail", "amber", "spark", "future", "driven", "fleet",
];

export function getRandomPassage(previousPassage?: string): string {
  if (passages.length === 0) {
    return "";
  }

  if (passages.length === 1) {
    return passages[0];
  }

  let nextPassage = passages[Math.floor(Math.random() * passages.length)];

  while (nextPassage === previousPassage) {
    nextPassage = passages[Math.floor(Math.random() * passages.length)];
  }

  return nextPassage;
}

export function getRandomWordsPassage(count: number, previousPassage?: string): string {
  if (count <= 0) {
    return "";
  }

  let nextPassage = "";

  while (!nextPassage || nextPassage === previousPassage) {
    nextPassage = Array.from({ length: count }, () => {
      const index = Math.floor(Math.random() * commonWords.length);
      return commonWords[index];
    }).join(" ");
  }

  return nextPassage;
}

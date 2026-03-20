"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CountdownOverlay } from "@/components/race/CountdownOverlay";
import { NameModal } from "@/components/race/NameModal";
import { PitLaneLeaderboard } from "@/components/race/PitLaneLeaderboard";
import { RaceLobby } from "@/components/race/RaceLobby";
import { RaceResultsPanel } from "@/components/race/RaceResultsPanel";
import { TypingSurface } from "@/components/landing-page/typing-surface";
import {
  ThemePickerFab,
  ThemePickerModal,
} from "@/components/landing-page/theme-picker-modal";
import { useSiteTheme } from "@/components/theme-provider";
import { useRaceRoom } from "@/hooks/useRaceRoom";
import { siteThemes } from "@/lib/site-theme";

export default function RacePage() {
  const params = useParams<{ roomId: string }>();
  const roomId = useMemo(
    () => (Array.isArray(params.roomId) ? params.roomId[0] : params.roomId),
    [params.roomId],
  );
  const {
    theme,
    setTheme,
    previewTheme,
    clearPreviewTheme,
  } = useSiteTheme();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [themeQuery, setThemeQuery] = useState("");
  const {
    connectionError,
    hasJoined,
    join,
    roomState,
    players,
    myConnId,
    hostConnId,
    isHost,
    startRace,
    countdown,
    passage,
    typedText,
    elapsedSeconds,
    isFinished,
    metrics,
    caretStyle,
    textareaRef,
    textSurfaceRef,
    characterRefs,
    getCharacterState,
    handleTypingChange,
    focusTypingArea,
    isTypingFocused,
    handleFocusChange,
    handleRestart,
    wpmHistory,
    resultMetrics,
    chartData,
    raceCount,
  } = useRaceRoom(roomId);

  useEffect(() => {
    if (!isThemeModalOpen) {
      clearPreviewTheme();
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsThemeModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearPreviewTheme();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [clearPreviewTheme, isThemeModalOpen]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--site-hero-from),transparent_28%),linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <header className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← back
          </Link>
          <p className="text-sm text-muted-foreground">Race · {roomId}</p>
        </header>

        <section className="relative flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-6xl">
            {connectionError ? (
              <div className="mx-auto max-w-md rounded-xl border border-border bg-background p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Unable to join race
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">{connectionError}</p>
                <Link
                  href="/"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                >
                  Go home
                </Link>
              </div>
            ) : null}

            {!connectionError && (roomState === "lobby" || roomState === "countdown") ? (
              <div className={roomState === "countdown" ? "pointer-events-none opacity-40" : ""}>
                <RaceLobby
                  players={players}
                  myConnId={myConnId}
                  hostConnId={hostConnId}
                  isHost={isHost}
                  roomId={roomId}
                  onStartRace={startRace}
                />
              </div>
            ) : null}

            {!connectionError && roomState === "racing" ? (
              <>
                <TypingSurface
                  mode="words"
                  timeLimit={30}
                  wordLimit={25}
                  elapsedSeconds={elapsedSeconds}
                  timePresets={[15, 30, 45, 60]}
                  wordPresets={[10, 25, 50, 100]}
                  metrics={metrics}
                  snippet={passage}
                  typedText={typedText}
                  caretStyle={caretStyle}
                  isTypingFocused={isTypingFocused}
                  isLocked={isFinished}
                  textareaRef={textareaRef}
                  textSurfaceRef={textSurfaceRef}
                  characterRefs={characterRefs}
                  getCharacterState={getCharacterState}
                  onTypingChange={handleTypingChange}
                  onFocusChange={handleFocusChange}
                  onFocusTypingArea={focusTypingArea}
                  onRestart={handleRestart}
                  onModeChange={() => undefined}
                  onTimeLimitChange={() => undefined}
                  onWordLimitChange={() => undefined}
                  customTextDraft=""
                  customTextReady={false}
                  onCustomTextDraftChange={() => undefined}
                  onApplyCustomText={() => undefined}
                />
                <PitLaneLeaderboard
                  players={players}
                  myConnId={myConnId}
                  wpmHistory={wpmHistory}
                />
              </>
            ) : null}

            {!connectionError && roomState === "results" ? (
              <RaceResultsPanel
                players={players}
                myConnId={myConnId}
                isHost={isHost}
                isFinished={isFinished}
                metrics={metrics}
                resultMetrics={resultMetrics}
                chartData={chartData}
                elapsedSeconds={elapsedSeconds}
                onStartRace={startRace}
              />
            ) : null}
          </div>

          {!hasJoined && !connectionError ? <NameModal onJoin={join} /> : null}
          {roomState === "countdown" ? <CountdownOverlay countdown={countdown} /> : null}
        </section>
      </div>

      <ThemePickerFab
        themeLabel={siteThemes[theme].label}
        onClick={() => setIsThemeModalOpen(true)}
      />
      <ThemePickerModal
        isOpen={isThemeModalOpen}
        theme={theme}
        themeQuery={themeQuery}
        onThemeQueryChange={setThemeQuery}
        onClose={() => {
          setIsThemeModalOpen(false);
          setThemeQuery("");
          clearPreviewTheme();
        }}
        onSelectTheme={setTheme}
        onPreviewTheme={previewTheme}
        onClearPreview={clearPreviewTheme}
      />

      <div className="sr-only">Race count {raceCount}</div>
    </main>
  );
}

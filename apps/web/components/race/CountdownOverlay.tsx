"use client";

type CountdownOverlayProps = {
  countdown: number | null;
};

export function CountdownOverlay({ countdown }: CountdownOverlayProps) {
  if (countdown === null) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="text-center">
        <div
          key={countdown}
          className="animate-in zoom-in-75 text-7xl font-semibold tracking-[-0.08em] text-foreground duration-300"
        >
          {countdown === 0 ? (
            <span className="text-green-400">Go!</span>
          ) : (
            countdown
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Get ready to type...</p>
      </div>
    </div>
  );
}

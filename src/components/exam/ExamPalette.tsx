"use client";

export type PaletteStatus =
  | "not-visited"
  | "not-answered"
  | "answered"
  | "review"
  | "answered-review";

const STYLES: Record<PaletteStatus, string> = {
  "not-visited": "rounded-md border-rule bg-white text-ink-soft",
  "not-answered": "rounded-md border-exam-red bg-exam-red text-white [clip-path:polygon(0_0,100%_0,100%_72%,50%_100%,0_72%)]",
  answered: "rounded-md border-exam-green bg-exam-green text-white [clip-path:polygon(0_28%,50%_0,100%_28%,100%_100%,0_100%)]",
  review: "rounded-full border-exam-violet bg-exam-violet text-white",
  "answered-review": "rounded-full border-exam-violet bg-exam-violet text-white",
};

const LABELS: Record<PaletteStatus, string> = {
  "not-visited": "Not visited",
  "not-answered": "Not answered",
  answered: "Answered",
  review: "Marked for review",
  "answered-review": "Answered & marked",
};

/** Shape + colour coded question grid, as used in computer-based exams. */
export function ExamPalette({
  statuses,
  current,
  onSelect,
}: {
  statuses: PaletteStatus[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const counts = statuses.reduce(
    (acc, status) => ({ ...acc, [status]: (acc[status] ?? 0) + 1 }),
    {} as Partial<Record<PaletteStatus, number>>,
  );

  return (
    <div>
      <div className="grid grid-cols-5 gap-2.5">
        {statuses.map((status, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Question ${index + 1}: ${LABELS[status]}${index === current ? " (current)" : ""}`}
            aria-current={index === current ? "step" : undefined}
            className={`relative flex h-10 items-center justify-center border text-sm font-semibold tabular-nums transition-transform hover:-translate-y-0.5 ${STYLES[status]} ${
              index === current ? "outline outline-2 outline-offset-2 outline-ink" : ""
            }`}
          >
            {index + 1}
            {status === "answered-review" && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-exam-green" />
            )}
          </button>
        ))}
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-2.5 text-xs text-ink-soft">
        {(Object.keys(LABELS) as PaletteStatus[]).map((status) => (
          <li key={status} className="flex items-center gap-3">
            <span
              className={`relative flex h-6 w-7 shrink-0 items-center justify-center border text-[10px] font-semibold ${STYLES[status]}`}
            >
              {counts[status] ?? 0}
              {status === "answered-review" && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-exam-green" />
              )}
            </span>
            {LABELS[status]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Exam-bar countdown: calm → amber under 5 min → pulsing red under 1 min. */
export function ExamClock({
  secondsLeft,
  totalSeconds,
}: {
  secondsLeft: number;
  totalSeconds: number;
}) {
  const critical = secondsLeft <= 60;
  const warning = secondsLeft <= 300;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;

  return (
    <div
      role="timer"
      aria-label={`Time left ${formatClock(secondsLeft)}`}
      className={`flex items-center gap-3 rounded-md border px-3 py-1.5 ${
        critical
          ? "border-exam-red/70 bg-exam-red/20"
          : warning
            ? "border-amber-400/60 bg-amber-400/15"
            : "border-white/15 bg-white/[0.06]"
      }`}
    >
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50 sm:inline">
        Time left
      </span>
      <span
        className={`font-mono text-lg font-semibold tabular-nums ${
          critical ? "ql-timer-critical text-[#ff8a8a]" : warning ? "text-amber-300" : "text-white"
        }`}
      >
        {formatClock(secondsLeft)}
      </span>
      <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-white/15 lg:block">
        <span
          className={`block h-full rounded-full transition-[width] duration-1000 ease-linear ${
            critical ? "bg-[#ff8a8a]" : warning ? "bg-amber-300" : "bg-white"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </span>
    </div>
  );
}

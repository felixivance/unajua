const SIZE = 64;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type CountdownRingProps = {
  secs: number;
  /** 1 at the start of the question, 0 when time is up. */
  fraction: number;
  urgent: boolean;
  maxSecs: number;
};

/** Circular countdown: the ring drains with the clock, the seconds sit in the middle. */
export function CountdownRing({ secs, fraction, urgent, maxSecs }: CountdownRingProps) {
  return (
    <div
      role="progressbar"
      aria-label="Time left"
      aria-valuemin={0}
      aria-valuemax={maxSecs}
      aria-valuenow={secs}
      aria-valuetext={`${secs} seconds left`}
      className="relative h-16 w-16 shrink-0 rounded-full bg-white shadow-[0_4px_14px_rgba(28,25,23,0.15)]"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-stone-200"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={`game-ring ${urgent ? 'stroke-red-600' : 'stroke-emerald-700'}`}
        />
      </svg>
      {/* key restarts the pop each second, but only in the urgent zone */}
      <span
        key={urgent ? secs : 'calm'}
        aria-hidden
        className={`absolute inset-0 grid place-items-center text-xl font-extrabold tabular-nums ${
          urgent ? 'game-tick text-red-600' : 'text-stone-800'
        }`}
      >
        {secs}
      </span>
    </div>
  );
}

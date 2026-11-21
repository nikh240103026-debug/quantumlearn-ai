"use client";

import { useEffect, useRef, useState } from "react";

interface AssessmentTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

export default function AssessmentTimer({
  initialTime,
  onTimeUp,
}: AssessmentTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // Keep the latest callback without restarting the countdown when the
  // parent re-renders with a new function.
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Count down to a fixed end time so re-renders and throttled
    // background tabs can't stretch the timer.
    const endsAt = Date.now() + initialTime * 1000;
    let fired = false;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((endsAt - Date.now()) / 1000),
      );

      setTimeLeft(remaining);

      if (remaining === 0 && !fired) {
        fired = true;
        clearInterval(timer);
        onTimeUpRef.current();
      }
    };

    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [initialTime]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">
        Time Remaining
      </p>

      <h2 className="mt-2 text-3xl font-bold text-red-600">
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </h2>
    </div>
  );
}

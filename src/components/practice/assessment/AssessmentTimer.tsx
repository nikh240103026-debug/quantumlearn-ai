"use client";

import { useEffect, useState } from "react";

interface AssessmentTimerProps {
  initialTime: number; // in seconds
  onTimeUp: () => void;
}

export default function AssessmentTimer({
  initialTime,
  onTimeUp,
}: AssessmentTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

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
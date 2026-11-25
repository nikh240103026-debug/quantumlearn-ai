"use client";

import { useCallback, useEffect, useState } from "react";

export async function callApi<T = unknown>(url: string, method = "GET", body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      cache: "no-store",
      ...(body !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new Error("Unable to reach the server. Check your connection.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}

/** Loads `url`, and runs changes that reload it afterwards. */
export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    callApi<T>(url)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: Error) => {
        if (active) setProblem(error.message);
      });
    return () => {
      active = false;
    };
  }, [url, version]);

  const change = useCallback(async (target: string, method: string, body?: unknown): Promise<boolean> => {
    setBusy(true);
    setProblem("");
    try {
      await callApi(target, method, body);
      setVersion((value) => value + 1);
      return true;
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Something went wrong.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { data, problem, busy, change };
}

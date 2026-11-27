"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube-player";

/** The intro video is hosted on YouTube; only the player is embedded here. */
const VIDEO_ID = "Bbp1vQPmphM";
const VIDEO_TITLE = "QuantumLearn AI platform tour";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const POSTER_URL = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

/**
 * A plain autoplaying embed, part of the server-rendered page. Playback does
 * not depend on our scripts; the API below only adds the themed controls.
 */
const EMBED_URL = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${new URLSearchParams({
  autoplay: "1",
  mute: "1",
  controls: "0",
  loop: "1",
  playlist: VIDEO_ID,
  playsinline: "1",
  rel: "0",
  fs: "0",
  disablekb: "1",
  iv_load_policy: "3",
  cc_load_policy: "0",
  enablejsapi: "1",
})}`;
/** Kept as raw HTML because the YouTube API takes ownership of the iframe. */
const IFRAME_HTML = {
  __html: `<iframe src="${EMBED_URL.replace(/&/g, "&amp;")}" title="${VIDEO_TITLE}" tabindex="-1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe>`,
};
const RETRY_MS = 1500;
const MAX_RETRIES = 6;

const IDLE_HIDE_MS = 2600;
/** Act just before the end so YouTube's suggested-videos screen never shows. */
const END_GUARD_SECONDS = 2;

const STATE_ENDED = 0;
const STATE_PLAYING = 1;
const STATE_PAUSED = 2;
const STATE_BUFFERING = 3;

function formatTime(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function HeroVideo() {
  const frameRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  /** "boot" fades by itself (CSS), so the poster can never hide a playing video. */
  const [poster, setPoster] = useState<"boot" | "shown" | "hidden">("boot");
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let player: YTPlayer | null = null;
    let started = false;
    let retries = 0;
    let retryTimer: number | undefined;

    // The video has its own burned-in subtitles; YouTube turns captions on for
    // muted autoplay, which would show the text twice.
    const hideCaptions = () => {
      if (!cancelled) player?.unloadModule?.("captions");
    };

    const syncState = (data: number) => {
      if (cancelled || !player) return;
      setPlaying(data === STATE_PLAYING || data === STATE_BUFFERING);
      if (data === STATE_PLAYING) {
        started = true;
        hideCaptions();
        window.clearTimeout(retryTimer);
        setPoster("hidden");
        setDuration(player.getDuration());
      } else if (data === STATE_PAUSED || data === STATE_ENDED) {
        // Paused players show YouTube's title and suggestions.
        setPoster("shown");
      }
      if (data === STATE_ENDED) {
        player.seekTo(0, true);
        setTime(0);
        player.playVideo();
      }
    };

    const start = () => {
      if (cancelled || started || !player) return;
      // The embed autoplays, so it may be running before we connected.
      const state = player.getPlayerState();
      syncState(state);
      if (state === STATE_PLAYING) return;
      player.mute();
      player.playVideo();
      if (retries++ < MAX_RETRIES) retryTimer = window.setTimeout(start, RETRY_MS);
    };
    // Browsers that block autoplay allow it after the first interaction.
    const onGesture = () => {
      if (!started && playerRef.current) start();
    };
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    gestures.forEach((name) => window.addEventListener(name, onGesture, { passive: true }));


    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        if (!mount.querySelector("iframe")) mount.innerHTML = IFRAME_HTML.__html;
        const iframe = mount.querySelector("iframe");
        if (!iframe) return;

        player = new YT.Player(iframe, {
          events: {
            onReady: () => {
              if (cancelled || !player) return;
              playerRef.current = player;
              setDuration(player.getDuration());
              setReady(true);
              start();

            },
            onApiChange: hideCaptions,
            onStateChange: ({ data }) => syncState(data),
            onError: () => {
              if (!cancelled) setFailed(true);
            },
          },
        });
      })
      .catch((error) => {
        // The embed still plays; only our custom controls are unavailable.
        console.warn(error);
      });

    return () => {
      cancelled = true;
      playerRef.current = null;
      window.clearTimeout(retryTimer);
      gestures.forEach((name) => window.removeEventListener(name, onGesture));
    };
  }, []);

  // Progress, plus the end-of-video loop.
  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const total = player.getDuration();
      setDuration(total);
      const now = player.getCurrentTime();

      if (total > 0 && now >= total - END_GUARD_SECONDS) {
        player.seekTo(0, true);
        setTime(0);
        return;
      }

      setTime(now);
      setBuffered(player.getVideoLoadedFraction());
    }, 200);

    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  const wake = useCallback(() => {
    setActive(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setActive(false), IDLE_HIDE_MS);
  }, []);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  };

  const toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.unMute();
      if (volume === 0) {
        player.setVolume(60);
        setVolume(60);
      }
    } else {
      player.mute();
    }
    setMuted(!muted);
  };

  const changeVolume = (next: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.setVolume(next);
    if (next === 0) player.mute();
    else player.unMute();
    setVolume(next);
    setMuted(next === 0);
  };

  const seek = (next: number) => {
    playerRef.current?.seekTo(next, true);
    setTime(next);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.().catch(() => {});
  };

  const played = duration ? (time / duration) * 100 : 0;
  const loaded = Math.max(played, buffered * 100);
  const shownVolume = muted ? 0 : volume;
  const iconButton =
    "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white";

  return (
    <div
      ref={frameRef}
      role="region"
      aria-label={VIDEO_TITLE}
      data-active={active}
      className={`ql-hero-video group relative isolate aspect-video w-full overflow-hidden bg-black shadow-[0_30px_120px_-20px_rgba(59,130,246,0.45)] ${
        fullscreen ? "" : "rounded-2xl sm:rounded-3xl"
      }`}
      onPointerMove={(event) => {
        if (event.pointerType === "mouse") wake();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        window.clearTimeout(idleTimer.current);
        setActive(false);
      }}
      onKeyDown={wake}
    >
      <div
        ref={mountRef}
        dangerouslySetInnerHTML={IFRAME_HTML}
        className="absolute inset-0 [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
      />

      {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube poster, already sized */}
      <img
        src={POSTER_URL}
        alt=""
        width={1280}
        height={720}
        fetchPriority="high"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          poster === "boot" && !failed
            ? "ql-poster-boot"
            : poster === "shown" || failed
              ? "opacity-100"
              : "opacity-0"
        }`}
      />

      {failed ? (
        <a
          href={WATCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${VIDEO_TITLE} on YouTube`}
          className="absolute inset-0 grid place-items-center bg-black/30"
        >
          <PlayBadge />
        </a>
      ) : (
        <>
          {/* Click surface: reveals controls and resumes; only the pause button pauses */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            disabled={!ready}
            onClick={() => {
              if (!playing) togglePlay();
              wake();
            }}
            className={`absolute inset-0 grid h-full w-full place-items-center ${
              ready ? "cursor-pointer" : "pointer-events-none"
            }`}
          >
            {ready && !playing && <PlayBadge />}
          </button>

          <div
            onPointerDown={wake}
            className={`ql-hero-video-bar absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-2 pt-12 sm:px-5 sm:pb-3 ${
              ready ? "" : "hidden"
            }`}
          >
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(time, duration || 1)}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Seek"
              aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
              className="ql-video-range w-full"
              style={
                {
                  "--ql-played": `${played}%`,
                  "--ql-loaded": `${loaded}%`,
                } as React.CSSProperties
              }
            />

            <div className="mt-0.5 flex items-center gap-1">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className={iconButton}
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play size={17} fill="currentColor" strokeWidth={0} />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                className={iconButton}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={shownVolume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                aria-label="Volume"
                className="ql-video-range hidden w-20 sm:block"
                style={
                  {
                    "--ql-played": `${shownVolume}%`,
                    "--ql-loaded": `${shownVolume}%`,
                  } as React.CSSProperties
                }
              />

              <span className="ml-2 font-mono text-[11px] tabular-nums text-white/75">
                {formatTime(time)} / {formatTime(duration)}
              </span>

              <a
                href={WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto rounded-full px-3 py-2 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/15 hover:text-white"
              >
                YouTube
              </a>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
                className={iconButton}
              >
                {fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_8px_40px_-4px_rgba(99,102,241,0.9)] transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
      <Play size={26} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
    </span>
  );
}

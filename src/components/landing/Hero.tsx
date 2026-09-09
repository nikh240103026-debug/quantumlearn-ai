"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  FlaskConical,
  Play,
  Sparkles,
} from "lucide-react";

export function Hero() {
  return (
    <section className="hero-section relative w-full overflow-hidden bg-black text-white">
      {/* Background image */}
      <div className="hero-image absolute inset-0">
        <img
          src="/images/quantum-computer.jpg"
          alt="Quantum computer"
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Cinematic overlay */}
      <div className="hero-overlay absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1800px] flex-col justify-between px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex flex-1 items-center">
          <div className="grid w-full grid-cols-1 gap-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-20">
            {/* LEFT SIDE */}
            <div className="hero-left max-w-5xl">
              <div className="mb-8 inline-flex items-center gap-2 border border-white/25 bg-black/20 px-4 py-2 backdrop-blur-md">
                <Sparkles
                  size={14}
                  strokeWidth={1.7}
                  className="text-blue-400"
                />

                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/85">
                  Interactive Quantum Learning
                </span>
              </div>

              <h1 className="max-w-5xl text-[clamp(3.7rem,7.5vw,8.8rem)] font-semibold leading-[0.87] tracking-[-0.065em]">
                Learn quantum
                <br />
                computing by
                <br />
                <span className="text-blue-500">building it.</span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                An interactive AI-powered platform for learning quantum
                computing through concepts, circuits, simulations, coding,
                experimentation, and intelligent guidance.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="hero-right w-full lg:ml-auto lg:max-w-[470px]">
              <div className="border border-white/15 bg-black/35 p-6 backdrop-blur-xl sm:p-8">
                <div className="mb-7">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-400">
                    Start your journey
                  </p>

                  <h2 className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                    Learn. Build. Execute.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Move from quantum fundamentals to real circuits and
                    executable algorithms in one continuous environment.
                  </p>
                </div>

                <Link
                  href="/signup"
                  className="group flex w-full items-center justify-between bg-blue-600 px-5 py-4 text-sm font-medium transition-colors hover:bg-blue-500"
                >
                  <span>Start Learning</span>

                  <ArrowRight
                    size={18}
                    strokeWidth={1.8}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/quantum-lab"
                  className="group mt-3 flex w-full items-center justify-between border border-white/20 bg-white/5 px-5 py-4 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <span>Explore Quantum Lab</span>

                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.8}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Platform workflow
                  </p>

                  <div className="grid grid-cols-3">
                    <div className="border-r border-white/10 pr-3">
                      <BookOpen
                        size={17}
                        strokeWidth={1.5}
                        className="mb-3 text-blue-400"
                      />

                      <p className="text-sm font-medium">Learn</p>

                      <p className="mt-1 text-[11px] leading-5 text-white/45">
                        Concepts
                      </p>
                    </div>

                    <div className="border-r border-white/10 px-3">
                      <FlaskConical
                        size={17}
                        strokeWidth={1.5}
                        className="mb-3 text-blue-400"
                      />

                      <p className="text-sm font-medium">Build</p>

                      <p className="mt-1 text-[11px] leading-5 text-white/45">
                        Circuits
                      </p>
                    </div>

                    <div className="pl-3">
                      <Play
                        size={17}
                        strokeWidth={1.5}
                        className="mb-3 text-blue-400"
                      />

                      <p className="text-sm font-medium">Execute</p>

                      <p className="mt-1 text-[11px] leading-5 text-white/45">
                        Simulations
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SDK strip */}
              <div className="mt-3 grid grid-cols-3 border border-white/10 bg-black/30 backdrop-blur-md">
                <div className="border-r border-white/10 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                    SDK
                  </p>

                  <p className="mt-1 text-xs text-white/75">Qiskit</p>
                </div>

                <div className="border-r border-white/10 px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                    SDK
                  </p>

                  <p className="mt-1 text-xs text-white/75">PennyLane</p>
                </div>

                <div className="px-4 py-3">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                    SDK
                  </p>

                  <p className="mt-1 text-xs text-white/75">Cirq</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom information */}
        <div className="hero-bottom mt-10 grid border-t border-white/15 sm:grid-cols-3">
          <div className="border-b border-white/10 py-5 sm:border-b-0 sm:border-r sm:pr-8">
            <div className="flex items-center gap-3">
              <BookOpen
                size={16}
                strokeWidth={1.5}
                className="text-blue-400"
              />

              <span className="text-sm font-medium">
                Understand the theory
              </span>
            </div>
          </div>

          <div className="border-b border-white/10 py-5 sm:border-b-0 sm:border-r sm:px-8">
            <div className="flex items-center gap-3">
              <Code2
                size={16}
                strokeWidth={1.5}
                className="text-blue-400"
              />

              <span className="text-sm font-medium">
                Write quantum code
              </span>
            </div>
          </div>

          <div className="py-5 sm:pl-8">
            <div className="flex items-center gap-3">
              <FlaskConical
                size={16}
                strokeWidth={1.5}
                className="text-blue-400"
              />

              <span className="text-sm font-medium">
                Experiment and understand results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        .hero-image {
          opacity: 0;
          transform: translateY(-34px) scale(1.035);
          animation: imageEnter 1.4s cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .hero-overlay {
          opacity: 0;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.58) 0%,
              rgba(0, 0, 0, 0.39) 48%,
              rgba(0, 0, 0, 0.32) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.2) 0%,
              rgba(0, 0, 0, 0.34) 100%
            );
          animation: overlayEnter 1.2s ease-out 0.2s forwards;
        }

        .hero-left {
          opacity: 0;
          transform: translateX(-70px);
          animation: leftEnter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.55s
            forwards;
        }

        .hero-right {
          opacity: 0;
          transform: translateX(70px);
          animation: rightEnter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.7s
            forwards;
        }

        .hero-bottom {
          opacity: 0;
          transform: translateY(30px);
          animation: bottomEnter 0.9s cubic-bezier(0.22, 1, 0.36, 1) 1s
            forwards;
        }

        @keyframes imageEnter {
          0% {
            opacity: 0;
            transform: translateY(-34px) scale(1.035);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes overlayEnter {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        @keyframes leftEnter {
          0% {
            opacity: 0;
            transform: translateX(-70px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes rightEnter {
          0% {
            opacity: 0;
            transform: translateX(70px);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bottomEnter {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-image,
          .hero-overlay,
          .hero-left,
          .hero-right,
          .hero-bottom {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Code2,
  Play,
  RotateCcw,
  Trophy,
  Zap,
} from "lucide-react";

type Difficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  points: number;
  topic: string;
  starterCode: string;
  solution: string;
  hint: string;
  expected: string;
}

interface GradeResponse {
  success: boolean;
  passed?: boolean;
  challengeId?: string;
  points?: number;
  maxPoints?: number;
  feedback?: string;
  output?: string;
  error?: string;
  executionTime?: number;
}

const challenges: Challenge[] = [
  {
    id: "create-qubit",
    title: "Create a Qubit",
    description:
      "Create a quantum circuit containing exactly one qubit and print the circuit.",
    difficulty: "Beginner",
    points: 10,
    topic: "Quantum Circuit",
    starterCode: `from qiskit import QuantumCircuit

# Create a circuit with one qubit
qc = QuantumCircuit(___)

print(qc)`,
    solution: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

print(qc)`,
    hint:
      "QuantumCircuit(1) creates a circuit with one qubit.",
    expected:
      "Circuit created with exactly 1 qubit.",
  },

  {
    id: "apply-x",
    title: "Apply a Pauli-X Gate",
    description:
      "Create one qubit and apply an X gate to change its computational basis state.",
    difficulty: "Beginner",
    points: 15,
    topic: "Quantum Gates",
    starterCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

# Apply an X gate to qubit 0
qc.___(0)

print(qc)`,
    solution: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.x(0)

print(qc)`,
    hint:
      "The Qiskit method for the Pauli-X gate is x().",
    expected:
      "Pauli-X gate applied to qubit 0.",
  },

  {
    id: "superposition",
    title: "Create Superposition",
    description:
      "Use a Hadamard gate to place qubit 0 into an equal superposition.",
    difficulty: "Beginner",
    points: 20,
    topic: "Superposition",
    starterCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

# Apply a Hadamard gate
qc.___(0)

print(qc)`,
    solution: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)

qc.h(0)

print(qc)`,
    hint:
      "The Hadamard gate is represented by h() in Qiskit.",
    expected:
      "Hadamard gate applied to qubit 0.",
  },

  {
    id: "bell-state",
    title: "Build a Bell State",
    description:
      "Create two qubits, apply H to qubit 0, then entangle the qubits using CNOT.",
    difficulty: "Intermediate",
    points: 30,
    topic: "Entanglement",
    starterCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

# Create superposition
qc.h(0)

# Entangle q0 and q1
qc.___(0, 1)

print(qc)`,
    solution: `from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

print(qc)`,
    hint:
      "CNOT is represented by cx(control, target).",
    expected:
      "Bell-state circuit created successfully.",
  },

  {
    id: "measurement",
    title: "Measure a Qubit",
    description:
      "Create one qubit and one classical bit, apply H, and measure the qubit.",
    difficulty: "Intermediate",
    points: 35,
    topic: "Measurement",
    starterCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)

qc.h(0)

# Measure q0 into classical bit 0
qc.___(0, 0)

print(qc)`,
    solution: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)

qc.h(0)
qc.measure(0, 0)

print(qc)`,
    hint:
      "Qiskit's measurement method is measure(qubit, classical_bit).",
    expected:
      "Measurement operation added successfully.",
  },
];

const difficultyStyle: Record<
  Difficulty,
  string
> = {
  Beginner:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Intermediate:
    "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Advanced:
    "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function CodingChallenges() {
  const [
    selectedId,
    setSelectedId,
  ] = useState(
    challenges[0].id,
  );

  const [
    code,
    setCode,
  ] = useState(
    challenges[0].starterCode,
  );

  const [
    completed,
    setCompleted,
  ] = useState<string[]>(
    [],
  );

  const [
    output,
    setOutput,
  ] = useState(
    "Run your solution to check the challenge.",
  );

  const [
    showHint,
    setShowHint,
  ] = useState(false);

  const [
    filter,
    setFilter,
  ] = useState<
    "All" | Difficulty
  >("All");

  const [
    checking,
    setChecking,
  ] = useState(false);

  const [
    scoreMap,
    setScoreMap,
  ] = useState<
    Record<string, number>
  >({});

  const [
    loadingProgress,
    setLoadingProgress,
  ] = useState(true);

  const selected =
    useMemo(
      () =>
        challenges.find(
          (
            challenge,
          ) =>
            challenge.id ===
            selectedId,
        )!,
      [selectedId],
    );

  const filteredChallenges =
    useMemo(
      () =>
        filter === "All"
          ? challenges
          : challenges.filter(
              (challenge) =>
                challenge.difficulty ===
                filter,
            ),
      [filter],
    );

  const totalPoints =
    challenges.reduce(
      (
        total,
        challenge,
      ) =>
        total +
        (scoreMap[
          challenge.id
        ] ?? 0),
      0,
    );

  useEffect(() => {
    async function loadProgress() {
      try {
        const response =
          await fetch(
            "/api/activity?limit=100",
            {
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const activities =
          Array.isArray(
            data.activities,
          )
            ? data.activities
            : [];

        const nextCompleted: string[] =
          [];

        const nextScores: Record<
          string,
          number
        > = {};

        for (
          const activity of activities
        ) {
          if (
            activity.activity_type !==
            "coding_challenge_completed"
          ) {
            continue;
          }

          const metadata =
            activity.metadata;

          if (
            !metadata ||
            typeof metadata !==
              "object"
          ) {
            continue;
          }

          const challengeId =
            (
              metadata as Record<
                string,
                unknown
              >
            ).challenge_id;

          const points =
            Number(
              (
                metadata as Record<
                  string,
                  unknown
                >
              ).points ?? 0,
            );

          if (
            typeof challengeId !==
            "string"
          ) {
            continue;
          }

          if (
            !nextCompleted.includes(
              challengeId,
            )
          ) {
            nextCompleted.push(
              challengeId,
            );
          }

          nextScores[
            challengeId
          ] = Math.max(
            nextScores[
              challengeId
            ] ?? 0,
            Number.isFinite(
              points,
            )
              ? points
              : 0,
          );
        }

        setCompleted(
          nextCompleted,
        );

        setScoreMap(
          nextScores,
        );
      } catch (error) {
        console.error(
          "Failed to load coding progress:",
          error,
        );
      } finally {
        setLoadingProgress(
          false,
        );
      }
    }

    void loadProgress();
  }, []);

  function selectChallenge(
    challenge: Challenge,
  ) {
    setSelectedId(
      challenge.id,
    );

    setCode(
      challenge.starterCode,
    );

    setOutput(
      "Run your solution to check the challenge.",
    );

    setShowHint(false);
  }

  function resetCode() {
    setCode(
      selected.starterCode,
    );

    setOutput(
      "Code reset.",
    );

    setShowHint(false);
  }

  async function runChallenge() {
    if (checking) {
      return;
    }

    setChecking(true);

    setOutput(
      "Running automated tests...",
    );

    try {
      const response =
        await fetch(
          "/api/coding/challenges/submit",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              challengeId:
                selected.id,
              code,
            }),
          },
        );

      const data =
        (await response.json()) as GradeResponse;

      if (
        !response.ok &&
        !data.success
      ) {
        throw new Error(
          data.error ??
            "Unable to grade challenge.",
        );
      }

      const passed =
        data.passed ===
        true;

      if (passed) {
        const points =
          data.points ??
          selected.points;

        setOutput(
          `✓ Challenge passed.

${data.feedback ?? selected.expected}

+${points} points

Execution time: ${
            data.executionTime ??
            0
          } ms

Automated grading completed successfully.`,
        );

        setScoreMap(
          (current) => ({
            ...current,
            [selected.id]:
              Math.max(
                current[
                  selected.id
                ] ?? 0,
                points,
              ),
          }),
        );

        setCompleted(
          (current) =>
            current.includes(
              selected.id,
            )
              ? current
              : [
                  ...current,
                  selected.id,
                ],
        );

        return;
      }

      setOutput(
        `✗ Challenge not completed.

${data.feedback ?? "Your solution does not satisfy all challenge requirements."}

${
  data.error
    ? `Error: ${data.error}\n\n`
    : ""
}Execution time: ${
          data.executionTime ??
          0
        } ms

Use the hint and try again.`,
      );
    } catch (error) {
      console.error(
        "Challenge grading error:",
        error,
      );

      setOutput(
        `✗ Unable to grade the challenge.

${
          error instanceof Error
            ? error.message
            : "Unexpected grading error."
        }`,
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-100">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-[#07101d]">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center border border-blue-500/30 bg-blue-500/10 text-blue-400">
              <Trophy size={18} />
            </div>

            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                Coding Challenges
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Practice quantum programming
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden border border-slate-800 bg-[#050b14] px-3 py-2 sm:block">
              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                Score
              </span>

              <span className="ml-2 text-xs font-bold text-blue-400">
                {totalPoints} pts
              </span>
            </div>

            <a
              href="/coding"
              className="inline-flex items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <Code2 size={14} />

              <span className="hidden sm:inline">
                Playground
              </span>
            </a>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px]">

        {/* FILTERS */}

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-[#080f1a] px-4 py-3 sm:px-6 lg:px-8">

          <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Difficulty
          </span>

          {(
            [
              "All",
              "Beginner",
              "Intermediate",
              "Advanced",
            ] as const
          ).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  filter ===
                  item
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                    : "border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-300"
                }`}
              >
                {item}
              </button>
            ),
          )}

        </div>

        <div className="grid min-h-[calc(100vh-8rem)] gap-px bg-slate-800 lg:grid-cols-[310px_minmax(0,1fr)]">

          {/* CHALLENGE LIST */}

          <aside className="bg-[#080f1a]">

            <div className="border-b border-slate-800 px-4 py-4">

              <div className="flex items-center justify-between">

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                  Challenges
                </span>

                <span className="text-[10px] text-slate-700">
                  {loadingProgress
                    ? "..."
                    : `${completed.length}/${challenges.length}`}
                </span>

              </div>

            </div>

            <div className="p-2">

              {filteredChallenges.map(
                (
                  challenge,
                  index,
                ) => {

                  const active =
                    challenge.id ===
                    selectedId;

                  const isCompleted =
                    completed.includes(
                      challenge.id,
                    );

                  return (
                    <button
                      key={
                        challenge.id
                      }
                      type="button"
                      onClick={() =>
                        selectChallenge(
                          challenge,
                        )
                      }
                      className={`mb-1 flex w-full items-start gap-3 border-l-2 p-3 text-left transition ${
                        active
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-transparent hover:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center border ${
                          isCompleted
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : active
                              ? "border-blue-500/30 text-blue-400"
                              : "border-slate-800 text-slate-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={14} />
                        ) : (
                          <span className="text-[10px] font-bold">
                            {index +
                              1}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div
                          className={`text-xs font-semibold ${
                            active
                              ? "text-blue-300"
                              : "text-slate-300"
                          }`}
                        >
                          {
                            challenge.title
                          }
                        </div>

                        <div className="mt-1 flex items-center gap-2">

                          <span
                            className={`border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                              difficultyStyle[
                                challenge
                                  .difficulty
                              ]
                            }`}
                          >
                            {
                              challenge.difficulty
                            }
                          </span>

                          <span className="text-[9px] text-slate-700">
                            {
                              challenge.points
                            }{" "}
                            pts
                          </span>

                        </div>
                      </div>
                    </button>
                  );
                },
              )}

            </div>
          </aside>

          {/* WORKSPACE */}

          <main className="min-w-0 bg-[#050b14]">

            <div className="border-b border-slate-800 px-5 py-5 sm:px-8">

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">

                <span>
                  Challenges
                </span>

                <ChevronRight size={12} />

                <span>
                  {selected.topic}
                </span>

              </div>

              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {selected.title}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {
                      selected.description
                    }
                  </p>

                </div>

                <div
                  className={`border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${
                    difficultyStyle[
                      selected
                        .difficulty
                    ]
                  }`}
                >
                  {
                    selected.difficulty
                  }
                </div>

              </div>
            </div>

            <div className="grid gap-px bg-slate-800 lg:grid-cols-[minmax(0,1fr)_310px]">

              {/* EDITOR */}

              <section className="flex min-h-[650px] flex-col bg-[#03070d]">

                <div className="flex h-12 items-center justify-between border-b border-slate-800 bg-[#080f1a] px-4">

                  <div className="flex items-center gap-2">
                    <Code2
                      size={14}
                      className="text-blue-400"
                    />

                    <span className="text-xs font-semibold text-slate-300">
                      solution.py
                    </span>
                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={
                        resetCode
                      }
                      disabled={
                        checking
                      }
                      className="inline-flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:text-slate-300 disabled:opacity-40"
                    >
                      <RotateCcw
                        size={13}
                      />

                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={
                        runChallenge
                      }
                      disabled={
                        checking
                      }
                      className="inline-flex items-center gap-1.5 bg-blue-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Play
                        size={12}
                        fill="currentColor"
                      />

                      {checking
                        ? "Checking..."
                        : "Check"}
                    </button>

                  </div>
                </div>

                <div className="flex min-h-0 flex-1">

                  <div className="w-10 shrink-0 border-r border-slate-900 bg-[#050a11] py-4 text-right font-mono text-[11px] leading-6 text-slate-700">
                    {code
                      .split(
                        "\n",
                      )
                      .map(
                        (
                          _,
                          index,
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="pr-2"
                          >
                            {
                              index +
                              1
                            }
                          </div>
                        ),
                      )}
                  </div>

                  <textarea
                    value={code}
                    onChange={(
                      event,
                    ) =>
                      setCode(
                        event
                          .target
                          .value,
                      )
                    }
                    spellCheck={
                      false
                    }
                    disabled={
                      checking
                    }
                    className="min-h-[470px] flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-xs leading-6 text-slate-300 outline-none disabled:opacity-60"
                  />

                </div>

                <div className="border-t border-slate-800">

                  <div className="flex h-10 items-center gap-2 border-b border-slate-800 bg-[#080f1a] px-4">

                    <TerminalIcon />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Automated Result
                    </span>

                  </div>

                  <pre
                    className={`min-h-[170px] whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 ${
                      output.startsWith(
                        "✓",
                      )
                        ? "text-emerald-400"
                        : output.startsWith(
                              "✗",
                            )
                          ? "text-red-400"
                          : "text-slate-500"
                    }`}
                  >
                    {output}
                  </pre>

                </div>
              </section>

              {/* INSTRUCTIONS */}

              <aside className="bg-[#07101d]">

                <div className="border-b border-slate-800 px-5 py-4">

                  <div className="flex items-center gap-2">

                    <CircleHelp
                      size={15}
                      className="text-blue-400"
                    />

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Challenge
                    </span>

                  </div>

                </div>

                <div className="p-5">

                  <div className="border border-slate-800 bg-[#050b14] p-4">

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Objective
                    </div>

                    <p className="mt-2 text-xs leading-6 text-slate-400">
                      {
                        selected.description
                      }
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowHint(
                        (
                          value,
                        ) =>
                          !value,
                      )
                    }
                    className="mt-4 flex w-full items-center justify-between border border-slate-800 bg-[#050b14] px-4 py-3 text-left transition hover:border-slate-700"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-400">

                      <Zap
                        size={14}
                        className="text-amber-400"
                      />

                      {showHint
                        ? "Hide Hint"
                        : "Show Hint"}

                    </span>

                    <ChevronRight
                      size={14}
                      className={`text-slate-700 transition ${
                        showHint
                          ? "rotate-90"
                          : ""
                      }`}
                    />

                  </button>

                  {showHint && (
                    <div className="border-x border-b border-slate-800 bg-[#03070d] p-4">
                      <p className="text-xs leading-6 text-slate-500">
                        {
                          selected.hint
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-4 space-y-2">

                    <div className="flex items-center justify-between border-b border-slate-900 py-2">

                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Topic
                      </span>

                      <span className="text-xs text-slate-400">
                        {
                          selected.topic
                        }
                      </span>

                    </div>

                    <div className="flex items-center justify-between border-b border-slate-900 py-2">

                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Points
                      </span>

                      <span className="text-xs font-bold text-blue-400">
                        +
                        {
                          selected.points
                        }
                      </span>

                    </div>

                    <div className="flex items-center justify-between py-2">

                      <span className="text-[10px] uppercase tracking-wider text-slate-600">
                        Status
                      </span>

                      <span
                        className={`text-xs font-semibold ${
                          completed.includes(
                            selected.id,
                          )
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }`}
                      >
                        {completed.includes(
                          selected.id,
                        )
                          ? "Completed"
                          : "Not completed"}
                      </span>

                    </div>

                  </div>

                </div>
              </aside>
            </div>

            {/* NAVIGATION */}

            <div className="flex items-center justify-between border-t border-slate-800 bg-[#07101d] px-5 py-4 sm:px-8">

              <div className="text-[10px] uppercase tracking-wider text-slate-700">
                {
                  completed.length
                }{" "}
                of{" "}
                {
                  challenges.length
                }{" "}
                completed
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentIndex =
                    challenges.findIndex(
                      (
                        challenge,
                      ) =>
                        challenge.id ===
                        selected.id,
                    );

                  const nextChallenge =
                    challenges[
                      currentIndex +
                        1
                    ];

                  if (
                    nextChallenge
                  ) {
                    selectChallenge(
                      nextChallenge,
                    );
                  }
                }}
                disabled={
                  checking ||
                  challenges.findIndex(
                    (
                      challenge,
                    ) =>
                      challenge.id ===
                      selected.id,
                  ) ===
                    challenges.length -
                      1
                }
                className="inline-flex items-center gap-2 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next Challenge
                <ArrowRight
                  size={14}
                />
              </button>

            </div>

            {/* PROGRESS */}

            <div className="border-t border-slate-800 p-5 sm:p-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    Progress
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {
                      completed.length
                    }{" "}
                    /{" "}
                    {
                      challenges.length
                    }{" "}
                    challenges
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-blue-400">
                    {totalPoints}
                  </p>

                  <p className="text-[9px] uppercase tracking-wider text-slate-700">
                    points earned
                  </p>

                </div>

              </div>

              <div className="mt-4 h-1 bg-slate-900">

                <div
                  className="h-1 bg-blue-500 transition-all"
                  style={{
                    width: `${
                      (
                        completed.length /
                        challenges.length
                      ) *
                      100
                    }%`,
                  }}
                />

              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

function TerminalIcon() {
  return (
    <div className="flex h-4 w-4 items-center justify-center border border-slate-700 text-slate-600">
      <span className="text-[8px]">
        &gt;_
      </span>
    </div>
  );
}
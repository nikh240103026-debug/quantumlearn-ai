"use client";

import {
  Activity,
  ArrowLeft,
  BookOpen,
  Brain,
  Code2,
  FlaskConical,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StudentAnalytics from "./StudentAnalytics";

type Student = {
  id: string;
  name: string;
  institute: string;
  branch: string;
  quantumExperience: string;
  learningGoal: string | null;
  lessonProgress: number;
  completedLessons: number;
  practiceAverage: number;
  practiceAttempts: number;
  codingChallenges: number;
  codingPoints: number;
  labRuns: number;
  labMeasurements: number;
  activeDays: number;
  lastActivity: string | null;
};

type Summary = {
  totalStudents: number;
  activeStudents: number;
  averageMastery: number;
  totalLabRuns: number;
  totalCodingPoints: number;
};

export default function InstructorDashboard() {
  const [
    students,
    setStudents,
  ] = useState<Student[]>([]);

  const [
    summary,
    setSummary,
  ] = useState<Summary>({
    totalStudents: 0,
    activeStudents: 0,
    averageMastery: 0,
    totalLabRuns: 0,
    totalCodingPoints: 0,
  });

  const [
    selectedStudent,
    setSelectedStudent,
  ] =
    useState<Student | null>(
      null,
    );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function loadStudents() {
    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/instructor/students",
          {
            cache:
              "no-store",
          },
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ??
            "Unable to load instructor dashboard.",
        );
      }

      setStudents(
        data.students ?? [],
      );

      setSummary(
        data.summary ?? {
          totalStudents: 0,
          activeStudents: 0,
          averageMastery: 0,
          totalLabRuns: 0,
          totalCodingPoints: 0,
        },
      );

      if (
        selectedStudent
      ) {
        const updated =
          (
            data.students ??
            []
          ).find(
            (
              student: Student,
            ) =>
              student.id ===
              selectedStudent.id,
          );

        setSelectedStudent(
          updated ??
            null,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load instructor dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function selectStudent(
    student: Student,
  ) {
    setSelectedStudent(
      student,
    );
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  const filteredStudents =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return students;
        }

        return students.filter(
          (student) =>
            student.name
              .toLowerCase()
              .includes(query) ||
            student.institute
              .toLowerCase()
              .includes(query) ||
            student.branch
              .toLowerCase()
              .includes(query),
        );
      },
      [
        students,
        search,
      ],
    );

  if (
    selectedStudent
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              setSelectedStudent(
                null,
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft
              size={16}
            />
            Back to students
          </button>

          <StudentAnalytics
            student={
              selectedStudent
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Users size={14} />
                Instructor Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Learner Performance
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                Monitor curriculum progress, practice, coding, and Quantum Lab activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadStudents()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            icon={
              <Users size={18} />
            }
            label="Students"
            value={String(
              summary.totalStudents,
            )}
          />

          <SummaryCard
            icon={
              <Activity size={18} />
            }
            label="Active Learners"
            value={String(
              summary.activeStudents,
            )}
          />

          <SummaryCard
            icon={
              <Brain size={18} />
            }
            label="Avg Mastery"
            value={`${summary.averageMastery}%`}
          />

          <SummaryCard
            icon={
              <FlaskConical
                size={18}
              />
            }
            label="Lab Runs"
            value={String(
              summary.totalLabRuns,
            )}
          />

          <SummaryCard
            icon={
              <Code2 size={18} />
            }
            label="Coding Points"
            value={String(
              summary.totalCodingPoints,
            )}
          />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a learner to inspect detailed performance.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Search students..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Curriculum
                  </th>

                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Practice
                  </th>

                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Coding
                  </th>

                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Lab
                  </th>

                  <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Activity
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(
                  (
                    student,
                  ) => (
                    <tr
                      key={
                        student.id
                      }
                      onClick={() =>
                        selectStudent(
                          student,
                        )
                      }
                      className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                            {student.name
                              .slice(
                                0,
                                1,
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {
                                student.name
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                student.branch
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm font-semibold text-slate-700">
                        {
                          student.lessonProgress
                        }
                        %
                      </td>

                      <td className="px-3 py-4 text-sm font-semibold text-slate-700">
                        {
                          student.practiceAverage
                        }
                        %
                      </td>

                      <td className="px-3 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {
                            student.codingPoints
                          }{" "}
                          pts
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {
                            student.labRuns
                          }{" "}
                          runs
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span className="text-sm text-slate-500">
                          {student.lastActivity
                            ? new Date(
                                student.lastActivity,
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  ),
                )}

                {!loading &&
                  filteredStudents.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center"
                      >
                        <BookOpen
                          size={24}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No students found.
                        </p>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}
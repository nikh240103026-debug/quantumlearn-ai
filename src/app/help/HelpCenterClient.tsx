"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ArrowRight,
  BookOpen,
  UserRound,
  GraduationCap,
  Target,
  FlaskConical,
  Bot,
  Trophy,
  Wrench,
  Mail,
  LifeBuoy,
} from "lucide-react";

type HelpCategory =
  | "getting_started"
  | "account"
  | "learning"
  | "practice"
  | "quantum_lab"
  | "ai_tutor"
  | "progress"
  | "troubleshooting"
  | "support";

type HelpArticle = {
  id: string;
  category: HelpCategory;
  title: string;
  description: string;
  content: string[];
};

type HelpCategoryItem = {
  value: HelpCategory;
  title: string;
  description: string;
  icon: React.ElementType;
};

const categories: HelpCategoryItem[] = [
  {
    value: "getting_started",
    title: "Getting Started",
    description: "Learn how to begin using QuantumLearn AI.",
    icon: GraduationCap,
  },
  {
    value: "account",
    title: "Account & Login",
    description: "Account, login, signup, and settings help.",
    icon: UserRound,
  },
  {
    value: "learning",
    title: "Learning",
    description: "Understand lessons, roadmap, and curriculum.",
    icon: BookOpen,
  },
  {
    value: "practice",
    title: "Practice",
    description: "Questions, assessments, scores, and results.",
    icon: Target,
  },
  {
    value: "quantum_lab",
    title: "Quantum Lab",
    description: "Build and experiment with quantum circuits.",
    icon: FlaskConical,
  },
  {
    value: "ai_tutor",
    title: "AI Tutor",
    description: "Get help with AI Tutor conversations and answers.",
    icon: Bot,
  },
  {
    value: "progress",
    title: "Progress & Certificates",
    description: "Track learning progress and achievements.",
    icon: Trophy,
  },
  {
    value: "troubleshooting",
    title: "Troubleshooting",
    description: "Solutions for common platform problems.",
    icon: Wrench,
  },
  {
    value: "support",
    title: "Contact Support",
    description: "Get direct help when you need it.",
    icon: LifeBuoy,
  },
];

const articles: HelpArticle[] = [
  {
    id: "start-learning",
    category: "getting_started",
    title: "How do I start learning?",
    description:
      "Use the learning roadmap to move through the quantum computing curriculum step by step.",
    content: [
      "Open the Learning Roadmap from the navigation menu.",
      "Choose a topic or lesson from the available curriculum.",
      "Complete the lesson and use the practice section to reinforce what you learned.",
      "You can return to your dashboard to continue from where you left off.",
    ],
  },
  {
    id: "platform-navigation",
    category: "getting_started",
    title: "What can I do on QuantumLearn AI?",
    description:
      "QuantumLearn AI combines structured learning, practice, quantum experimentation, and AI assistance.",
    content: [
      "Learn quantum computing concepts through structured lessons.",
      "Practice your understanding with questions and assessments.",
      "Build and experiment with quantum circuits in Quantum Lab.",
      "Use AI Tutor when you need explanations or guidance.",
    ],
  },
  {
    id: "login-help",
    category: "account",
    title: "I cannot log in to my account",
    description:
      "Check your credentials and account verification before contacting support.",
    content: [
      "Make sure you are using the email address associated with your QuantumLearn account.",
      "Check that your password is entered correctly.",
      "If you recently created an account, make sure your email verification has been completed.",
      "If the problem continues, use Contact Support and describe what happens when you try to log in.",
    ],
  },
  {
    id: "account-settings",
    category: "account",
    title: "Where can I manage my account?",
    description:
      "Your account settings are available from the account menu.",
    content: [
      "Open your account menu from the top navigation.",
      "Select Settings.",
      "Review or update the available profile and account preferences.",
    ],
  },
  {
    id: "learning-roadmap",
    category: "learning",
    title: "How does the learning roadmap work?",
    description:
      "The roadmap organizes quantum computing topics into a structured learning path.",
    content: [
      "Start with foundational concepts before moving into more advanced topics.",
      "Open individual lessons to study the topic in detail.",
      "Use Practice after learning a topic to check your understanding.",
      "Your dashboard can help you continue your learning journey.",
    ],
  },
  {
    id: "lesson-progress",
    category: "learning",
    title: "How do I continue a lesson?",
    description:
      "Your dashboard is designed to help you return to your learning journey.",
    content: [
      "Open Dashboard from the navigation menu.",
      "Use the learning and progress sections to identify your current position.",
      "Open the relevant lesson to continue studying.",
    ],
  },
  {
    id: "practice-questions",
    category: "practice",
    title: "How does Practice work?",
    description:
      "Practice lets you test your understanding using topic-based questions.",
    content: [
      "Open Practice from the navigation menu.",
      "Choose the available chapter and difficulty.",
      "Answer the questions and submit your responses.",
      "Review your results after completing the practice session.",
    ],
  },
  {
    id: "report-question",
    category: "practice",
    title: "How do I report a question?",
    description:
      "You can report a practice question when you find an incorrect or unclear problem.",
    content: [
      "Open the relevant practice question.",
      "Use the report option associated with the question.",
      "Select the reason for your report.",
      "Add additional details when useful so the issue can be investigated.",
    ],
  },
  {
    id: "quantum-lab-basics",
    category: "quantum_lab",
    title: "How do I use Quantum Lab?",
    description:
      "Quantum Lab lets you visually build and experiment with quantum circuits.",
    content: [
      "Open Quantum Lab from the navigation menu.",
      "Select the number of qubits required for your circuit.",
      "Add supported quantum gates to the circuit.",
      "Run the circuit using the available simulator and inspect the results.",
    ],
  },
  {
    id: "quantum-lab-results",
    category: "quantum_lab",
    title: "Why are my circuit results different?",
    description:
      "Quantum simulation results can depend on the circuit, measurements, and execution configuration.",
    content: [
      "Check that the gates are placed on the intended qubits.",
      "Verify that the circuit contains the expected measurement operations.",
      "Run the circuit again if the simulator uses probabilistic measurement.",
      "If the result appears technically incorrect, report the issue through Feedback.",
    ],
  },
  {
    id: "ai-tutor",
    category: "ai_tutor",
    title: "How do I use AI Tutor?",
    description:
      "AI Tutor can help explain quantum computing concepts and answer learning questions.",
    content: [
      "Open AI Tutor from the navigation menu.",
      "Start a new conversation or continue an existing one.",
      "Ask a focused question about the topic you are studying.",
      "Use follow-up questions when you need a simpler or deeper explanation.",
    ],
  },
  {
    id: "ai-tutor-wrong",
    category: "ai_tutor",
    title: "What should I do if AI Tutor gives an incorrect answer?",
    description:
      "AI-generated responses can occasionally be inaccurate.",
    content: [
      "Check the explanation against your lesson material.",
      "Ask AI Tutor to explain the reasoning step by step.",
      "If the response remains incorrect or misleading, report the AI response through Feedback.",
      "Include enough context for the issue to be investigated.",
    ],
  },
  {
    id: "progress",
    category: "progress",
    title: "Where can I see my progress?",
    description:
      "Your dashboard contains information about your learning activity and progress.",
    content: [
      "Open Dashboard after signing in.",
      "Review the available progress and learning sections.",
      "Continue lessons and practice sessions to build your learning history.",
    ],
  },
  {
    id: "certificates",
    category: "progress",
    title: "How do certificates work?",
    description:
      "Certificate availability depends on the learning experiences and completion features provided by the platform.",
    content: [
      "Complete the required learning activities when a certificate-enabled program is available.",
      "Check your progress area for completion information.",
      "If you believe you have completed a requirement but do not see the expected result, contact support.",
    ],
  },
  {
    id: "page-not-loading",
    category: "troubleshooting",
    title: "A page is not loading correctly",
    description:
      "Try a few basic troubleshooting steps before reporting the problem.",
    content: [
      "Refresh the page.",
      "Check your internet connection.",
      "Try opening the page in a private/incognito window.",
      "If the problem continues, report it through Feedback with the page name and what you were trying to do.",
    ],
  },
  {
    id: "feature-not-working",
    category: "troubleshooting",
    title: "A feature is not working",
    description:
      "Provide enough information for the issue to be reproduced.",
    content: [
      "Refresh the page and try the action again.",
      "Check whether the problem occurs consistently.",
      "Note the page, action, and any error message you see.",
      "Submit a bug report through the Feedback Center.",
    ],
  },
  {
    id: "contact-support",
    category: "support",
    title: "How do I contact support?",
    description:
      "If you cannot find the answer here, you can contact the QuantumLearn support team.",
    content: [
      "Open the Feedback Center.",
      "Choose Contact Support.",
      "Describe the problem clearly and include the relevant section of the platform.",
      "Avoid including passwords, private keys, or other sensitive information.",
    ],
  },
];

export default function HelpCenterClient() {
  const [selectedCategory, setSelectedCategory] =
    useState<HelpCategory>("getting_started");

  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const selectedCategoryInfo = categories.find(
    (category) => category.value === selectedCategory,
  );

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (query) {
      return articles.filter((article) => {
        return (
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.content.some((item) =>
            item.toLowerCase().includes(query),
          )
        );
      });
    }

    return articles.filter(
      (article) => article.category === selectedCategory,
    );
  }, [search, selectedCategory]);

  function handleCategoryChange(category: HelpCategory) {
    setSelectedCategory(category);
    setSearch("");
    setOpenArticle(null);
  }

  return (
    <div className="min-h-screen">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 py-8 sm:px-10 lg:px-16">
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40 transition-colors hover:text-blue-600"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-16 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Help Center
            </p>

            <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Find the answers
              <span className="block text-black/35">
                you need.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg">
              Learn how QuantumLearn AI works, solve common
              problems, and find guidance for your learning
              journey.
            </p>

            {/* Search */}
            <div className="mt-10 max-w-3xl">
              <label
                htmlFor="help-search"
                className="sr-only"
              >
                Search Help Center
              </label>

              <div className="relative">
                <Search
                  size={20}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/35"
                />

                <input
                  id="help-search"
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setOpenArticle(null);
                  }}
                  placeholder="Search Help Center"
                  className="w-full border border-black/15 bg-white py-5 pl-14 pr-5 text-sm outline-none transition-colors placeholder:text-black/30 focus:border-blue-600"
                />
              </div>

              {search.trim() && (
                <p className="mt-3 text-xs text-black/35">
                  {filteredArticles.length}{" "}
                  {filteredArticles.length === 1
                    ? "result"
                    : "results"}{" "}
                  found
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 lg:px-16 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          {/* =================================================
              CATEGORIES
          ================================================= */}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
              Help topics
            </p>

            <div className="mt-6 space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const active =
                  category.value === selectedCategory &&
                  !search.trim();

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() =>
                      handleCategoryChange(category.value)
                    }
                    className={`w-full border-l-2 px-5 py-5 text-left transition-all ${
                      active
                        ? "border-blue-600 bg-white"
                        : "border-transparent hover:border-black/20 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        size={18}
                        strokeWidth={1.7}
                        className={
                          active
                            ? "mt-0.5 shrink-0 text-blue-600"
                            : "mt-0.5 shrink-0 text-black/30"
                        }
                      />

                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            active
                              ? "text-blue-600"
                              : "text-[#111318]"
                          }`}
                        >
                          {category.title}
                        </p>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              ARTICLES
          ================================================= */}

          <div>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-600">
                {search.trim()
                  ? "Search results"
                  : selectedCategoryInfo?.title}
              </p>

              <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                {search.trim()
                  ? `Results for “${search.trim()}”`
                  : selectedCategoryInfo?.description}
              </h2>
            </div>

            {filteredArticles.length > 0 ? (
              <div className="border-t border-black/10">
                {filteredArticles.map((article) => {
                  const open =
                    openArticle === article.id;

                  return (
                    <div
                      key={article.id}
                      className="border-b border-black/10"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenArticle(
                            open ? null : article.id,
                          )
                        }
                        className="group flex w-full items-start justify-between gap-8 py-6 text-left"
                        aria-expanded={open}
                      >
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-[#111318] transition-colors group-hover:text-blue-600">
                            {article.title}
                          </p>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                            {article.description}
                          </p>
                        </div>

                        <span
                          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-black/10 transition-all ${
                            open
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "text-black/40 group-hover:border-blue-600 group-hover:text-blue-600"
                          }`}
                        >
                          <ChevronDown
                            size={16}
                            strokeWidth={1.8}
                            className={`transition-transform duration-200 ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </span>
                      </button>

                      {open && (
                        <div className="border-t border-black/10 pb-7 pt-6">
                          <div className="max-w-2xl">
                            <ol className="space-y-4">
                              {article.content.map(
                                (step, index) => (
                                  <li
                                    key={`${article.id}-${index}`}
                                    className="flex gap-4"
                                  >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-blue-600/20 bg-blue-50 text-xs font-semibold text-blue-600">
                                      {index + 1}
                                    </span>

                                    <p className="pt-1 text-sm leading-6 text-black/60">
                                      {step}
                                    </p>
                                  </li>
                                ),
                              )}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-y border-black/10 py-14">
                <p className="text-lg font-medium text-[#111318]">
                  No help articles found.
                </p>

                <p className="mt-3 max-w-lg text-sm leading-6 text-black/45">
                  Try a different search term or browse one of
                  the help categories.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-6 bg-[#090c11] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Browse help topics
                </button>
              </div>
            )}

            {/* =================================================
                SUPPORT CTA
            ================================================= */}

            <div className="mt-14 border-y border-black/10 py-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Still need help?
                  </p>

                  <h3 className="mt-3 text-2xl font-medium tracking-[-0.035em]">
                    Talk to the QuantumLearn team.
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                    If you cannot find an answer here, send us
                    a detailed support request and we will
                    investigate it.
                  </p>
                </div>

                <Link
                  href="/feedback"
                  className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#090c11] px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Contact Support
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* =================================================
                QUICK LINKS
            ================================================= */}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/feedback"
                className="group border border-black/10 bg-white px-5 py-5 transition-colors hover:border-blue-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#111318]">
                      Report a problem
                    </p>

                    <p className="mt-2 text-sm leading-6 text-black/45">
                      Tell us about a bug, content issue, or
                      unexpected behavior.
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 text-black/30 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </div>
              </Link>

              <Link
                href="/feedback"
                className="group border border-black/10 bg-white px-5 py-5 transition-colors hover:border-blue-600"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#111318]">
                      Suggest an improvement
                    </p>

                    <p className="mt-2 text-sm leading-6 text-black/45">
                      Share an idea that could make QuantumLearn
                      better.
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="shrink-0 text-black/30 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
                  />
                </div>
              </Link>
            </div>

            {/* =================================================
                EMAIL SUPPORT
            ================================================= */}

            <div className="mt-10 flex items-center gap-4 border-t border-black/10 pt-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 bg-white">
                <Mail
                  size={17}
                  strokeWidth={1.7}
                  className="text-black/50"
                />
              </span>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-black/30">
                  Need direct assistance?
                </p>

                <p className="mt-1 text-sm text-black/55">
                  Use the Contact Support option above to
                  reach the support workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  User,
  GraduationCap,
  Building2,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

/*
 * IMPORTANT:
 * Replace this value with the EXACT background-image path
 * already used by your landing page.
 *
 * Example:
 * "/images/landing/hero-bg.jpg"
 */
const BACKGROUND_IMAGE = "/images/quantum-computer.jpg";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "tutor", label: "Tutor" },
  { value: "researcher", label: "Researcher" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const inputClass =
  "w-full border border-white/15 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/35 focus:border-blue-400/70 focus:bg-white/[0.10] focus:ring-1 focus:ring-blue-400/30";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-white/55";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("student");
  const [institute, setInstitute] = useState("");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [learningGoal, setLearningGoal] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedInstitute = institute.trim();
    const trimmedBranch = branch.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedGoal = learningGoal.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    const numericAge = Number(age);

    if (
      !age ||
      !Number.isInteger(numericAge) ||
      numericAge < 13 ||
      numericAge > 100
    ) {
      setError("Please enter a valid age between 13 and 100.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    if (!trimmedCity) {
      setError("Please enter your city.");
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    if (!trimmedInstitute) {
      setError("Please enter your institute.");
      return;
    }

    if (!trimmedBranch) {
      setError("Please enter your branch or field of study.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (trimmedPhone && !/^[+0-9()\-\s]{7,20}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: trimmedName,
          age: numericAge,
          gender,
          city: trimmedCity,
          role,
          institute: trimmedInstitute,
          branch: trimmedBranch,
          phone: trimmedPhone || null,
          quantum_experience: experience,
          learning_goal: trimmedGoal || null,
        },
      },
    });

    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    /*
     * Signup successful:
     * immediately move the user to the login page.
     */
    window.location.replace("/login");
  }

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#070a10] text-white">
      {/* ================================================================
          FULL-SCREEN BACKGROUND IMAGE
      ================================================================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${BACKGROUND_IMAGE}")`,
        }}
      />

      {/* ================================================================
          SINGLE DARK OVERLAY
          Covers the complete page so the background remains visible.
      ================================================================= */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtle blue atmospheric lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[20%] h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-[5%] top-[10%] h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* ================================================================
          PAGE CONTENT
      ================================================================= */}
      <div className="relative z-10 flex h-full w-full">
        {/* ==============================================================
            LEFT BRANDING AREA
        ============================================================== */}
        <section className="hidden flex-1 items-center lg:flex">
          <div
            className={`w-full max-w-3xl px-12 py-10 transition-all duration-1000 xl:px-20 ${
              mounted
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
          >
            <Link
              href="/"
              className="group mb-12 inline-flex items-center gap-2 border-b border-white/20 pb-2 text-sm font-medium text-white/65 transition hover:border-white/50 hover:text-white"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back to home
            </Link>

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
              QuantumLearn AI
            </p>

            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-white xl:text-6xl">
              Start learning quantum computing by building it.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/60 xl:text-lg">
              Create your account and enter a connected learning environment
              for quantum concepts, circuits, simulations, practice, and
              AI-guided learning.
            </p>

            <div className="mt-9 h-px w-24 bg-white/25" />

            <p className="mt-5 max-w-lg text-sm leading-6 text-white/45">
              Learn concepts. Build circuits. Run experiments. Understand
              quantum algorithms.
            </p>

            <div className="mt-12 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-white/30">
              <span>Learn</span>
              <span className="h-px w-8 bg-white/15" />
              <span>Build</span>
              <span className="h-px w-8 bg-white/15" />
              <span>Understand</span>
            </div>
          </div>
        </section>

        {/* ==============================================================
            RIGHT SIGNUP PANEL
            Only this rectangular area has its own scroll.
        ============================================================== */}
        <section className="flex h-full w-full items-center justify-center px-4 py-5 sm:px-8 lg:w-[46%] lg:px-8 xl:w-[44%]">
          <div
            className={`flex h-[calc(100dvh-40px)] max-h-[760px] w-full max-w-[500px] flex-col overflow-hidden border border-white/20 bg-white/[0.075] shadow-2xl shadow-black/30 backdrop-blur-2xl transition-all duration-1000 sm:h-[82dvh] lg:h-[68dvh] ${
              mounted
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            {/* ==========================================================
                PANEL HEADER
                Fixed while form scrolls.
            ========================================================== */}
            <div className="shrink-0 border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                    QuantumLearn AI
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Create your account
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Set up your learning profile to get started.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="group inline-flex shrink-0 items-center gap-1.5 border-b border-white/15 pb-1 text-xs font-medium text-white/50 transition hover:border-blue-400/60 hover:text-white"
                >
                  Log in
                  <ArrowUpRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>

            {/* ==========================================================
                SCROLLABLE FORM ONLY
            ========================================================== */}
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.25) transparent",
              }}
            >
              <form
                onSubmit={handleSignup}
                className="space-y-7 px-6 py-6 sm:px-8"
              >
                {/* ======================================================
                    PERSONAL INFORMATION
                ====================================================== */}
                <div>
                  <SectionTitle>Personal information</SectionTitle>

                  <div className="space-y-5">
                    <Field label="Full name" htmlFor="name">
                      <IconInput
                        icon={<User />}
                        id="name"
                        type="text"
                        value={name}
                        onChange={setName}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Age" htmlFor="age">
                        <IconInput
                          icon={<CalendarDays />}
                          id="age"
                          type="number"
                          min="13"
                          max="100"
                          value={age}
                          onChange={setAge}
                          placeholder="Age"
                        />
                      </Field>

                      <Field label="Gender" htmlFor="gender">
                        <select
                          id="gender"
                          value={gender}
                          onChange={(event) => setGender(event.target.value)}
                          className={inputClass}
                        >
                          <option value="" className="bg-[#11151f]">
                            Select gender
                          </option>

                          {GENDER_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              className="bg-[#11151f]"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label="City" htmlFor="city">
                      <IconInput
                        icon={<MapPin />}
                        id="city"
                        type="text"
                        value={city}
                        onChange={setCity}
                        placeholder="Enter your city"
                        autoComplete="address-level2"
                      />
                    </Field>
                  </div>
                </div>

                {/* ======================================================
                    EDUCATION & ROLE
                ====================================================== */}
                <div>
                  <SectionTitle>Education & role</SectionTitle>

                  <div className="space-y-5">
                    <Field label="Role" htmlFor="role">
                      <select
                        id="role"
                        value={role}
                        onChange={(event) => setRole(event.target.value)}
                        className={inputClass}
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#11151f]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Institute" htmlFor="institute">
                      <IconInput
                        icon={<Building2 />}
                        id="institute"
                        type="text"
                        value={institute}
                        onChange={setInstitute}
                        placeholder="College, university, or organization"
                      />
                    </Field>

                    <Field label="Branch / field of study" htmlFor="branch">
                      <IconInput
                        icon={<GraduationCap />}
                        id="branch"
                        type="text"
                        value={branch}
                        onChange={setBranch}
                        placeholder="e.g. Computer Science"
                      />
                    </Field>
                  </div>
                </div>

                {/* ======================================================
                    CONTACT
                ====================================================== */}
                <div>
                  <SectionTitle>Contact</SectionTitle>

                  <div className="space-y-5">
                    <Field label="Email address" htmlFor="email">
                      <IconInput
                        icon={<Mail />}
                        id="email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </Field>

                    <Field
                      label={
                        <>
                          Phone number{" "}
                          <span className="normal-case tracking-normal text-white/30">
                            (optional)
                          </span>
                        </>
                      }
                      htmlFor="phone"
                    >
                      <IconInput
                        icon={<Phone />}
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={setPhone}
                        placeholder="+91 XXXXX XXXXX"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>
                </div>

                {/* ======================================================
                    LEARNING PROFILE
                ====================================================== */}
                <div>
                  <SectionTitle>Learning profile</SectionTitle>

                  <div className="space-y-5">
                    <Field
                      label="Quantum computing experience"
                      htmlFor="experience"
                    >
                      <select
                        id="experience"
                        value={experience}
                        onChange={(event) =>
                          setExperience(event.target.value)
                        }
                        className={inputClass}
                      >
                        {EXPERIENCE_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-[#11151f]"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label={
                        <>
                          Learning goal{" "}
                          <span className="normal-case tracking-normal text-white/30">
                            (optional)
                          </span>
                        </>
                      }
                      htmlFor="learningGoal"
                    >
                      <textarea
                        id="learningGoal"
                        value={learningGoal}
                        onChange={(event) =>
                          setLearningGoal(event.target.value)
                        }
                        placeholder="What do you want to achieve?"
                        rows={3}
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>
                </div>

                {/* ======================================================
                    SECURITY
                ====================================================== */}
                <div>
                  <SectionTitle>Security</SectionTitle>

                  <div className="space-y-5">
                    <PasswordField
                      label="Password"
                      id="password"
                      value={password}
                      visible={showPassword}
                      onChange={setPassword}
                      onToggle={() =>
                        setShowPassword((current) => !current)
                      }
                      placeholder="Create a strong password"
                    />

                    <p className="-mt-2 text-[11px] leading-5 text-white/35">
                      At least 8 characters, including uppercase, lowercase,
                      and a number.
                    </p>

                    <PasswordField
                      label="Confirm password"
                      id="confirmPassword"
                      value={confirmPassword}
                      visible={showConfirmPassword}
                      onChange={setConfirmPassword}
                      onToggle={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>

                {/* ======================================================
                    TERMS
                ====================================================== */}
                <label className="flex cursor-pointer items-start gap-3 border border-white/10 bg-white/[0.035] p-4 transition-colors hover:bg-white/[0.055]">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(event) =>
                      setAgreeToTerms(event.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
                  />

                  <span className="text-[11px] leading-5 text-white/45">
                    I agree to the{" "}
                    <span className="font-medium text-white/70">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-white/70">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>

                {/* ======================================================
                    SUBMIT + MESSAGE
                ====================================================== */}
                <div className="pb-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden border border-blue-400/50 bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-blue-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="relative z-10">
                      {loading ? "Creating account..." : "Create account"}
                    </span>

                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
                  </button>

                  {/* ====================================================
                      ERROR / SUCCESS MESSAGE
                      ALWAYS BELOW BUTTON
                  ==================================================== */}
                  {error && (
                    <div
                      role="alert"
                      className="mt-3 border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-200"
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      role="status"
                      className="mt-3 border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-200"
                    >
                      {message}
                    </div>
                  )}
                </div>

                <p className="pb-1 text-center text-xs text-white/40">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ========================================================================
   REUSABLE UI COMPONENTS
========================================================================= */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />

      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
        {children}
      </span>

      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: React.ReactNode;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>

      {children}
    </div>
  );
}

function IconInput({
  icon,
  id,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  min,
  max,
}: {
  icon: React.ReactNode;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  min?: string;
  max?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
        {icon}
      </span>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={min}
        max={max}
        className={`${inputClass} pl-10`}
      />
    </div>
  );
}

function PasswordField({
  label,
  id,
  value,
  visible,
  onChange,
  onToggle,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>

      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className={`${inputClass} pl-10 pr-11`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/70"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
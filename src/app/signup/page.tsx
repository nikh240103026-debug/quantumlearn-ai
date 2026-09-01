"use client";

import { FormEvent, useState } from "react";
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
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700";

export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();

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

    if (!age || !Number.isInteger(numericAge) || numericAge < 13 || numericAge > 100) {
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

    setLoading(false);

    setMessage(
      "Account created successfully. Please check your email to verify your account before logging in.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-blue-950 px-6 py-8 text-white sm:px-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-blue-700">
              Q
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Create your QuantumLearn AI account
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Tell us a little about yourself so QuantumLearn AI can personalize
              your learning experience.
            </p>
          </div>

          <form onSubmit={handleSignup} className="p-6 sm:p-10">
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            <section>
              <h2 className="text-lg font-bold text-slate-950">
                Personal information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClass}>Full name *</label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Age *</label>
                  <div className="relative">
                    <CalendarDays
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min={13}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="e.g. 21"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>City *</label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="e.g. Imphal"
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>I am a *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={inputClass}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-bold text-slate-950">
                Academic information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Institute *</label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={institute}
                      onChange={(e) => setInstitute(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="College / University / Organization"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Branch / field of study *
                  </label>
                  <div className="relative">
                    <GraduationCap
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="e.g. CSE, Physics, ECE"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Quantum experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className={inputClass}
                  >
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Learning goal
                  </label>
                  <input
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Learn quantum algorithms"
                  />
                </div>
              </div>
            </section>

            <section className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-bold text-slate-950">
                Account information
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Email address *</label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="+91 9876543210"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pl-11 pr-11`}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm password *</label>
                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className={`${inputClass} pl-11 pr-11`}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                Password must contain at least 8 characters, including
                uppercase, lowercase, and a number.
              </div>
            </section>

            <div className="mt-8 flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <label
                htmlFor="terms"
                className="text-sm leading-6 text-slate-600"
              >
                I agree to the QuantumLearn AI Terms of Service and Privacy
                Policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
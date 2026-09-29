"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Save,
  Shield,
  Trash2,
  Upload,
  UserRound,
  X,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Tab =
  | "profile"
  | "security"
  | "notifications"
  | "learning"
  | "ai"
  | "privacy"
  | "delete";

type Props = {
  user: { id: string; email: string };
  profile: Record<string, unknown>;
  settings: Record<string, any> | null;
  events: Array<Record<string, any>>;
};

const tabs: Array<{
  id: Tab;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof UserRound;
}> = [
  {
    id: "profile",
    label: "Profile",
    shortLabel: "Profile",
    description: "Your identity and learner information",
    icon: UserRound,
  },
  {
    id: "security",
    label: "Account & Security",
    shortLabel: "Security",
    description: "Password, email and active sessions",
    icon: Shield,
  },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Notifications",
    description: "Control platform updates and reminders",
    icon: Bell,
  },
  {
    id: "learning",
    label: "Learning Preferences",
    shortLabel: "Learning",
    description: "Personalize your learning experience",
    icon: BookOpen,
  },
  {
    id: "ai",
    label: "AI Tutor Preferences",
    shortLabel: "AI Tutor",
    description: "Control how your AI Tutor responds",
    icon: Sparkles,
  },
  {
    id: "privacy",
    label: "Privacy",
    shortLabel: "Privacy",
    description: "Manage profile and progress visibility",
    icon: Eye,
  },
  {
    id: "delete",
    label: "Delete Account",
    shortLabel: "Delete",
    description: "Permanently remove your account",
    icon: Trash2,
  },
];

const defaultNotifications = {
  question_replies: true,
  learning_reminders: true,
  achievements: true,
  course_completion: true,
  practice_results: true,
  new_challenges: true,
  platform_announcements: true,
  security_alerts: true,
  email_updates: true,
  ai_tutor_updates: true,
};

const defaultLearning = {
  daily_goal_minutes: 30,
  preferred_difficulty: "adaptive",
  show_completed_lessons: true,
};

const defaultAi = {
  response_style: "balanced",
  show_follow_up_suggestions: true,
};

const defaultPrivacy = {
  profile_visibility: "private",
  show_username: true,
  show_learning_progress: false,
};

export default function SettingsClient({
  user,
  profile,
  settings,
  events: initialEvents,
}: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [tab, setTab] = useState<Tab>("profile");

  const [profileState, setProfileState] = useState({
    full_name: String(profile.full_name ?? ""),
    username: String(profile.username ?? ""),
    bio: String(profile.bio ?? ""),
    city: String(profile.city ?? ""),
    institute: String(profile.institute ?? ""),
    branch: String(profile.branch ?? ""),
    phone: String(profile.phone ?? ""),
    learning_goal: String(profile.learning_goal ?? ""),
    learning_level: String(
      profile.learning_level ?? profile.quantum_experience ?? "beginner",
    ),
    age: profile.age ? String(profile.age) : "",
    gender: String(profile.gender ?? "prefer_not_to_say"),
    role: String(profile.role ?? "student"),
    avatar_url: String(profile.avatar_url ?? ""),
  });

  const [notifications, setNotifications] = useState({
    ...defaultNotifications,
    ...(settings?.notification_preferences ?? {}),
  });

  const [learning, setLearning] = useState({
    ...defaultLearning,
    ...(settings?.learning_preferences ?? {}),
  });

  const [ai, setAi] = useState({
    ...defaultAi,
    ...(settings?.ai_tutor_preferences ?? {}),
  });

  const [privacy, setPrivacy] = useState({
    ...defaultPrivacy,
    ...(settings?.privacy_settings ?? {}),
  });

  const [events, setEvents] = useState(initialEvents);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  function clearFeedback() {
    setStatus("");
    setError("");
  }

  async function saveProfile() {
    clearFeedback();
    setSaving(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileState),
    });

    const result = await response.json().catch(() => ({}));

    setSaving(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to save your profile.");
      return;
    }

    setStatus("Profile updated successfully.");
  }

  async function saveSettings(
    key:
      | "notification_preferences"
      | "learning_preferences"
      | "ai_tutor_preferences"
      | "privacy_settings",
    value: object,
  ) {
    clearFeedback();
    setSaving(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });

    const result = await response.json().catch(() => ({}));

    setSaving(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to save your settings.");
      return;
    }

    setStatus("Settings saved.");
  }

  async function uploadAvatar(file: File) {
    clearFeedback();

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Profile pictures must be 2 MB or smaller.");
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: data.publicUrl }),
    });

    const result = await response.json().catch(() => ({}));

    setUploading(false);

    if (!response.ok) {
      setError(result.error ?? "Unable to save your avatar.");
      return;
    }

    setProfileState((current: typeof profileState) => ({
      ...current,
      avatar_url: data.publicUrl,
    }));

    setStatus("Profile picture updated.");
  }

  async function changePassword() {
    clearFeedback();

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (!updateError) {
      await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "password_changed" }),
      });
    }

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setStatus("Password changed successfully.");

    await refreshEvents();
  }

  async function changeEmail() {
    clearFeedback();

    const email = newEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await supabase.auth.updateUser({
      email,
    });

    if (!updateError) {
      await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "email_change_requested",
          metadata: { email },
        }),
      });
    }

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNewEmail("");
    setStatus(
      "A confirmation link has been sent. Confirm the new email address to complete the change.",
    );

    await refreshEvents();
  }

  async function logoutAllDevices() {
    clearFeedback();
    setSaving(true);

    await fetch("/api/account/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "global_logout_requested" }),
    });

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "global",
    });

    setSaving(false);

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    window.location.href = "/login?security=logout_all";
  }

  async function refreshEvents() {
    const response = await fetch("/api/account/security", {
      cache: "no-store",
    });

    if (!response.ok) return;

    const result = await response.json();
    setEvents(result.events ?? []);
  }

  async function deleteAccount() {
    clearFeedback();

    if (deleteText !== "DELETE MY ACCOUNT") {
      setError("Type DELETE MY ACCOUNT exactly to confirm.");
      return;
    }

    setDeleting(true);

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: deleteText }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setDeleting(false);
      setError(result.error ?? "Unable to delete your account.");
      return;
    }

    await supabase.auth.signOut({ scope: "local" });

    window.location.href = "/?account_deleted=1";
  }

  const initials = (profileState.full_name || user.email || "Q")
    .trim()
    .split(/\s+/)
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeTab =
    tabs.find((item) => item.id === tab) ?? tabs[0];

  return (
    <main className="min-h-screen bg-[#f4f5f4] text-[#0b0d10]">
      {/* Top accent line */}
      <div className="h-[3px] w-full bg-[#1264ff]" />

      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {/* Header */}
        <header className="mb-10 border-b border-black/10 pb-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="group mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black/45 transition hover:text-[#1264ff]"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Back to dashboard
              </Link>

              <div className="flex items-center gap-3">
                <span className="h-2 w-2 bg-[#1264ff]" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#1264ff]">
                  Account
                </span>
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Settings
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55 sm:text-base">
                Manage your QuantumLearn identity, learning experience,
                AI Tutor preferences, privacy, and account security.
              </p>
            </div>

            {/* User identity */}
            <div className="flex items-center gap-4 border border-black/10 bg-white px-4 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-[#0b0d10] text-sm font-black text-white">
                {profileState.avatar_url ? (
                  <img
                    src={profileState.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {profileState.full_name || "QuantumLearn learner"}
                </p>
                <p className="max-w-[230px] truncate text-xs text-black/45">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <div className="mb-6 overflow-x-auto border border-black/10 bg-white lg:hidden">
          <div className="flex min-w-max">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    clearFeedback();
                  }}
                  className={`relative flex items-center gap-2 px-4 py-4 text-xs font-bold uppercase tracking-wide transition ${
                    active
                      ? "bg-[#0b0d10] text-white"
                      : item.id === "delete"
                        ? "text-red-600 hover:bg-red-50"
                        : "text-black/55 hover:bg-black/[0.03] hover:text-black"
                  }`}
                >
                  <Icon size={15} />
                  {item.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[285px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 border border-black/10 bg-white">
              <div className="border-b border-black/10 px-5 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">
                  Settings menu
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Account controls
                </p>
              </div>

              <nav className="p-2">
                {tabs.map((item) => {
                  const Icon = item.icon;
                  const active = tab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTab(item.id);
                        clearFeedback();
                      }}
                      className={`group relative flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
                        active
                          ? "bg-[#0b0d10] text-white"
                          : item.id === "delete"
                            ? "text-red-600 hover:bg-red-50"
                            : "text-black/60 hover:bg-black/[0.035] hover:text-black"
                      }`}
                    >
                      <Icon
                        size={17}
                        className={
                          active
                            ? "text-[#6ea2ff]"
                            : item.id === "delete"
                              ? "text-red-500"
                              : "text-black/40"
                        }
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black uppercase tracking-wide">
                          {item.label}
                        </span>
                        <span
                          className={`mt-1 block text-[10px] leading-4 ${
                            active ? "text-white/45" : "text-black/35"
                          }`}
                        >
                          {item.description}
                        </span>
                      </span>

                      <ChevronRight
                        size={14}
                        className={`shrink-0 transition-transform ${
                          active
                            ? "text-white/50"
                            : "text-black/20 group-hover:translate-x-0.5"
                        }`}
                      />

                      {active && (
                        <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#1264ff]" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-black/10 px-5 py-4">
                <p className="text-[10px] leading-4 text-black/35">
                  Changes are saved to your QuantumLearn account and may
                  affect your learning experience across the platform.
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <section className="min-w-0">
            {/* Section label */}
            <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1264ff]">
                  {activeTab.shortLabel}
                </p>
                <h2 className="mt-1 text-lg font-black tracking-tight">
                  {activeTab.label}
                </h2>
              </div>

              <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/30 sm:flex">
                <span className="h-1.5 w-1.5 bg-[#1264ff]" />
                Account settings
              </div>
            </div>

            {/* Feedback */}
            {status && (
              <div className="mb-5 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800">
                <Check size={17} className="mt-0.5 shrink-0" />
                <span className="flex-1">{status}</span>
                <button
                  type="button"
                  onClick={() => setStatus("")}
                  className="shrink-0 text-emerald-700/60 transition hover:text-emerald-900"
                  aria-label="Dismiss success message"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800">
                <X size={17} className="mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 text-red-700/60 transition hover:text-red-900"
                  aria-label="Dismiss error message"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="border border-black/10 bg-white">
              <div className="p-5 sm:p-7 lg:p-9">
                {tab === "profile" && (
                  <ProfileSection
                    profile={profileState}
                    setProfile={setProfileState}
                    onSave={saveProfile}
                    onUpload={uploadAvatar}
                    uploading={uploading}
                    initials={initials}
                    saving={saving}
                    email={user.email}
                  />
                )}

                {tab === "security" && (
                  <SecuritySection
                    email={user.email}
                    newEmail={newEmail}
                    setNewEmail={setNewEmail}
                    onEmail={changeEmail}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    onPassword={changePassword}
                    onLogoutAll={logoutAllDevices}
                    events={events}
                    saving={saving}
                  />
                )}

                {tab === "notifications" && (
                  <PreferenceSection
                    title="Notifications"
                    description="Choose which updates QuantumLearn AI can send you."
                    icon={<Bell size={20} />}
                    values={notifications}
                    onChange={setNotifications}
                    onSave={() =>
                      saveSettings(
                        "notification_preferences",
                        notifications,
                      )
                    }
                    saving={saving}
                    labels={{
                      question_replies: "Question replies",
                      learning_reminders: "Learning reminders",
                      achievements: "Achievements",
                      course_completion: "Course completion",
                      practice_results: "Practice results",
                      new_challenges: "New challenges",
                      platform_announcements: "Platform announcements",
                      security_alerts: "Security notifications",
                      email_updates: "Email updates",
                      ai_tutor_updates: "AI Tutor updates",
                    }}
                    descriptions={{
                      question_replies:
                        "Get notified when someone answers or replies to your community questions.",
                      learning_reminders:
                        "Receive reminders that help you stay consistent with your learning.",
                      achievements:
                        "Get notified when you unlock a new achievement or milestone.",
                      course_completion:
                        "Get notified when you complete a course or major learning milestone.",
                      practice_results:
                        "Receive updates when your practice results are available.",
                      new_challenges:
                        "Get notified when a new quantum challenge becomes available.",
                      platform_announcements:
                        "Receive important announcements and updates from QuantumLearn AI.",
                      security_alerts:
                        "Receive important account and security notifications.",
                      email_updates:
                        "Receive product and platform updates by email.",
                      ai_tutor_updates:
                        "Receive updates related to your AI Tutor experience.",
                    }}
                  />
                )}

                {tab === "learning" && (
                  <LearningSection
                    values={learning}
                    setValues={setLearning}
                    onSave={() =>
                      saveSettings("learning_preferences", learning)
                    }
                    saving={saving}
                  />
                )}

                {tab === "ai" && (
                  <PreferenceSection
                    title="AI Tutor Preferences"
                    description="Control how the AI Tutor communicates and suggests next steps."
                    icon={<Sparkles size={20} />}
                    values={ai}
                    onChange={setAi}
                    onSave={() =>
                      saveSettings("ai_tutor_preferences", ai)
                    }
                    saving={saving}
                    labels={{
                      response_style: "Response style",
                      show_follow_up_suggestions:
                        "Show follow-up suggestions",
                    }}
                    selectOptions={{
                      response_style: [
                        ["concise", "Concise"],
                        ["balanced", "Balanced"],
                        ["detailed", "Detailed"],
                      ],
                    }}
                  />
                )}

                {tab === "privacy" && (
                  <PrivacySection
                    values={privacy}
                    setValues={setPrivacy}
                    onSave={() =>
                      saveSettings("privacy_settings", privacy)
                    }
                    saving={saving}
                  />
                )}

                {tab === "delete" && (
                  <DeleteSection
                    text={deleteText}
                    setText={setDeleteText}
                    onDelete={deleteAccount}
                    deleting={deleting}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 border-b border-black/10 pb-7">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0b0d10] text-white">
          {icon}
        </div>

        <div>
          <h3 className="text-2xl font-black tracking-[-0.025em]">
            {title}
          </h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-black/50">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-black/55">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10 disabled:bg-black/[0.025] disabled:text-black/40"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

function ProfileSection({
  profile,
  setProfile,
  onSave,
  onUpload,
  uploading,
  initials,
  saving,
  email,
}: any) {
  return (
    <div>
      <SectionHeader
        icon={<UserRound size={20} />}
        title="Profile"
        description="Keep your learner identity and background information up to date."
      />

      {/* Profile picture */}
      <div className="mb-9 flex flex-col gap-5 border-b border-black/10 pb-8 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-[#0b0d10] text-2xl font-black text-white">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div>
          <p className="text-sm font-black">Profile picture</p>
          <p className="mt-1 text-xs leading-5 text-black/40">
            JPG, PNG or WEBP
            <br />
            Maximum file size: 2 MB
          </p>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 bg-[#0b0d10] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#1264ff]">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload picture"}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  void onUpload(file);
                }

                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* Identity */}
      <FormGroupLabel label="Identity" />

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Full name"
          value={profile.full_name}
          onChange={(v) =>
            setProfile((p: any) => ({ ...p, full_name: v }))
          }
        />

        <Field
          label="Username"
          value={profile.username}
          onChange={(v) =>
            setProfile((p: any) => ({ ...p, username: v }))
          }
          placeholder="quantum_learner"
        />

        <Field
          label="Email"
          value={email}
          onChange={() => {}}
          disabled
        />

        <Field
          label="Age"
          value={profile.age}
          onChange={(v) =>
            setProfile((p: any) => ({ ...p, age: v }))
          }
          type="number"
        />

        <SelectField
          label="Gender"
          value={profile.gender}
          onChange={(value) =>
            setProfile((p: any) => ({
              ...p,
              gender: value,
            }))
          }
          options={[
            ["male", "Male"],
            ["female", "Female"],
            ["non_binary", "Non-binary"],
            ["prefer_not_to_say", "Prefer not to say"],
          ]}
        />

        <Field
          label="Role"
          value={profile.role}
          onChange={() => {}}
          disabled
        />

        <Field
          label="City"
          value={profile.city}
          onChange={(v) =>
            setProfile((p: any) => ({ ...p, city: v }))
          }
        />

        <Field
          label="Phone"
          value={profile.phone}
          onChange={(v) =>
            setProfile((p: any) => ({ ...p, phone: v }))
          }
        />
      </div>

      {/* Academic */}
      <FormGroupLabel label="Learning & academic information" />

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Institution"
          value={profile.institute}
          onChange={(v) =>
            setProfile((p: any) => ({
              ...p,
              institute: v,
            }))
          }
        />

        <Field
          label="Branch / field"
          value={profile.branch}
          onChange={(v) =>
            setProfile((p: any) => ({
              ...p,
              branch: v,
            }))
          }
        />

        <SelectField
          label="Learning level"
          value={profile.learning_level}
          onChange={(value) =>
            setProfile((p: any) => ({
              ...p,
              learning_level: value,
            }))
          }
          options={[
            ["beginner", "Beginner"],
            ["basic", "Basic"],
            ["intermediate", "Intermediate"],
            ["advanced", "Advanced"],
          ]}
        />

        <Field
          label="Learning goal"
          value={profile.learning_goal}
          onChange={(v) =>
            setProfile((p: any) => ({
              ...p,
              learning_goal: v,
            }))
          }
        />

        <label className="block md:col-span-2">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-black/55">
            Bio / About
          </span>

          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile((p: any) => ({
                ...p,
                bio: e.target.value,
              }))
            }
            rows={5}
            maxLength={500}
            className="w-full resize-y border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10"
          />
        </label>
      </div>

      <SaveButton
        onClick={() => void onSave()}
        saving={saving}
        label="Save profile"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Security                                                                   */
/* -------------------------------------------------------------------------- */

function SecuritySection({
  email,
  newEmail,
  setNewEmail,
  onEmail,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  onPassword,
  onLogoutAll,
  events,
  saving,
}: any) {
  return (
    <div>
      <SectionHeader
        icon={<Shield size={20} />}
        title="Account & Security"
        description="Protect your account, update credentials, and review recent security activity."
      />

      <div className="space-y-8">
        {/* Email */}
        <SecurityBlock
          icon={<Mail size={18} />}
          eyebrow="Account email"
          title="Change email address"
          description="Your current account email is used for authentication and account notifications."
        >
          <div className="mb-5 border border-black/10 bg-[#f6f7f6] px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/35">
              Current email
            </p>
            <p className="mt-1 text-sm font-semibold">{email}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="min-w-0 flex-1 border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10"
            />

            <button
              type="button"
              onClick={() => void onEmail()}
              disabled={saving}
              className="bg-[#0b0d10] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#1264ff] disabled:opacity-50"
            >
              Change email
            </button>
          </div>

          <p className="mt-3 text-xs text-black/40">
            Changing your email requires confirmation through Supabase Auth.
          </p>
        </SecurityBlock>

        {/* Password */}
        <SecurityBlock
          icon={<KeyRound size={18} />}
          eyebrow="Authentication"
          title="Change password"
          description="Use a strong password to keep your QuantumLearn account protected."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="New password"
              showPassword={showPassword}
              onToggle={() => setShowPassword((v: boolean) => !v)}
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              showPassword={showPassword}
              onToggle={() => setShowPassword((v: boolean) => !v)}
            />
          </div>

          <p className="mt-3 text-xs text-black/40">
            Minimum 8 characters with uppercase, lowercase, and a number.
          </p>

          <button
            type="button"
            onClick={() => void onPassword()}
            disabled={saving}
            className="mt-5 inline-flex items-center gap-2 bg-[#0b0d10] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#1264ff] disabled:opacity-50"
          >
            <KeyRound size={15} />
            {saving ? "Updating..." : "Change password"}
          </button>
        </SecurityBlock>

        {/* Sessions */}
        <SecurityBlock
          icon={<LogOut size={18} />}
          eyebrow="Sessions"
          title="Session management"
          description="Sign out this account everywhere, including other browsers and devices."
        >
          <button
            type="button"
            onClick={() => void onLogoutAll()}
            disabled={saving}
            className="inline-flex items-center gap-2 border border-black/15 px-5 py-3 text-xs font-black uppercase tracking-wide transition hover:border-black hover:bg-black hover:text-white disabled:opacity-50"
          >
            <LogOut size={15} />
            Log out all devices
          </button>

          <p className="mt-3 text-xs leading-5 text-black/40">
            You will need to log in again on this device after this action.
          </p>
        </SecurityBlock>

        {/* Security events */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1264ff]">
                Activity
              </p>
              <h3 className="mt-1 text-lg font-black">
                Recent security activity
              </h3>
              <p className="mt-1 text-xs text-black/40">
                Events are recorded without passwords or authentication tokens.
              </p>
            </div>

            <Lock size={18} className="text-black/25" />
          </div>

          <div className="border border-black/10">
            {events.length === 0 ? (
              <p className="px-5 py-6 text-sm text-black/45">
                No security events recorded yet.
              </p>
            ) : (
              events.slice(0, 10).map((event: any) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-3 border-b border-black/10 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold capitalize">
                        {String(event.event_type).replaceAll("_", " ")}
                      </p>

                      {event.metadata?.suspicious === true && (
                        <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-700">
                          Unusual
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-black/35">
                      {event.user_agent
                        ? String(event.user_agent).slice(0, 90)
                        : "Unknown device"}
                    </p>
                  </div>

                  <time className="shrink-0 text-xs text-black/35">
                    {new Date(event.created_at).toLocaleString()}
                  </time>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Preferences                                                                */
/* -------------------------------------------------------------------------- */

function PreferenceSection({
  title,
  description,
  icon,
  values,
  onChange,
  onSave,
  saving,
  labels,
  descriptions = {},
  selectOptions = {},
}: any) {
  return (
    <div>
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
      />

      <div className="divide-y divide-black/10 border-y border-black/10">
        {Object.entries(values).map(([key, value]) =>
          selectOptions[key] ? (
            <div
              key={key}
              className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-black">
                  {labels[key] ?? key}
                </p>
                <p className="mt-1 text-xs text-black/40">
                  Choose how this part of QuantumLearn behaves.
                </p>
              </div>

              <select
                value={String(value)}
                onChange={(e) =>
                  onChange((current: any) => ({
                    ...current,
                    [key]: e.target.value,
                  }))
                }
                className="border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10 sm:w-44"
              >
                {selectOptions[key].map(
                  ([option, label]: [string, string]) => (
                    <option key={option} value={option}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>
          ) : (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-5 py-5"
            >
              <div>
                <p className="text-sm font-black">
                  {labels[key] ?? key}
                </p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-black/40">
                  {descriptions[key] ??
                    (Boolean(value)
                      ? "This option is currently enabled."
                      : "This option is currently disabled.")}
                </p>
              </div>

              <span className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) =>
                    onChange((current: any) => ({
                      ...current,
                      [key]: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />

                <span className="block h-6 w-11 border border-black/20 bg-black/10 transition peer-checked:border-[#1264ff] peer-checked:bg-[#1264ff]" />
                <span className="absolute left-1 top-1 h-4 w-4 bg-white shadow-sm transition peer-checked:translate-x-5" />
              </span>
            </label>
          ),
        )}
      </div>

      <SaveButton
        onClick={() => void onSave()}
        saving={saving}
        label="Save settings"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Learning                                                                   */
/* -------------------------------------------------------------------------- */

function LearningSection({
  values,
  setValues,
  onSave,
  saving,
}: any) {
  return (
    <div>
      <SectionHeader
        icon={<BookOpen size={20} />}
        title="Learning Preferences"
        description="Tune your daily learning target and practice difficulty."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-black/55">
            Daily goal · minutes
          </span>

          <input
            type="number"
            min="5"
            max="240"
            value={values.daily_goal_minutes}
            onChange={(e) =>
              setValues((v: any) => ({
                ...v,
                daily_goal_minutes: Number(e.target.value),
              }))
            }
            className="w-full border border-black/15 px-4 py-3.5 text-sm outline-none transition focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10"
          />
        </label>

        <SelectField
          label="Preferred difficulty"
          value={values.preferred_difficulty}
          onChange={(value) =>
            setValues((v: any) => ({
              ...v,
              preferred_difficulty: value,
            }))
          }
          options={[
            ["adaptive", "Adaptive"],
            ["easy", "Easy"],
            ["medium", "Medium"],
            ["hard", "Hard"],
          ]}
        />
      </div>

      <div className="mt-8 border-y border-black/10">
        <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
          <div>
            <p className="text-sm font-black">
              Show completed lessons
            </p>
            <p className="mt-1 text-xs text-black/40">
              Keep completed learning content visible in your learning
              experience.
            </p>
          </div>

          <span className="relative shrink-0">
            <input
              type="checkbox"
              checked={Boolean(values.show_completed_lessons)}
              onChange={(e) =>
                setValues((v: any) => ({
                  ...v,
                  show_completed_lessons: e.target.checked,
                }))
              }
              className="peer sr-only"
            />

            <span className="block h-6 w-11 border border-black/20 bg-black/10 transition peer-checked:border-[#1264ff] peer-checked:bg-[#1264ff]" />
            <span className="absolute left-1 top-1 h-4 w-4 bg-white shadow-sm transition peer-checked:translate-x-5" />
          </span>
        </label>
      </div>

      <SaveButton
        onClick={() => void onSave()}
        saving={saving}
        label="Save preferences"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Privacy                                                                    */
/* -------------------------------------------------------------------------- */

function PrivacySection({
  values,
  setValues,
  onSave,
  saving,
}: any) {
  return (
    <div>
      <SectionHeader
        icon={<Eye size={20} />}
        title="Privacy"
        description="Control what parts of your learning profile are visible to other users."
      />

      <SelectField
        label="Profile visibility"
        value={values.profile_visibility}
        onChange={(value) =>
          setValues((v: any) => ({
            ...v,
            profile_visibility: value,
          }))
        }
        options={[
          ["private", "Private"],
          ["public", "Public"],
        ]}
      />

      <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
        <ToggleRow
          title="Show username"
          description="Allow your username to be displayed where your profile is visible."
          checked={Boolean(values.show_username)}
          onChange={(checked) =>
            setValues((v: any) => ({
              ...v,
              show_username: checked,
            }))
          }
        />

        <ToggleRow
          title="Show learning progress"
          description="Allow your learning progress to be visible to other users."
          checked={Boolean(values.show_learning_progress)}
          onChange={(checked) =>
            setValues((v: any) => ({
              ...v,
              show_learning_progress: checked,
            }))
          }
        />
      </div>

      <SaveButton
        onClick={() => void onSave()}
        saving={saving}
        label="Save privacy settings"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete account                                                             */
/* -------------------------------------------------------------------------- */

function DeleteSection({
  text,
  setText,
  onDelete,
  deleting,
}: any) {
  return (
    <div>
      <SectionHeader
        icon={<Trash2 size={20} />}
        title="Delete Account"
        description="Permanently remove your QuantumLearn AI account and account-owned data."
      />

      <div className="border border-red-200 bg-[#fff8f8]">
        <div className="border-b border-red-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-600 text-white">
              <Trash2 size={18} />
            </div>

            <div>
              <p className="text-sm font-black text-red-900">
                This action cannot be undone.
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700/70">
                Deleting your account permanently removes your
                authentication account, profile, settings, security
                activity, AI conversations, and other records linked
                with your account according to the platform&apos;s
                retention rules.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 sm:px-6">
          <label className="block">
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-red-800">
              Confirmation
            </span>

            <span className="mb-3 block text-xs text-red-700/65">
              Type <strong>DELETE MY ACCOUNT</strong> exactly to continue.
            </span>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-red-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
              placeholder="DELETE MY ACCOUNT"
            />
          </label>

          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={
              deleting || text !== "DELETE MY ACCOUNT"
            }
            className="mt-5 inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small reusable components                                                   */
/* -------------------------------------------------------------------------- */

function FormGroupLabel({ label }: { label: string }) {
  return (
    <div className="mb-5 mt-9 flex items-center gap-3">
      <span className="h-px flex-1 bg-black/10" />
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-black/35">
        {label}
      </span>
      <span className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-black/55">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10"
      >
        {options.map(([option, labelText]) => (
          <option key={option} value={option}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function SaveButton({
  onClick,
  saving,
  label,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
}) {
  return (
    <div className="mt-8 flex justify-end border-t border-black/10 pt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-[#0b0d10] px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#1264ff] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save size={15} />
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

function SecurityBlock({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-black/10">
      <div className="border-b border-black/10 bg-[#fafbfa] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#0b0d10] text-white">
            {icon}
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#1264ff]">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-base font-black">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-black/45">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-black/15 px-4 py-3.5 pr-11 text-sm outline-none transition placeholder:text-black/25 focus:border-[#1264ff] focus:ring-4 focus:ring-[#1264ff]/10"
        autoComplete="new-password"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 transition hover:text-black"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff size={17} />
        ) : (
          <Eye size={17} />
        )}
      </button>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 py-5">
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="mt-1 max-w-xl text-xs leading-5 text-black/40">
          {description}
        </p>
      </div>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />

        <span className="block h-6 w-11 border border-black/20 bg-black/10 transition peer-checked:border-[#1264ff] peer-checked:bg-[#1264ff]" />
        <span className="absolute left-1 top-1 h-4 w-4 bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
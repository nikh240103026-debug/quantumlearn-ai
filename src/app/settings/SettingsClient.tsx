"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  X,
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

type SectionKey = "profile" | "notifications" | "learning" | "ai" | "privacy";

const NAV: Array<{
  group: string;
  items: Array<{ id: Tab; label: string; description: string; icon: typeof UserRound }>;
}> = [
  {
    group: "Account",
    items: [
      { id: "profile", label: "Profile", description: "Identity and learner details", icon: UserRound },
      { id: "security", label: "Sign-in & security", description: "Email, password, sessions", icon: Shield },
    ],
  },
  {
    group: "Experience",
    items: [
      { id: "learning", label: "Learning", description: "Difficulty and display", icon: BookOpen },
      { id: "ai", label: "AI tutor", description: "How the tutor answers", icon: Sparkles },
      { id: "notifications", label: "Notifications", description: "What we tell you about", icon: Bell },
    ],
  },
  {
    group: "Privacy & data",
    items: [
      { id: "privacy", label: "Privacy", description: "What others can see", icon: Eye },
      { id: "delete", label: "Delete account", description: "Permanently remove it", icon: Trash2 },
    ],
  },
];

const ALL_TABS = NAV.flatMap((group) => group.items);

const SECTION_FOR_KEY = {
  notification_preferences: "notifications",
  learning_preferences: "learning",
  ai_tutor_preferences: "ai",
  privacy_settings: "privacy",
} as const;

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

  // Last-saved values per section, used to detect unsaved edits.
  const [saved, setSaved] = useState<Record<SectionKey, any>>(() => ({
    profile: {
      full_name: String(profile.full_name ?? ""),
      username: String(profile.username ?? ""),
      bio: String(profile.bio ?? ""),
      city: String(profile.city ?? ""),
      institute: String(profile.institute ?? ""),
      branch: String(profile.branch ?? ""),
      phone: String(profile.phone ?? ""),
      learning_goal: String(profile.learning_goal ?? ""),
      learning_level: String(profile.learning_level ?? profile.quantum_experience ?? "beginner"),
      age: profile.age ? String(profile.age) : "",
      gender: String(profile.gender ?? "prefer_not_to_say"),
      role: String(profile.role ?? "student"),
      avatar_url: String(profile.avatar_url ?? ""),
    },
    notifications: { ...defaultNotifications, ...(settings?.notification_preferences ?? {}) },
    learning: { ...defaultLearning, ...(settings?.learning_preferences ?? {}) },
    ai: { ...defaultAi, ...(settings?.ai_tutor_preferences ?? {}) },
    privacy: { ...defaultPrivacy, ...(settings?.privacy_settings ?? {}) },
  }));

  const [profileState, setProfileState] = useState(saved.profile);
  const [notifications, setNotifications] = useState(saved.notifications);
  const [learning, setLearning] = useState(saved.learning);
  const [ai, setAi] = useState(saved.ai);
  const [privacy, setPrivacy] = useState(saved.privacy);

  const [events, setEvents] = useState(initialEvents);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  // Required to change email or password, so a stolen session or an
  // unattended browser can't lock the owner out.
  const [currentPassword, setCurrentPassword] = useState("");
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

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileState),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Unable to save your profile.");
        return;
      }

      setSaved((previous) => ({ ...previous, profile: profileState }));
      setStatus("Profile updated successfully.");
    } catch {
      setError("Unable to save your profile. Check your connection.");
    } finally {
      setSaving(false);
    }
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

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Unable to save your settings.");
        return;
      }

      setSaved((previous) => ({ ...previous, [SECTION_FOR_KEY[key]]: value }));
      setStatus("Settings saved.");
    } catch {
      setError("Unable to save your settings. Check your connection.");
    } finally {
      setSaving(false);
    }
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

    // The photo is saved immediately, so it isn't an unsaved edit.
    setSaved((previous) => ({
      ...previous,
      profile: { ...previous.profile, avatar_url: data.publicUrl },
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

    try {
      const verifyError = await verifyCurrentPassword();

      if (verifyError) {
        setError(verifyError);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "password_changed" }),
      }).catch(() => undefined);

      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setStatus("Password changed successfully.");

      await refreshEvents();
    } catch {
      setError("Unable to change your password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Confirms the current password by signing in with it. Returns an
  // error message, or null if it is correct.
  async function verifyCurrentPassword(): Promise<string | null> {
    if (!currentPassword) {
      return "Enter your current password to confirm this change.";
    }

    const accountEmail = user.email;

    if (!accountEmail) {
      return "Unable to verify your account. Please sign in again.";
    }

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: currentPassword,
      });

    return signInError
      ? "Your current password is incorrect."
      : null;
  }

  async function changeEmail() {
    clearFeedback();

    const email = newEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSaving(true);

    try {
      const verifyError = await verifyCurrentPassword();

      if (verifyError) {
        setError(verifyError);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        email,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "email_change_requested",
          metadata: { email },
        }),
      }).catch(() => undefined);

      setNewEmail("");
      setCurrentPassword("");
      setStatus(
        "A confirmation link has been sent. Confirm the new email address to complete the change.",
      );

      await refreshEvents();
    } catch {
      setError("Unable to change your email. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function logoutAllDevices() {
    clearFeedback();
    setSaving(true);

    try {
      await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "global_logout_requested" }),
      }).catch(() => undefined);

      const { error: signOutError } = await supabase.auth.signOut({
        scope: "global",
      });

      if (signOutError) {
        setError(signOutError.message);
        return;
      }

      window.location.href = "/login?security=logout_all";
    } catch {
      setError("Unable to sign out of all devices. Please try again.");
    } finally {
      setSaving(false);
    }
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

  // ------------------------------------------------------------------
  // Unsaved-changes tracking, deep links, toasts
  // ------------------------------------------------------------------

  const current: Record<SectionKey, any> = {
    profile: profileState,
    notifications,
    learning,
    ai,
    privacy,
  };

  const dirty = (Object.keys(current) as SectionKey[]).filter(
    (key) => JSON.stringify(current[key]) !== JSON.stringify(saved[key]),
  );

  const tabDirty = (id: Tab) => dirty.includes(id as SectionKey);
  const activeDirty = tabDirty(tab);

  function discard(section: SectionKey) {
    const snapshot = saved[section];
    if (section === "profile") setProfileState(snapshot);
    if (section === "notifications") setNotifications(snapshot);
    if (section === "learning") setLearning(snapshot);
    if (section === "ai") setAi(snapshot);
    if (section === "privacy") setPrivacy(snapshot);
  }

  function saveActive() {
    if (tab === "profile") return void saveProfile();
    if (tab === "notifications") return void saveSettings("notification_preferences", notifications);
    if (tab === "learning") return void saveSettings("learning_preferences", learning);
    if (tab === "ai") return void saveSettings("ai_tutor_preferences", ai);
    if (tab === "privacy") return void saveSettings("privacy_settings", privacy);
  }

  const selectTab = useCallback((id: Tab) => {
    setTab(id);
    setStatus("");
    setError("");
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      // ignore
    }
  }, []);

  // Deep links (/settings#security) and back/forward between sections.
  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = window.location.hash.replace("#", "") as Tab;
      if (ALL_TABS.some((item) => item.id === fromHash)) setTab(fromHash);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => setStatus(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const hasDirty = dirty.length > 0;

  useEffect(() => {
    if (!hasDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasDirty]);

  const initials = (profileState.full_name || user.email || "Q")
    .trim()
    .split(/\s+/)
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const completenessFields = [
    profileState.avatar_url,
    profileState.full_name,
    profileState.username,
    profileState.bio,
    profileState.institute,
    profileState.branch,
    profileState.learning_goal,
    profileState.city,
  ];
  const completeness = Math.round(
    (completenessFields.filter((value) => String(value ?? "").trim()).length / completenessFields.length) * 100,
  );

  const activeItem = ALL_TABS.find((item) => item.id === tab) ?? ALL_TABS[0];

  return (
    <main className="bg-[#05070d] min-h-screen pb-28 text-white">
      {/* Masthead */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="ql-grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.2),transparent)] blur-2xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              Dashboard
            </Link>
            <p className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-blue-300/80">
              <span className="h-px w-8 bg-blue-400/70" />
              Your account
            </p>
            <h1 className="mt-4 text-[clamp(2.4rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              <span className="ql-text-fade">Settings</span>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/50">
              Your learner identity, how QuantumLearn teaches you, and who can see what.
            </p>

            {/* Completeness */}
            <div className="mt-6 max-w-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold">Profile {completeness}% complete</span>
                {completeness < 100 && (
                  <button type="button" onClick={() => selectTab("profile")} className="font-semibold text-blue-300 hover:underline">
                    Finish it
                  </button>
                )}
              </div>
              <div className="mt-2 flex gap-1" aria-hidden="true">
                {completenessFields.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                      index < Math.round((completeness / 100) * completenessFields.length) ? "bg-emerald-500" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <IdCard
            name={profileState.full_name}
            username={profileState.username}
            role={profileState.role}
            level={profileState.learning_level}
            institute={profileState.institute}
            avatar={profileState.avatar_url}
            initials={initials}
            memberId={user.id}
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
        {/* Navigation */}
        <nav aria-label="Settings sections" className="lg:sticky lg:top-24 lg:self-start">
          {/* Mobile: horizontal pills */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {ALL_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                  tab === item.id
                    ? "border-blue-400/60 bg-blue-600 text-white"
                    : item.id === "delete"
                      ? "border-rose-400/30 bg-white/[0.03] text-rose-300"
                      : "border-white/10 bg-white/[0.03] text-white/75"
                }`}
              >
                {item.label}
                {tabDirty(item.id) && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#05070d] bg-amber-400" />}
              </button>
            ))}
          </div>

          {/* Desktop: grouped rail */}
          <div className="hidden space-y-6 lg:block">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{group.group}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectTab(item.id)}
                          aria-current={active ? "page" : undefined}
                          className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                            active
                              ? "bg-blue-600 text-white"
                              : item.id === "delete"
                                ? "text-rose-300 hover:bg-rose-500/10"
                                : "text-white/80 hover:bg-white/[0.04]"
                          }`}
                        >
                          <Icon size={16} className={active ? "text-white/70" : "opacity-60"} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{item.label}</span>
                            <span className={`block truncate text-[11px] ${active ? "text-white/50" : "text-white/50"}`}>
                              {item.description}
                            </span>
                          </span>
                          {tabDirty(item.id) ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Unsaved changes" />
                          ) : (
                            <ChevronRight size={14} className={`shrink-0 ${active ? "text-white/40" : "text-white/20"}`} />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Panel */}
        <section aria-labelledby="settings-panel-title" className="min-w-0">
          <div key={tab} className="ql-enter" style={{ animationDuration: "0.35s" }}>
            <div className="mb-6">
              <h2 id="settings-panel-title" className="text-3xl font-semibold">
                {activeItem.label}
              </h2>
              <p className="mt-1 text-sm text-white/50">{activeItem.description}</p>
            </div>

            {tab === "profile" && (
              <ProfileSection
                profile={profileState}
                setProfile={setProfileState}
                onUpload={uploadAvatar}
                uploading={uploading}
                initials={initials}
                email={user.email}
              />
            )}

            {tab === "security" && (
              <SecuritySection
                email={user.email}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
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

            {tab === "notifications" && <NotificationsSection values={notifications} onChange={setNotifications} />}

            {tab === "learning" && <LearningSection values={learning} setValues={setLearning} />}

            {tab === "ai" && <AiSection values={ai} setValues={setAi} />}

            {tab === "privacy" && (
              <PrivacySection
                values={privacy}
                setValues={setPrivacy}
                profile={profileState}
                initials={initials}
              />
            )}

            {tab === "delete" && (
              <DeleteSection text={deleteText} setText={setDeleteText} onDelete={deleteAccount} deleting={deleting} />
            )}
          </div>
        </section>
      </div>

      {/* Unsaved changes bar */}
      {activeDirty && (
        <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:pb-6">
          <div
            role="region"
            aria-label="Unsaved changes"
            className="bg-[#0a0e18]-up mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-blue-400/60 bg-blue-600 px-5 py-3.5 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center"
          >
            <p className="flex flex-1 items-center gap-2.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Unsaved changes in <strong>{activeItem.label}</strong>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => discard(tab as SectionKey)}
                disabled={saving}
                className="flex-1 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:border-white/40 hover:text-white sm:flex-none"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={saveActive}
                disabled={saving}
                className="flex-1 rounded-md bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-blue-50 disabled:opacity-70 sm:flex-none"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="pointer-events-none fixed right-4 top-20 z-[95] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {status && (
          <Toast tone="success" onClose={() => setStatus("")}>
            {status}
          </Toast>
        )}
        {error && (
          <Toast tone="error" onClose={() => setError("")}>
            {error}
          </Toast>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                   */
/* -------------------------------------------------------------------------- */

function Toast({ tone, children, onClose }: { tone: "success" | "error"; children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`ql-palette-in pointer-events-auto flex items-start gap-3 rounded-lg border bg-[#0a0e18] px-4 py-3 text-sm shadow-[0_16px_40px_-14px_rgba(0,0,0,0.8)] ${
        tone === "success" ? "border-emerald-400/30" : "border-rose-400/30"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${
          tone === "success" ? "bg-emerald-500" : "bg-rose-600"
        }`}
      >
        {tone === "success" ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span className="flex-1 leading-5">{children}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-white/50 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
}

function Panel({ title, description, children, tone = "default", aside }: { title?: string; description?: string; children: React.ReactNode; tone?: "default" | "danger"; aside?: React.ReactNode }) {
  return (
    <div className={`bg-[#0a0e18] mb-5 overflow-hidden rounded-lg border ${tone === "danger" ? "border-rose-400/30" : "border-white/10"}`}>
      {(title || aside) && (
        <div className={`flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${tone === "danger" ? "border-rose-400/30 bg-rose-500/10" : "border-white/10"}`}>
          <div>
            {title && <h3 className={`text-base font-semibold ${tone === "danger" ? "text-rose-300" : ""}`}>{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-white/50">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md [&>option]:bg-[#0a0e18] border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/20 disabled:bg-white/[0.05] disabled:text-white/50";

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/80">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-[11px] text-white/50">{hint}</span>}
    </label>
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
      <span className="mb-1.5 block text-xs font-semibold text-white/80">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map(([option, labelText]) => (
          <option key={option} value={option}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? "border-blue-400/60 bg-blue-600" : "border-white/10 bg-white/10"
      }`}
    >
      <span
        className={`absolute left-0 top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  comingSoon,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  comingSoon?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-5 py-4 ${comingSoon ? "opacity-60" : ""}`}>
      <div>
        <p className="text-sm font-semibold">
          {title}
          {comingSoon && (
            <span className="ml-2 rounded-sm bg-white/[0.05] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
              Coming soon
            </span>
          )}
        </p>
        <p className="mt-0.5 max-w-xl text-xs leading-5 text-white/50">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={comingSoon} label={title} />
    </div>
  );
}

function OptionCards<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; title: string; body: string }>;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
              active ? "border-blue-400/60 bg-white/[0.03] shadow-[0_0_32px_-10px_rgba(59,130,246,0.9)]" : "border-white/10 bg-[#0a0e18] hover:border-white/30"
            }`}
          >
            <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-white/40 bg-white/[0.03]">
              {active && <span className="ql-bubble-fill absolute inset-[2.5px] rounded-full bg-blue-600" />}
            </span>
            <span>
              <span className="block text-sm font-semibold">{option.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-white/50">{option.body}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Student ID card (live preview of the profile)                               */
/* -------------------------------------------------------------------------- */

function IdCard({
  name,
  username,
  role,
  level,
  institute,
  avatar,
  initials,
  memberId,
}: {
  name: string;
  username: string;
  role: string;
  level: string;
  institute: string;
  avatar: string;
  initials: string;
  memberId: string;
}) {
  return (
    <div
      aria-label="Your learner ID card"
      className="relative w-full max-w-[360px] overflow-hidden rounded-xl bg-gradient-to-br from-[#121a36] via-[#0b1020] to-[#1a1033] text-white shadow-[0_24px_70px_-20px_rgba(59,130,246,0.55)] ring-1 ring-white/10 lg:w-[360px]"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(35,64,230,0.55),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.025)_0_2px,transparent_2px_8px)]" />
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/quantumlearn-logo.png" alt="" className="h-4 w-4 invert" />
          QuantumLearn · Learner ID
        </span>
        <span className="h-5 w-7 rounded-sm bg-gradient-to-br from-amber-200 to-amber-500 opacity-90" aria-hidden="true" />
      </div>
      <div className="relative flex gap-4 px-5 py-5">
        <span className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-white/10 text-2xl font-semibold">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold">{name || "Your name"}</p>
          <p className="truncate text-xs text-white/55">@{username || "username"}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-sm bg-white/10 px-1.5 py-0.5">{role || "student"}</span>
            <span className="rounded-sm bg-blue-600 px-1.5 py-0.5">{level || "beginner"}</span>
          </div>
          <p className="mt-2 truncate text-xs text-white/50">{institute || "Add your institution"}</p>
        </div>
      </div>
      <div className="relative flex items-center justify-between border-t border-white/10 px-5 py-2.5 font-mono text-[10px] text-white/45">
        <span>ID {memberId.replace(/-/g, "").slice(0, 10).toUpperCase()}</span>
        <span aria-hidden="true" className="tracking-[-0.1em] text-white/30">
          ||| || ||||| | ||| ||
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

function ProfileSection({ profile, setProfile, onUpload, uploading, initials, email }: any) {
  const set = (key: string) => (value: string) => setProfile((p: any) => ({ ...p, [key]: value }));

  return (
    <div>
      <Panel title="Photo" description="Shown on your ID card and next to your community posts.">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-400/60 bg-white/[0.05] text-2xl font-semibold">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
              <Upload size={15} />
              {uploading ? "Uploading…" : "Upload new photo"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-white/50">JPG, PNG or WEBP · up to 2 MB · saved immediately</p>
          </div>
        </div>
      </Panel>

      <Panel title="Identity">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={profile.full_name} onChange={set("full_name")} />
          <Field label="Username" value={profile.username} onChange={set("username")} placeholder="quantum_learner" />
          <Field label="Email" value={email} onChange={() => {}} disabled hint="Change it under Sign-in & security." />
          <Field label="Role" value={profile.role} onChange={() => {}} disabled />
          <Field label="Age" value={profile.age} onChange={set("age")} type="number" />
          <SelectField
            label="Gender"
            value={profile.gender}
            onChange={set("gender")}
            options={[
              ["male", "Male"],
              ["female", "Female"],
              ["non_binary", "Non-binary"],
              ["prefer_not_to_say", "Prefer not to say"],
            ]}
          />
          <Field label="City" value={profile.city} onChange={set("city")} />
          <Field label="Phone" value={profile.phone} onChange={set("phone")} />
        </div>
      </Panel>

      <Panel title="Learning & academic">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Institution" value={profile.institute} onChange={set("institute")} />
          <Field label="Branch / field" value={profile.branch} onChange={set("branch")} />
          <SelectField
            label="Learning level"
            value={profile.learning_level}
            onChange={set("learning_level")}
            options={[
              ["beginner", "Beginner"],
              ["basic", "Basic"],
              ["intermediate", "Intermediate"],
              ["advanced", "Advanced"],
            ]}
          />
          <Field label="Learning goal" value={profile.learning_goal} onChange={set("learning_goal")} placeholder="e.g. Build a VQE from scratch" />
          <label className="block md:col-span-2">
            <span className="mb-1.5 flex justify-between text-xs font-semibold text-white/80">
              Bio
              <span className="font-normal text-white/50">{String(profile.bio ?? "").length}/500</span>
            </span>
            <textarea
              value={profile.bio}
              onChange={(e) => set("bio")(e.target.value)}
              rows={4}
              maxLength={500}
              className={`${inputClass} resize-y leading-6`}
              placeholder="A line or two about you and what you want to learn."
            />
          </label>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Security                                                                    */
/* -------------------------------------------------------------------------- */

const PASSWORD_RULES: Array<{ label: string; test: (value: string) => boolean }> = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /[0-9]/.test(value) },
];

function describeDevice(userAgent: unknown) {
  const ua = String(userAgent ?? "");
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

function relativeTime(value: unknown) {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const seconds = (date.getTime() - Date.now()) / 1000;
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function eventIcon(type: string) {
  if (type.includes("password")) return KeyRound;
  if (type.includes("email")) return Mail;
  if (type.includes("logout")) return LogOut;
  if (type.includes("login") || type.includes("sign_in")) return LogIn;
  return Shield;
}

function SecuritySection({
  email,
  currentPassword,
  setCurrentPassword,
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
  const passed = PASSWORD_RULES.filter((rule) => rule.test(newPassword)).length;
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword;

  return (
    <div>
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-400/30 bg-blue-500/10 px-5 py-4">
        <Lock size={18} className="mt-0.5 shrink-0 text-blue-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Confirm it&apos;s you</p>
          <p className="mt-0.5 text-xs text-white/50">Your current password is required to change your email or password.</p>
          <div className="mt-3 max-w-sm">
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Current password"
              showPassword={showPassword}
              onToggle={() => setShowPassword((v: boolean) => !v)}
              autoComplete="current-password"
            />
          </div>
        </div>
      </div>

      <Panel title="Email address" description={`Currently ${email}. We'll send a link to confirm the new address.`}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@email.com"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button
            type="button"
            onClick={() => void onEmail()}
            disabled={saving || !newEmail}
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
          >
            Send confirmation
          </button>
        </div>
      </Panel>

      <Panel title="Password">
        <div className="grid gap-3 md:grid-cols-2">
          <PasswordInput value={newPassword} onChange={setNewPassword} placeholder="New password" showPassword={showPassword} onToggle={() => setShowPassword((v: boolean) => !v)} />
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" showPassword={showPassword} onToggle={() => setShowPassword((v: boolean) => !v)} />
        </div>

        <div className="mt-4">
          <div className="flex gap-1" aria-hidden="true">
            {PASSWORD_RULES.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  index < passed ? (passed === 4 ? "bg-emerald-500" : passed >= 2 ? "bg-amber-400" : "bg-rose-600") : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-xs sm:grid-cols-5">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(newPassword);
              return (
                <li key={rule.label} className={`flex items-center gap-1.5 ${ok ? "text-emerald-300" : "text-white/50"}`}>
                  {ok ? <Check size={13} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  {rule.label}
                </li>
              );
            })}
            <li className={`flex items-center gap-1.5 ${matches ? "text-emerald-300" : "text-white/50"}`}>
              {matches ? <Check size={13} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              Passwords match
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => void onPassword()}
          disabled={saving || passed < 4 || !matches}
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
        >
          <KeyRound size={15} />
          {saving ? "Updating…" : "Update password"}
        </button>
      </Panel>

      <Panel
        title="Sessions"
        description="Signed in somewhere you don't recognise? Sign out everywhere — including this device."
      >
        <button
          type="button"
          onClick={() => void onLogoutAll()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-blue-400/60 hover:bg-blue-600 hover:text-white disabled:opacity-50"
        >
          <LogOut size={15} />
          Sign out of all devices
        </button>
      </Panel>

      <Panel title="Recent security activity" description="Recorded without passwords or tokens.">
        {events.length === 0 ? (
          <p className="text-sm text-white/50">No security events recorded yet.</p>
        ) : (
          <ol className="relative space-y-5 border-l border-white/10 pl-6">
            {events.slice(0, 10).map((event: any) => {
              const type = String(event.event_type ?? "event");
              const Icon = eventIcon(type);
              return (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0a0e18] text-white/50">
                    <Icon size={12} />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="text-sm font-semibold capitalize">
                      {type.replaceAll("_", " ")}
                      {event.metadata?.suspicious === true && (
                        <span className="ml-2 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-300">
                          Unusual
                        </span>
                      )}
                    </p>
                    <time className="text-xs text-white/50" dateTime={String(event.created_at)} title={new Date(event.created_at).toLocaleString()}>
                      {relativeTime(event.created_at)}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-white/50">{describeDevice(event.user_agent)}</p>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
  autoComplete = "new-password",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputClass} pr-11`}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

const NOTIFICATION_GROUPS: Array<{ title: string; items: Array<[string, string, string]> }> = [
  {
    title: "Learning",
    items: [
      ["practice_results", "Practice results", "When your practice results are ready."],
      ["achievements", "Achievements", "When you unlock an achievement or milestone."],
      ["course_completion", "Course completion", "When you finish a course or major milestone."],
      ["new_challenges", "New challenges", "When a new quantum challenge is published."],
      ["learning_reminders", "Learning reminders", "Nudges to keep your streak going."],
    ],
  },
  {
    title: "Community",
    items: [["question_replies", "Replies to your questions", "When someone answers or replies to your posts."]],
  },
  {
    title: "Platform",
    items: [
      ["platform_announcements", "Announcements", "Important updates from QuantumLearn."],
      ["ai_tutor_updates", "AI tutor updates", "News about your AI tutor experience."],
      ["email_updates", "Email updates", "Product and platform updates by email."],
    ],
  },
  {
    title: "Security",
    items: [["security_alerts", "Security notifications", "Important account and security notices."]],
  },
];

// Features that don't exist yet: shown disabled instead of a toggle
// that does nothing.
const NOTIFICATIONS_COMING_SOON = ["learning_reminders", "email_updates", "ai_tutor_updates"];

function NotificationsSection({ values, onChange }: any) {
  const available = NOTIFICATION_GROUPS.flatMap((group) => group.items.map(([key]) => key)).filter(
    (key) => !NOTIFICATIONS_COMING_SOON.includes(key),
  );
  const allOn = available.every((key) => values[key]);

  return (
    <div>
      {NOTIFICATION_GROUPS.map((group, index) => (
        <Panel
          key={group.title}
          title={group.title}
          aside={
            index === 0 ? (
              <button
                type="button"
                onClick={() =>
                  onChange((currentValues: any) => ({
                    ...currentValues,
                    ...Object.fromEntries(available.map((key) => [key, !allOn])),
                  }))
                }
                className="shrink-0 text-xs font-semibold text-blue-300 hover:underline"
              >
                {allOn ? "Turn all off" : "Turn all on"}
              </button>
            ) : undefined
          }
        >
          <div className="-my-4 divide-y divide-white/[0.07]">
            {group.items.map(([key, title, description]) => (
              <ToggleRow
                key={key}
                title={title}
                description={description}
                checked={Boolean(values[key])}
                comingSoon={NOTIFICATIONS_COMING_SOON.includes(key)}
                onChange={(checked) => onChange((currentValues: any) => ({ ...currentValues, [key]: checked }))}
              />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Learning                                                                    */
/* -------------------------------------------------------------------------- */

function LearningSection({ values, setValues }: any) {
  return (
    <div>
      <Panel title="Default practice difficulty" description="Pre-fills the level on the practice page. You can still change it per set.">
        <OptionCards
          label="Preferred difficulty"
          value={values.preferred_difficulty}
          onChange={(value) => setValues((v: any) => ({ ...v, preferred_difficulty: value }))}
          options={[
            { value: "adaptive", title: "Adaptive", body: "Picks for you from your last five scores: 80%+ → difficult, 50%+ → medium, else easy." },
            { value: "easy", title: "Easy", body: "Definitions and core ideas." },
            { value: "medium", title: "Medium", body: "Apply concepts to short problems." },
            { value: "hard", title: "Hard", body: "Multi-step reasoning." },
          ]}
        />
      </Panel>

      <Panel>
        <div className="-my-4 divide-y divide-white/[0.07]">
          <ToggleRow
            title="Show completed lessons"
            description="Keep finished lessons visible on your dashboard."
            checked={Boolean(values.show_completed_lessons)}
            onChange={(checked) => setValues((v: any) => ({ ...v, show_completed_lessons: checked }))}
          />
          {/* Study time isn't tracked yet, so this goal can't be measured. */}
          <div className="flex items-center justify-between gap-5 py-4 opacity-60">
            <div>
              <p className="text-sm font-semibold">
                Daily goal
                <span className="ml-2 rounded-sm bg-white/[0.05] px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
                  Coming soon
                </span>
              </p>
              <p className="mt-0.5 text-xs text-white/50">Minutes of study per day.</p>
            </div>
            <input type="number" disabled value={values.daily_goal_minutes} className={`${inputClass} w-24 text-right`} aria-label="Daily goal in minutes" />
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* AI tutor                                                                    */
/* -------------------------------------------------------------------------- */

const AI_SAMPLES: Record<string, string> = {
  concise: "A qubit is the quantum version of a bit: it can be in a superposition α|0⟩ + β|1⟩ until measured.",
  balanced:
    "A qubit is the basic unit of quantum information. Unlike a bit, it can be in a superposition α|0⟩ + β|1⟩, where |α|² and |β|² are the probabilities of measuring 0 or 1. Measuring it collapses it to one outcome.",
  detailed:
    "A qubit is a two-level quantum system — the quantum analogue of a classical bit. Its state is a unit vector α|0⟩ + β|1⟩ with complex amplitudes satisfying |α|² + |β|² = 1. You can picture it as a point on the Bloch sphere. Gates rotate that point; measurement in the computational basis returns 0 with probability |α|² and collapses the state. Physically, qubits are built from superconducting circuits, trapped ions, photons and more.",
};

function AiSection({ values, setValues }: any) {
  const style = String(values.response_style ?? "balanced");

  return (
    <div>
      <Panel title="Response style" description="How much the tutor says by default. You can always ask for more or less.">
        <div role="radiogroup" aria-label="Response style" className="flex rounded-md border border-white/10 bg-white/[0.05] p-1">
          {(["concise", "balanced", "detailed"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={style === option}
              onClick={() => setValues((v: any) => ({ ...v, response_style: option }))}
              className={`flex-1 rounded px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                style === option ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Example · &ldquo;What is a qubit?&rdquo;</p>
          <div className="mt-3 flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Sparkles size={13} />
            </span>
            <p key={style} className="ql-enter text-[15px] leading-7 text-white/85" style={{ animationDuration: "0.35s" }}>
              {AI_SAMPLES[style] ?? AI_SAMPLES.balanced}
            </p>
          </div>
          {values.show_follow_up_suggestions && (
            <div className="ql-enter mt-3 flex flex-wrap gap-1.5 pl-10" style={{ animationDuration: "0.35s" }}>
              {["Show it on the Bloch sphere", "How is it measured?"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/75">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <div className="-my-4">
          <ToggleRow
            title="Suggest follow-up questions"
            description="Offer a few next questions after each answer."
            checked={Boolean(values.show_follow_up_suggestions)}
            onChange={(checked) => setValues((v: any) => ({ ...v, show_follow_up_suggestions: checked }))}
          />
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Privacy                                                                     */
/* -------------------------------------------------------------------------- */

function PrivacySection({ values, setValues, profile, initials }: any) {
  const isPublic = values.profile_visibility === "public";
  const showUsername = values.show_username !== false;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <Panel title="Profile visibility">
          <OptionCards
            label="Profile visibility"
            value={values.profile_visibility}
            onChange={(value) => setValues((v: any) => ({ ...v, profile_visibility: value }))}
            options={[
              { value: "private", title: "Private", body: "Others see only your name, photo and role." },
              { value: "public", title: "Public", body: "Also show your bio, institution, branch and level." },
            ]}
          />
        </Panel>
        <Panel>
          <div className="-my-4 divide-y divide-white/[0.07]">
            <ToggleRow
              title="Show username"
              description="Display your @username where your profile appears."
              checked={showUsername}
              onChange={(checked) => setValues((v: any) => ({ ...v, show_username: checked }))}
            />
            <ToggleRow
              title="Show learning progress"
              description="Let other learners see your progress."
              checked={Boolean(values.show_learning_progress)}
              comingSoon
              onChange={(checked) => setValues((v: any) => ({ ...v, show_learning_progress: checked }))}
            />
          </div>
        </Panel>
      </div>

      {/* What others see */}
      <aside>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          <Globe size={12} />
          What other learners see
        </p>
        <div className="bg-[#0a0e18] overflow-hidden rounded-lg border border-white/10">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-base font-semibold text-white">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile.full_name || "Your name"}</p>
              <p className="truncate text-xs text-white/50">
                {showUsername && profile.username ? `@${profile.username} · ` : ""}
                <span className="capitalize">{profile.role || "student"}</span>
              </p>
            </div>
          </div>
          {isPublic ? (
            <div className="ql-enter space-y-2 px-4 py-4 text-xs" style={{ animationDuration: "0.3s" }}>
              <p className="text-sm italic leading-6 text-white/80">{profile.bio || "Your bio will appear here."}</p>
              <p className="text-white/50">
                {[profile.institute, profile.branch].filter(Boolean).join(" · ") || "Institution · Branch"}
              </p>
              <span className="inline-block rounded-sm bg-blue-500/10 px-1.5 py-0.5 font-semibold capitalize text-blue-300">
                {profile.learning_level || "beginner"}
              </span>
            </div>
          ) : (
            <p className="ql-enter flex items-center gap-2 px-4 py-4 text-xs text-white/50" style={{ animationDuration: "0.3s" }}>
              <Lock size={13} />
              Bio, institution, branch and level are hidden.
            </p>
          )}
        </div>
        <p className="mt-2 text-[11px] leading-5 text-white/50">Preview updates as you change settings. Save to apply.</p>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete account                                                              */
/* -------------------------------------------------------------------------- */

function DeleteSection({ text, setText, onDelete, deleting }: any) {
  const phrase = "DELETE MY ACCOUNT";
  const ready = text === phrase;

  return (
    <Panel tone="danger" title="Danger zone" description="This permanently deletes your account. It can't be undone.">
      <ul className="space-y-2 text-sm text-white/80">
        {[
          "You are signed out everywhere and can't sign back in.",
          "Your profile, settings, security activity and AI conversations are removed according to the platform's retention rules.",
          "Want a break instead? Simply sign out — your progress will be waiting.",
        ].map((line) => (
          <li key={line} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" />
            {line}
          </li>
        ))}
      </ul>

      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-semibold text-white/80">
          Type <code className="rounded-sm bg-rose-500/10 px-1 font-mono text-rose-300">{phrase}</code> to confirm
        </span>
        <div className="relative max-w-md">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${inputClass} pr-10 font-mono ${ready ? "border-rose-400/60 focus:border-rose-400/60" : ""}`}
            placeholder={phrase}
            autoComplete="off"
            spellCheck={false}
          />
          {ready && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-300" strokeWidth={3} />}
        </div>
      </label>

      <button
        type="button"
        onClick={() => void onDelete()}
        disabled={deleting || !ready}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Trash2 size={15} />
        {deleting ? "Deleting…" : "Delete my account"}
      </button>
    </Panel>
  );
}

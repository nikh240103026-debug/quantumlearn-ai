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
  User,
  UserRound,
  X,
  Sparkles,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Tab = "profile" | "security" | "notifications" | "learning" | "ai" | "privacy" | "delete";

type Props = {
  user: { id: string; email: string };
  profile: Record<string, unknown>;
  settings: Record<string, any> | null;
  events: Array<Record<string, any>>;
};

const tabs: Array<{ id: Tab; label: string; icon: typeof User }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "learning", label: "Learning Preferences", icon: BookOpen },
  { id: "ai", label: "AI Tutor Preferences", icon: Sparkles },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "delete", label: "Delete Account", icon: Trash2 },
];

const defaultNotifications = {
  email_updates: true,
  learning_reminders: true,
  ai_tutor_updates: true,
  security_alerts: true,
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

export default function SettingsClient({ user, profile, settings, events: initialEvents }: Props) {
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
    learning_level: String(profile.learning_level ?? profile.quantum_experience ?? "beginner"),
    age: profile.age ? String(profile.age) : "",
    gender: String(profile.gender ?? "prefer_not_to_say"),
    role: String(profile.role ?? "student"),
    avatar_url: String(profile.avatar_url ?? ""),
  });
  const [notifications, setNotifications] = useState({ ...defaultNotifications, ...(settings?.notification_preferences ?? {}) });
  const [learning, setLearning] = useState({ ...defaultLearning, ...(settings?.learning_preferences ?? {}) });
  const [ai, setAi] = useState({ ...defaultAi, ...(settings?.ai_tutor_preferences ?? {}) });
  const [privacy, setPrivacy] = useState({ ...defaultPrivacy, ...(settings?.privacy_settings ?? {}) });
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

  function clearFeedback() { setStatus(""); setError(""); }

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
    if (!response.ok) { setError(result.error ?? "Unable to save your profile."); return; }
    setStatus("Profile updated successfully.");
  }

  async function saveSettings(key: "notification_preferences" | "learning_preferences" | "ai_tutor_preferences" | "privacy_settings", value: object) {
    clearFeedback();
    setSaving(true);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) { setError(result.error ?? "Unable to save your settings."); return; }
    setStatus("Settings saved.");
  }

  async function uploadAvatar(file: File) {
    clearFeedback();
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Profile pictures must be 2 MB or smaller."); return; }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setUploading(false); setError(uploadError.message); return; }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: data.publicUrl }),
    });
    const result = await response.json().catch(() => ({}));
    setUploading(false);
    if (!response.ok) { setError(result.error ?? "Unable to save your avatar."); return; }
    setProfileState((current: typeof profileState) => ({ ...current, avatar_url: data.publicUrl }));
    setStatus("Profile picture updated.");
  }

  async function changePassword() {
    clearFeedback();
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and a number."); return;
    }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (!updateError) await fetch("/api/account/security", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_type: "password_changed" }) });
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setNewPassword(""); setConfirmPassword(""); setStatus("Password changed successfully.");
    await refreshEvents();
  }

  async function changeEmail() {
    clearFeedback();
    const email = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ email });
    if (!updateError) await fetch("/api/account/security", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_type: "email_change_requested", metadata: { email } }) });
    setSaving(false);
    if (updateError) { setError(updateError.message); return; }
    setNewEmail(""); setStatus("A confirmation link has been sent. Confirm the new email address to complete the change.");
    await refreshEvents();
  }

  async function logoutAllDevices() {
    clearFeedback();
    setSaving(true);
    await fetch("/api/account/security", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_type: "global_logout_requested" }) });
    const { error: signOutError } = await supabase.auth.signOut({ scope: "global" });
    setSaving(false);
    if (signOutError) { setError(signOutError.message); return; }
    window.location.href = "/login?security=logout_all";
  }

  async function refreshEvents() {
    const response = await fetch("/api/account/security", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json();
    setEvents(result.events ?? []);
  }

  async function deleteAccount() {
    clearFeedback();
    if (deleteText !== "DELETE MY ACCOUNT") { setError("Type DELETE MY ACCOUNT exactly to confirm."); return; }
    setDeleting(true);
    const response = await fetch("/api/account/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: deleteText }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setDeleting(false); setError(result.error ?? "Unable to delete your account."); return; }
    await supabase.auth.signOut({ scope: "local" });
    window.location.href = "/?account_deleted=1";
  }

  const initials = (profileState.full_name || user.email || "Q").trim().split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Back to dashboard</Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your profile, learning preferences, privacy, and account security.</p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-sm font-bold text-white">
              {profileState.avatar_url ? <img src={profileState.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="max-w-44 truncate text-sm font-semibold">{profileState.full_name || user.email}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {tabs.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button key={item.id} type="button" onClick={() => { setTab(item.id); clearFeedback(); }} className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-slate-950 text-white" : item.id === "delete" ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={15} className="opacity-50" />
                </button>
              );
            })}
          </aside>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {status && <div className="mb-6 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><Check size={17} />{status}<button className="ml-auto" onClick={() => setStatus("")}><X size={15} /></button></div>}
            {error && <div className="mb-6 flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"><X size={17} />{error}<button className="ml-auto" onClick={() => setError("")}><X size={15} /></button></div>}

            {tab === "profile" && <ProfileSection profile={profileState} setProfile={setProfileState} onSave={saveProfile} onUpload={uploadAvatar} uploading={uploading} initials={initials} saving={saving} email={user.email} />}
            {tab === "security" && <SecuritySection email={user.email} newEmail={newEmail} setNewEmail={setNewEmail} onEmail={changeEmail} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} showPassword={showPassword} setShowPassword={setShowPassword} onPassword={changePassword} onLogoutAll={logoutAllDevices} events={events} saving={saving} />}
            {tab === "notifications" && <PreferenceSection title="Notifications" description="Choose which updates QuantumLearn AI can send you." icon={<Bell size={20} />} values={notifications} onChange={setNotifications} onSave={() => saveSettings("notification_preferences", notifications)} saving={saving} labels={{ email_updates: "Product and platform updates", learning_reminders: "Learning reminders", ai_tutor_updates: "AI Tutor updates", security_alerts: "Security alerts" }} />}
            {tab === "learning" && <LearningSection values={learning} setValues={setLearning} onSave={() => saveSettings("learning_preferences", learning)} saving={saving} />}
            {tab === "ai" && <PreferenceSection title="AI Tutor Preferences" description="Control how the AI Tutor communicates and suggests next steps." icon={<Sparkles size={20} />} values={ai} onChange={setAi} onSave={() => saveSettings("ai_tutor_preferences", ai)} saving={saving} labels={{ response_style: "Response style", show_follow_up_suggestions: "Show follow-up suggestions" }} selectOptions={{ response_style: [["concise", "Concise"], ["balanced", "Balanced"], ["detailed", "Detailed"]] }} />}
            {tab === "privacy" && <PrivacySection values={privacy} setValues={setPrivacy} onSave={() => saveSettings("privacy_settings", privacy)} saving={saving} />}
            {tab === "delete" && <DeleteSection text={deleteText} setText={setDeleteText} onDelete={deleteAccount} deleting={deleting} />}
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="mb-7 flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center bg-slate-100 text-slate-700">{icon}</div><div><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>;
}

function ProfileSection({ profile, setProfile, onSave, onUpload, uploading, initials, saving, email }: any) {
  return <div>
    <SectionHeader icon={<UserRound size={20} />} title="Profile" description="Keep your learner identity and background information up to date." />
    <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-7 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-950 text-xl font-bold text-white">{profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : initials}</div>
      <div><p className="font-semibold">Profile picture</p><p className="mb-3 text-xs text-slate-500">JPG, PNG, WEBP · maximum 2 MB</p><label className="inline-flex cursor-pointer items-center gap-2 border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50"><Upload size={14} />{uploading ? "Uploading..." : "Upload picture"}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) void onUpload(file); e.currentTarget.value = ""; }} /></label></div>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Full name" value={profile.full_name} onChange={(v) => setProfile((p: any) => ({ ...p, full_name: v }))} />
      <Field label="Username" value={profile.username} onChange={(v) => setProfile((p: any) => ({ ...p, username: v }))} placeholder="quantum_learner" />
      <Field label="Email" value={email} onChange={() => {}} />
      <Field label="Age" value={profile.age} onChange={(v) => setProfile((p: any) => ({ ...p, age: v }))} type="number" />
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Gender</span><select value={profile.gender} onChange={(e) => setProfile((p: any) => ({ ...p, gender: e.target.value }))} className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="male">Male</option><option value="female">Female</option><option value="non_binary">Non-binary</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Role</span><input value={profile.role} readOnly className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500" /></label>
      <Field label="City" value={profile.city} onChange={(v) => setProfile((p: any) => ({ ...p, city: v }))} />
      <Field label="Phone" value={profile.phone} onChange={(v) => setProfile((p: any) => ({ ...p, phone: v }))} />
      <Field label="Institution" value={profile.institute} onChange={(v) => setProfile((p: any) => ({ ...p, institute: v }))} />
      <Field label="Branch / field" value={profile.branch} onChange={(v) => setProfile((p: any) => ({ ...p, branch: v }))} />
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Learning level</span><select value={profile.learning_level} onChange={(e) => setProfile((p: any) => ({ ...p, learning_level: e.target.value }))} className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"><option value="beginner">Beginner</option><option value="basic">Basic</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <Field label="Learning goal" value={profile.learning_goal} onChange={(v) => setProfile((p: any) => ({ ...p, learning_goal: v }))} />
      <label className="block md:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Bio / About</span><textarea value={profile.bio} onChange={(e) => setProfile((p: any) => ({ ...p, bio: e.target.value }))} rows={4} className="w-full resize-y border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" maxLength={500} /></label>
    </div>
    <div className="mt-7 flex justify-end"><button type="button" onClick={() => void onSave()} disabled={saving} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"><Save size={16} />{saving ? "Saving..." : "Save profile"}</button></div>
  </div>;
}

function SecuritySection({ email, newEmail, setNewEmail, onEmail, newPassword, setNewPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, onPassword, onLogoutAll, events, saving }: any) {
  return <div><SectionHeader icon={<Shield size={20} />} title="Account & Security" description="Protect your account, update credentials, and review recent security activity." />
    <div className="space-y-7">
      <div className="border border-slate-200 p-5"><div className="flex items-start gap-3"><Mail className="mt-0.5" size={18} /><div className="flex-1"><p className="font-semibold">Current email</p><p className="mt-1 text-sm text-slate-500">{email}</p><p className="mt-2 text-xs text-slate-400">Changing email requires confirmation through Supabase Auth.</p></div></div><div className="mt-4 flex gap-2"><input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="New email address" className="min-w-0 flex-1 border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" /><button onClick={() => void onEmail()} disabled={saving} className="bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Change email</button></div></div>
      <div className="border border-slate-200 p-5"><div className="flex items-start gap-3"><KeyRound className="mt-0.5" size={18} /><div><p className="font-semibold">Change password</p><p className="mt-1 text-sm text-slate-500">Use at least 8 characters with uppercase, lowercase, and a number.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="relative"><input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((v: boolean) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" autoComplete="new-password" /></div><button onClick={() => void onPassword()} disabled={saving} className="mt-4 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Change password</button></div>
      <div className="border border-slate-200 p-5"><div className="flex items-start gap-3"><LogOut className="mt-0.5" size={18} /><div className="flex-1"><p className="font-semibold">Session management</p><p className="mt-1 text-sm leading-6 text-slate-500">Sign out this account everywhere, including other browsers and devices. You will need to log in again.</p></div></div><button onClick={() => void onLogoutAll()} disabled={saving} className="mt-4 inline-flex items-center gap-2 border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"><LogOut size={16} />Log out all devices</button></div>
      <div><div className="mb-3 flex items-center justify-between"><div><h3 className="font-bold">Recent security activity</h3><p className="text-xs text-slate-500">Events are recorded without passwords or tokens.</p></div><Lock size={17} className="text-slate-400" /></div><div className="divide-y divide-slate-100 border border-slate-200">{events.length === 0 ? <p className="p-4 text-sm text-slate-500">No security events recorded yet.</p> : events.slice(0, 10).map((event: any) => <div key={event.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><p className="text-sm font-semibold capitalize">{String(event.event_type).replaceAll("_", " ")}</p>{event.metadata?.suspicious === true && <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Unusual</span>}</div><p className="text-xs text-slate-400">{event.user_agent ? String(event.user_agent).slice(0, 90) : "Unknown device"}</p></div><time className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString()}</time></div>)}</div></div>
    </div>
  </div>;
}

function PreferenceSection({ title, description, icon, values, onChange, onSave, saving, labels, selectOptions = {} }: any) {
  return <div><SectionHeader icon={icon} title={title} description={description} /><div className="space-y-2">{Object.entries(values).map(([key, value]) => selectOptions[key] ? <label key={key} className="flex items-center justify-between gap-4 border border-slate-100 px-4 py-4"><span><span className="block text-sm font-semibold">{labels[key] ?? key}</span></span><select value={String(value)} onChange={(e) => onChange((current: any) => ({ ...current, [key]: e.target.value }))} className="border border-slate-200 bg-white px-3 py-2 text-sm"><>{selectOptions[key].map(([option, label]: [string, string]) => <option key={option} value={option}>{label}</option>)}</></select></label> : <label key={key} className="flex cursor-pointer items-center justify-between gap-4 border border-slate-100 px-4 py-4"><span><span className="block text-sm font-semibold">{labels[key] ?? key}</span></span><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange((current: any) => ({ ...current, [key]: e.target.checked }))} className="h-4 w-4" /></label>)}</div><div className="mt-6 flex justify-end"><button onClick={() => void onSave()} disabled={saving} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />{saving ? "Saving..." : "Save settings"}</button></div></div>;
}

function LearningSection({ values, setValues, onSave, saving }: any) {
  return <div><SectionHeader icon={<BookOpen size={20} />} title="Learning Preferences" description="Tune your daily learning target and practice difficulty." /><div className="grid gap-5 md:grid-cols-2"><label className="block"><span className="mb-2 block text-sm font-semibold">Daily goal (minutes)</span><input type="number" min="5" max="240" value={values.daily_goal_minutes} onChange={(e) => setValues((v: any) => ({ ...v, daily_goal_minutes: Number(e.target.value) }))} className="w-full border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500" /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Preferred difficulty</span><select value={values.preferred_difficulty} onChange={(e) => setValues((v: any) => ({ ...v, preferred_difficulty: e.target.value }))} className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"><option value="adaptive">Adaptive</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div><label className="mt-5 flex items-center justify-between border border-slate-100 px-4 py-4"><span className="text-sm font-semibold">Show completed lessons</span><input type="checkbox" checked={Boolean(values.show_completed_lessons)} onChange={(e) => setValues((v: any) => ({ ...v, show_completed_lessons: e.target.checked }))} className="h-4 w-4" /></label><div className="mt-6 flex justify-end"><button onClick={() => void onSave()} disabled={saving} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />Save preferences</button></div></div>;
}

function PrivacySection({ values, setValues, onSave, saving }: any) {
  return <div><SectionHeader icon={<Eye size={20} />} title="Privacy" description="Control what parts of your learning profile are visible to other users." /><label className="block"><span className="mb-2 block text-sm font-semibold">Profile visibility</span><select value={values.profile_visibility} onChange={(e) => setValues((v: any) => ({ ...v, profile_visibility: e.target.value }))} className="w-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"><option value="private">Private</option><option value="public">Public</option></select></label><div className="mt-4 space-y-2"><label className="flex items-center justify-between border border-slate-100 px-4 py-4"><span className="text-sm font-semibold">Show username</span><input type="checkbox" checked={Boolean(values.show_username)} onChange={(e) => setValues((v: any) => ({ ...v, show_username: e.target.checked }))} className="h-4 w-4" /></label><label className="flex items-center justify-between border border-slate-100 px-4 py-4"><span className="text-sm font-semibold">Show learning progress</span><input type="checkbox" checked={Boolean(values.show_learning_progress)} onChange={(e) => setValues((v: any) => ({ ...v, show_learning_progress: e.target.checked }))} className="h-4 w-4" /></label></div><div className="mt-6 flex justify-end"><button onClick={() => void onSave()} disabled={saving} className="inline-flex items-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save size={16} />Save privacy settings</button></div></div>;
}

function DeleteSection({ text, setText, onDelete, deleting }: any) {
  return <div><SectionHeader icon={<Trash2 size={20} />} title="Delete Account" description="Permanently remove your QuantumLearn AI account and account-owned data." /><div className="border border-red-200 bg-red-50 p-5"><p className="font-bold text-red-800">This action cannot be undone.</p><p className="mt-2 text-sm leading-6 text-red-700">Your authentication account, profile, settings, security activity, AI conversations, and other records linked with your account will be removed according to the platform&apos;s retention rules.</p><div className="mt-5"><label className="mb-2 block text-sm font-semibold text-red-800">Type DELETE MY ACCOUNT</label><input value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-red-200 bg-white px-4 py-3 text-sm outline-none focus:border-red-500" placeholder="DELETE MY ACCOUNT" /></div><button onClick={() => void onDelete()} disabled={deleting || text !== "DELETE MY ACCOUNT"} className="mt-4 inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={16} />{deleting ? "Deleting..." : "Delete my account"}</button></div></div>;
}

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, HardDriveUpload, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import {
  dangerButton,
  inputClass,
  selectClass,
  labelClass,
  panelClass,
  primaryButton,
  secondaryButton,
  sectionTitleClass,
} from "@/components/common/styles";
import { ME_KEY, useAuth, useUser } from "@/contexts/AuthContext";
import { useLegacyImport } from "@/hooks/useLegacyImport";
import { api, errorMessage } from "@/lib/api";
import type { AuthResponse, User } from "@/types/api";
import { exportExpensesToCSV } from "@/utils/export";

const CURRENCIES = ["LKR", "USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "AED", "JPY"];

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className={`${panelClass} p-5 sm:p-6 mb-5`}>
      <h2 className={sectionTitleClass}>{title}</h2>
      <p className="mt-1 mb-4 text-[#606861] text-xs">{description}</p>
      {children}
    </section>
  );
}

export function SettingsView() {
  const user = useUser();
  const { logout, replaceSession } = useAuth();
  const queryClient = useQueryClient();
  const legacy = useLegacyImport();

  const [profile, setProfile] = useState({ name: "", currency: "LKR", budget: "" });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [deleting, setDeleting] = useState({ open: false, password: "" });

  useEffect(() => {
    setProfile({
      name: user.name,
      currency: user.currency,
      budget: user.monthlyBudget ? String(user.monthlyBudget) : "",
    });
  }, [user]);

  const saveProfile = useMutation({
    mutationFn: async () =>
      (
        await api.patch<User>("/auth/me", {
          name: profile.name.trim(),
          currency: profile.currency,
          monthlyBudget: profile.budget ? Number(profile.budget) : null,
        })
      ).data,
    onSuccess: (updated) => {
      queryClient.setQueryData(ME_KEY, updated);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Settings saved.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const changePassword = useMutation({
    mutationFn: async () =>
      (
        await api.post<AuthResponse>("/auth/password", {
          currentPassword: passwords.current,
          newPassword: passwords.next,
        })
      ).data,
    onSuccess: (session) => {
      // The old token is now revoked everywhere; keep this browser signed in with the new one.
      replaceSession(session);
      setPasswords({ current: "", next: "" });
      toast.success("Password changed. Other devices have been signed out.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const revokeSessions = useMutation({
    mutationFn: async () => (await api.post<AuthResponse>("/auth/sessions/revoke")).data,
    onSuccess: (session) => {
      replaceSession(session);
      toast.success("Signed out of every other device.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.delete("/auth/me", { data: { password: deleting.password } }),
    onSuccess: () => {
      logout();
      toast.success("Your account and all its data have been deleted.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const handleProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Your name can't be empty.");
      return;
    }
    saveProfile.mutate();
  };

  const handlePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (passwords.next.length < 8) {
      toast.error("The new password needs at least 8 characters.");
      return;
    }
    if (new TextEncoder().encode(passwords.next).length > 72) {
      toast.error("That password is too long. Use at most 72 characters.");
      return;
    }
    changePassword.mutate();
  };

  return (
    <>
      <PageHeader eyebrow={user.email} title="Settings" />

      <Section title="Profile & budget" description="How the ledger addresses you and counts your money.">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleProfile}>
          <div className="grid gap-1.5">
            <label htmlFor="settings-name" className={labelClass}>Name</label>
            <input
              id="settings-name"
              className={inputClass}
              maxLength={60}
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="settings-currency" className={labelClass}>Currency</label>
            <select
              id="settings-currency"
              className={selectClass}
              value={profile.currency}
              onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <label htmlFor="settings-budget" className={labelClass}>Monthly budget (optional)</label>
            <input
              id="settings-budget"
              className={`${inputClass} font-mono sm:max-w-xs`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="No overall limit"
              value={profile.budget}
              onChange={(e) => setProfile((p) => ({ ...p, budget: e.target.value }))}
            />
            <p className="m-0 text-[#5f6962] text-[10px]">
              Per-category limits live on the Categories page.
            </p>
          </div>
          <div className="sm:col-span-2">
            <button className={primaryButton} type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      </Section>

      <Section title="Password" description="Use at least 8 characters.">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handlePassword}>
          <div className="grid gap-1.5">
            <label htmlFor="settings-current" className={labelClass}>Current password</label>
            <input
              id="settings-current"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="settings-new" className={labelClass}>New password</label>
            <input
              id="settings-new"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={passwords.next}
              onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              className={secondaryButton}
              type="submit"
              disabled={changePassword.isPending || !passwords.current || !passwords.next}
            >
              Change password
            </button>
          </div>
        </form>
      </Section>

      <Section title="Your data" description="Take a copy of everything, any time.">
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButton} onClick={() => exportExpensesToCSV()}>
            <Download className="w-3.5 h-3.5" /> Export all expenses (CSV)
          </button>
          {legacy.count > 0 && (
            <button className={secondaryButton} onClick={legacy.importAll} disabled={legacy.isImporting}>
              <HardDriveUpload className="w-3.5 h-3.5" /> Import {legacy.count} expenses saved in this browser
            </button>
          )}
        </div>
      </Section>

      <Section title="Sessions" description="Lost a phone, or signed in on a shared computer?">
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButton} onClick={() => revokeSessions.mutate()} disabled={revokeSessions.isPending}>
            <MonitorSmartphone className="w-3.5 h-3.5" /> Sign out of all other devices
          </button>
          <button className={secondaryButton} onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign out here
          </button>
        </div>
      </Section>

      <section className="p-5 sm:p-6 mb-5 rounded-2xl border border-[#e3b9a6] bg-[#fdf5f1]">
        <h2 className={`${sectionTitleClass} !text-[#8d4430]`}>Delete account</h2>
        <p className="mt-1 mb-4 text-[#8a5a4a] text-xs">
          Permanently removes your account, categories and every expense. This can't be undone, so
          export a CSV first if you want a copy.
        </p>
        {deleting.open ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (deleting.password) deleteAccount.mutate();
            }}
          >
            <div className="grid gap-1.5 flex-1 min-w-[200px] max-w-xs">
              <label htmlFor="delete-password" className={labelClass}>Confirm with your password</label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                autoFocus
                className={inputClass}
                value={deleting.password}
                onChange={(e) => setDeleting({ open: true, password: e.target.value })}
              />
            </div>
            <button type="button" className={secondaryButton} onClick={() => setDeleting({ open: false, password: "" })}>
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#c4553b] text-white text-xs font-bold disabled:opacity-60"
              disabled={!deleting.password || deleteAccount.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete everything
            </button>
          </form>
        ) : (
          <button className={dangerButton} onClick={() => setDeleting({ open: true, password: "" })}>
            <Trash2 className="w-3.5 h-3.5" /> Delete my account
          </button>
        )}
      </section>
    </>
  );
}

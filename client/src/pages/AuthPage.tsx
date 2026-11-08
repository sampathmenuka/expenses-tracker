import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Brand } from "@/components/common/Brand";
import { eyebrowClass, inputClass, labelClass, primaryButton } from "@/components/common/styles";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";

interface AuthPageProps {
  mode: "login" | "register";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { login, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === "register";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (isRegister && form.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (isRegister && new TextEncoder().encode(form.password).length > 72) {
      setError("That password is too long. Use at most 72 characters.");
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form.name.trim(), form.email.trim(), form.password);
        toast.success("Welcome! Your ledger is ready.");
      } else {
        await login(form.email.trim(), form.password);
      }
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center">
          <Brand />
        </div>
        <section className="p-7 rounded-3xl border border-[#154734]/15 bg-[#fffdf8]/90 shadow-xl shadow-black/5 animate-surface">
          <span className={eyebrowClass}>{isRegister ? "Start your ledger" : "Welcome back"}</span>
          <h1 className="mt-1 mb-1 font-serif text-3xl font-bold text-[#154734] tracking-tight">
            {isRegister ? "Create an account" : "Sign in"}
          </h1>
          <p className="m-0 mb-6 text-[#606861] text-xs leading-relaxed">
            {isRegister
              ? "Your expenses are saved securely and available on any device."
              : "Pick up right where you left off."}
          </p>

          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <div className="grid gap-1.5">
                <label htmlFor="auth-name" className={labelClass}>Your name</label>
                <input
                  id="auth-name"
                  className={inputClass}
                  autoComplete="name"
                  required
                  maxLength={60}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
            )}
            <div className="grid gap-1.5">
              <label htmlFor="auth-email" className={labelClass}>Email</label>
              <input
                id="auth-email"
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                autoFocus={!isRegister}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="auth-password" className={labelClass}>Password</label>
              <input
                id="auth-password"
                className={inputClass}
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
              {isRegister && (
                <span className="text-[#5f6962] text-[10px]">At least 8 characters.</span>
              )}
            </div>

            {error && (
              <p role="alert" className="m-0 p-2.5 rounded-xl bg-[#fbeee9] text-[#8d4430] text-xs">
                {error}
              </p>
            )}

            <button className={`${primaryButton} h-10 mt-1`} type="submit" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 mb-0 text-center text-[#606861] text-xs">
            {isRegister ? "Already have an account? " : "New here? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="text-[#154734] font-bold underline underline-offset-2"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

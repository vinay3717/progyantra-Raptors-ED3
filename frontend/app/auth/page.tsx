"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

const signupSchema = z
  .object({
    name: z.string().min(2, "Full name is required."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Password should be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password should be at least 8 characters."),
});

type SignupForm = z.infer<typeof signupSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const { signup, login, loading } = useAuth();

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSignup = signupForm.handleSubmit(async (values) => {
    await signup({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  });

  const handleLogin = loginForm.handleSubmit(async (values) => {
    await login(values);
  });

  return (
    <div className="min-h-screen bg-black px-5 pb-16 pt-6 sm:px-8">
      <Navbar />

      <main className="mx-auto grid w-full max-w-6xl gap-8 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card-surface rounded-3xl p-7 sm:p-9"
        >
          <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">
            Authentication
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">
            Login or Signup
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Unified auth page from SRS section 3.2. New users continue to
            onboarding. Existing users are routed based on `onboarding_complete`.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-black"
                  : "border border-white/20 text-slate-300 hover:text-white"
              }`}
            >
              Signup
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-black"
                  : "border border-white/20 text-slate-300 hover:text-white"
              }`}
            >
              Login
            </button>
          </div>
        </motion.section>

        <motion.section
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="card-surface rounded-3xl p-7 sm:p-9"
        >
          {mode === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <Field
                label="Full Name"
                error={signupForm.formState.errors.name?.message}
                input={
                  <input
                    {...signupForm.register("name")}
                    className="auth-input"
                    placeholder="Enter your full name"
                  />
                }
              />
              <Field
                label="Email"
                error={signupForm.formState.errors.email?.message}
                input={
                  <input
                    {...signupForm.register("email")}
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                  />
                }
              />
              <Field
                label="Password"
                error={signupForm.formState.errors.password?.message}
                input={
                  <input
                    {...signupForm.register("password")}
                    type="password"
                    className="auth-input"
                    placeholder="Minimum 8 characters"
                  />
                }
              />
              <Field
                label="Confirm Password"
                error={signupForm.formState.errors.confirmPassword?.message}
                input={
                  <input
                    {...signupForm.register("confirmPassword")}
                    type="password"
                    className="auth-input"
                    placeholder="Re-enter password"
                  />
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="button-shimmer mt-2 w-full rounded-xl px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field
                label="Email"
                error={loginForm.formState.errors.email?.message}
                input={
                  <input
                    {...loginForm.register("email")}
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                  />
                }
              />
              <Field
                label="Password"
                error={loginForm.formState.errors.password?.message}
                input={
                  <input
                    {...loginForm.register("password")}
                    type="password"
                    className="auth-input"
                    placeholder="Enter password"
                  />
                }
              />
              <button
                type="submit"
                disabled={loading}
                className="button-shimmer mt-2 w-full rounded-xl px-5 py-3 text-sm font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          )}
        </motion.section>
      </main>
    </div>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: ReactNode;
  error?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">
        {label}
      </span>
      {input}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
    </label>
  );
}

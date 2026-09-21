import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/common";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — BookNest Library" },
      { name: "description", content: "Create a free BookNest Library account to start borrowing books." },
      { property: "og:title", content: "Register — BookNest Library" },
      { property: "og:description", content: "Create a free account to start borrowing books." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (values.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (values.password !== values.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: values.fullName.trim() },
      },
    });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      return;
    }
    toast.success("Account created. Happy reading!");
    navigate({ to: "/books" });
  }

  if (checkEmail)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold">Check your email</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium">{values.email}</span>. Click it to
          activate your account, then log in.
        </p>
        <Button asChild className="mt-6">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-2 text-muted-foreground">Join BookNest to borrow and track your books.</p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {formError ? <ErrorMessage message={formError} /> : null}

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={values.fullName}
            maxLength={100}
            autoComplete="name"
            onChange={(e) => set("fullName", e.target.value)}
          />
          {errors.fullName ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {errors.email ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
          />
          {errors.password ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.password}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={values.confirm}
            onChange={(e) => set("confirm", e.target.value)}
          />
          {errors.confirm ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.confirm}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Register"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already a member?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

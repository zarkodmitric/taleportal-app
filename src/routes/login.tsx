import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@/components/common";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — BookNest Library" },
      { name: "description", content: "Log in to your BookNest Library account to borrow books." },
      { property: "og:title", content: "Login — BookNest Library" },
      { property: "og:description", content: "Log in to borrow books from BookNest Library." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-muted-foreground">Access your loans and borrow new books.</p>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {formError ? <ErrorMessage message={formError} /> : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password ? (
            <p className="text-xs text-destructive" role="alert">
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

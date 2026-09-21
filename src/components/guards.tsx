import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { LoadingSpinner, EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user)
    return (
      <EmptyState
        title="Please log in"
        description="You need an account to view this page."
        action={
          <Button asChild>
            <Link to="/login">Go to login</Link>
          </Button>
        }
      />
    );
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user)
    return (
      <EmptyState
        title="Please log in"
        description="Administrator access is required for this page."
        action={
          <Button asChild>
            <Link to="/login">Go to login</Link>
          </Button>
        }
      />
    );
  if (!isAdmin)
    return (
      <EmptyState
        title="Administrators only"
        description="Your account does not have permission to view this page."
        action={
          <Button asChild variant="secondary">
            <Link to="/books">Browse books</Link>
          </Button>
        }
      />
    );
  return <>{children}</>;
}

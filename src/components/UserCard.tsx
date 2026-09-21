import { Link } from "@tanstack/react-router";
import { Mail, CalendarDays, BookMarked } from "lucide-react";
import { formatDate, type ProfileRow } from "@/lib/data";

export function UserCard({ profile, borrowedCount }: { profile: ProfileRow; borrowedCount: number }) {
  return (
    <Link
      to="/admin/users/$userId"
      params={{ userId: profile.id }}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
    >
      <h3 className="font-display text-base font-semibold">{profile.full_name || "Unnamed reader"}</h3>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" aria-hidden /> {profile.email}
      </p>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4" aria-hidden /> Registered {formatDate(profile.created_at)}
      </p>
      <p className="flex items-center gap-2 text-xs font-medium text-foreground">
        <BookMarked className="h-4 w-4" aria-hidden /> {borrowedCount} book
        {borrowedCount === 1 ? "" : "s"} borrowed
      </p>
    </Link>
  );
}

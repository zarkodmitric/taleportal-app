import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { fetchMyBorrowings, fetchProfile, formatDate } from "@/lib/data";
import { BorrowingCard } from "@/components/BorrowingCard";
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from "@/components/common";
import { AdminRoute } from "@/components/guards";
import { useReturnBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/admin/users/$userId")({
  head: () => ({
    meta: [
      { title: "User details — BookNest Library" },
      { name: "description", content: "A member's profile and full borrowing history." },
      { property: "og:title", content: "User details — BookNest Library" },
      { property: "og:description", content: "A member's profile and full borrowing history." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <UserDetails />
    </AdminRoute>
  ),
});

function UserDetails() {
  const { userId } = Route.useParams();
  const ret = useReturnBook();
  const profile = useQuery({ queryKey: ["profile", userId], queryFn: () => fetchProfile(userId) });
  const borrowings = useQuery({
    queryKey: ["borrowings", userId],
    queryFn: () => fetchMyBorrowings(userId),
  });

  if (profile.isLoading || borrowings.isLoading) return <LoadingSpinner />;
  const error = profile.error || borrowings.error;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!profile.data) return <EmptyState title="User not found" />;

  const list = borrowings.data ?? [];

  return (
    <div className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to users
      </Link>

      <PageHeader
        title={profile.data.full_name || "Unnamed reader"}
        subtitle={`${profile.data.email} · registered ${formatDate(profile.data.created_at)}`}
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Borrowing history</h2>
        {list.length === 0 ? (
          <EmptyState title="No borrowings yet" description="This member has not borrowed any books." />
        ) : (
          list.map((b) => (
            <BorrowingCard
              key={b.id}
              borrowing={b}
              onReturn={(id) => ret.mutate(id)}
              returning={ret.isPending && ret.variables === b.id}
            />
          ))
        )}
      </section>
    </div>
  );
}

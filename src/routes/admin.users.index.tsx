import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAllBorrowings, fetchProfiles } from "@/lib/data";
import { UserCard } from "@/components/UserCard";
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from "@/components/common";
import { AdminRoute } from "@/components/guards";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({
    meta: [
      { title: "Users — BookNest Library" },
      { name: "description", content: "Administrators can review registered members and their loans." },
      { property: "og:title", content: "Users — BookNest Library" },
      { property: "og:description", content: "Review registered members and their loans." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <UsersPage />
    </AdminRoute>
  ),
});

function UsersPage() {
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: fetchProfiles });
  const borrowings = useQuery({ queryKey: ["all-borrowings"], queryFn: fetchAllBorrowings });

  const loading = profiles.isLoading || borrowings.isLoading;
  const error = profiles.error || borrowings.error;

  function countFor(userId: string) {
    return (borrowings.data ?? []).filter((b) => b.user_id === userId && b.status === "borrowed").length;
  }

  return (
    <div>
      <PageHeader title="Registered users" subtitle="Select a member to see their borrowing history." />
      {loading ? <LoadingSpinner /> : null}
      {error ? <ErrorMessage message={(error as Error).message} /> : null}
      {profiles.data && profiles.data.length === 0 ? (
        <EmptyState title="No members yet" description="Registered readers will appear here." />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles.data ?? []).map((p) => (
          <UserCard key={p.id} profile={p} borrowedCount={countFor(p.id)} />
        ))}
      </div>
    </div>
  );
}

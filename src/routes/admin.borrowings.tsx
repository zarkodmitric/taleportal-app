import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAllBorrowings, fetchProfiles } from "@/lib/data";
import { BorrowingCard } from "@/components/BorrowingCard";
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from "@/components/common";
import { AdminRoute } from "@/components/guards";
import { useReturnBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/admin/borrowings")({
  head: () => ({
    meta: [
      { title: "All borrowings — BookNest Library" },
      { name: "description", content: "Every active and past loan across the whole library." },
      { property: "og:title", content: "All borrowings — BookNest Library" },
      { property: "og:description", content: "Every active and past loan across the library." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <AllBorrowings />
    </AdminRoute>
  ),
});

function AllBorrowings() {
  const ret = useReturnBook();
  const [filter, setFilter] = useState<"all" | "borrowed" | "returned">("borrowed");
  const borrowings = useQuery({ queryKey: ["all-borrowings"], queryFn: fetchAllBorrowings });
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: fetchProfiles });

  if (borrowings.isLoading || profiles.isLoading) return <LoadingSpinner />;
  const error = borrowings.error || profiles.error;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  const nameFor = (userId: string) => {
    const p = profiles.data?.find((x) => x.id === userId);
    return p?.full_name || p?.email || "Unknown member";
  };
  const list = (borrowings.data ?? []).filter((b) => filter === "all" || b.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="All borrowings" subtitle="Who has what, and when it is due back." />

      <div className="flex gap-2">
        {(["borrowed", "returned", "all"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition ${
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nothing to show" description="No borrowings match this filter." />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b.id} className="space-y-1">
              <p className="px-1 text-xs uppercase tracking-wide text-muted-foreground">
                <Link to="/admin/users/$userId" params={{ userId: b.user_id }} className="hover:underline">
                  {nameFor(b.user_id)}
                </Link>
              </p>
              <BorrowingCard
                borrowing={b}
                onReturn={(id) => ret.mutate(id)}
                returning={ret.isPending && ret.variables === b.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

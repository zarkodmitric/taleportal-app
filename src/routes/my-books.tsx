import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchMyBorrowings, formatDate } from "@/lib/data";
import { BorrowingCard } from "@/components/BorrowingCard";
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/guards";
import { useAuth } from "@/lib/auth";
import { useReturnBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/my-books")({
  head: () => ({
    meta: [
      { title: "My borrowed books — BookNest Library" },
      { name: "description", content: "Track the books you have borrowed, their due dates and returns." },
      { property: "og:title", content: "My borrowed books — BookNest Library" },
      { property: "og:description", content: "Track your borrowed books, due dates and returns." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <MyBooks />
    </ProtectedRoute>
  ),
});

function MyBooks() {
  const { user, profile } = useAuth();
  const ret = useReturnBook();
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-borrowings", user?.id],
    queryFn: () => fetchMyBorrowings(user!.id),
    enabled: Boolean(user?.id),
  });

  const active = data?.filter((b) => b.status === "borrowed") ?? [];
  const past = data?.filter((b) => b.status === "returned") ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="My borrowed books"
        subtitle={
          profile
            ? `${profile.full_name || profile.email} · member since ${formatDate(profile.created_at)}`
            : undefined
        }
      />

      {isLoading ? <LoadingSpinner label="Loading your loans…" /> : null}
      {error ? <ErrorMessage message={(error as Error).message} /> : null}

      {data && data.length === 0 ? (
        <EmptyState
          title="You haven't borrowed any books yet"
          description="Find something to read in the catalogue."
          action={
            <Button asChild>
              <Link to="/books">Browse books</Link>
            </Button>
          }
        />
      ) : null}

      {active.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Currently borrowed</h2>
          {active.map((b) => (
            <BorrowingCard
              key={b.id}
              borrowing={b}
              onReturn={(id) => ret.mutate(id)}
              returning={ret.isPending && ret.variables === b.id}
            />
          ))}
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Returned</h2>
          {past.map((b) => (
            <BorrowingCard key={b.id} borrowing={b} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

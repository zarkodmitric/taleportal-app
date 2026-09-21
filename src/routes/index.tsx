import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Library, Users } from "lucide-react";
import { fetchBooks } from "@/lib/data";
import { BookList } from "@/components/BookCard";
import { LoadingSpinner, ErrorMessage } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useBorrowBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BookNest Library — Borrow books from your local library" },
      {
        name: "description",
        content:
          "BookNest Library lets you browse the catalogue, borrow available books and track your due dates.",
      },
      { property: "og:title", content: "BookNest Library" },
      {
        property: "og:description",
        content: "Browse the catalogue, borrow available books and track your due dates.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const borrow = useBorrowBook();
  const { data: books, isLoading, error } = useQuery({ queryKey: ["books"], queryFn: fetchBooks });

  const total = books?.length ?? 0;
  const availableCopies = books?.reduce((sum, b) => sum + b.available_copies, 0) ?? 0;
  const totalCopies = books?.reduce((sum, b) => sum + b.total_copies, 0) ?? 0;
  const borrowedCopies = totalCopies - availableCopies;

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-border bg-card px-6 py-12 shadow-sm sm:px-10">
        <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
          <Library className="h-4 w-4 text-accent" aria-hidden /> Welcome to
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          BookNest Library
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          A calm, well-kept shelf for your community. Browse the catalogue, borrow what you like, and
          keep an eye on your due dates — every loan runs for 14 days.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/books">Browse books</Link>
          </Button>
          {user ? (
            <Button asChild size="lg" variant="secondary">
              <Link to="/my-books">My borrowed books</Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<BookOpen className="h-5 w-5" />} label="Titles in catalogue" value={total} />
        <Stat icon={<Library className="h-5 w-5" />} label="Copies available" value={availableCopies} />
        <Stat icon={<Users className="h-5 w-5" />} label="Copies borrowed" value={borrowedCopies} />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Available now</h2>
          <Link to="/books" className="text-sm font-medium underline-offset-4 hover:underline">
            See all books
          </Link>
        </div>
        {isLoading ? <LoadingSpinner label="Loading books…" /> : null}
        {error ? <ErrorMessage message={(error as Error).message} /> : null}
        {books ? (
          <BookList
            books={books.filter((b) => b.available_copies > 0).slice(0, 4)}
            onBorrow={user ? (book) => borrow.mutate(book.id) : undefined}
            borrowingId={borrow.isPending ? (borrow.variables as string) : null}
          />
        ) : null}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

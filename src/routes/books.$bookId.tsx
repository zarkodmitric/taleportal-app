import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowLeft } from "lucide-react";
import { fetchBook } from "@/lib/data";
import { LoadingSpinner, ErrorMessage, EmptyState } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useBorrowBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/books/$bookId")({
  head: () => ({
    meta: [
      { title: "Book details — BookNest Library" },
      { name: "description", content: "Full details, availability and borrowing for this title." },
      { property: "og:title", content: "Book details — BookNest Library" },
      { property: "og:description", content: "Full details, availability and borrowing for this title." },
    ],
  }),
  component: BookDetails,
});

function BookDetails() {
  const { bookId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const borrow = useBorrowBook();
  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => fetchBook(bookId),
  });

  if (isLoading) return <LoadingSpinner label="Loading book…" />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!book)
    return (
      <EmptyState
        title="Book not found"
        description="This title may have been removed from the catalogue."
        action={
          <Button asChild variant="secondary">
            <Link to="/books">Back to catalogue</Link>
          </Button>
        }
      />
    );

  const available = book.available_copies > 0;

  return (
    <div className="space-y-6">
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to catalogue
      </Link>

      <div className="grid gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:grid-cols-[280px_1fr] md:p-8">
        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{book.title}</h1>
            <Badge variant={available ? "default" : "secondary"}>
              {available ? "Available" : "All copies borrowed"}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{book.author}</p>

          <dl className="grid gap-3 sm:grid-cols-3">
            <Detail label="Category" value={book.category ?? "—"} />
            <Detail label="Published" value={book.publication_year?.toString() ?? "—"} />
            <Detail label="Copies" value={`${book.available_copies} / ${book.total_copies} available`} />
          </dl>

          <p className="leading-relaxed text-foreground/90">
            {book.description || "No description has been added for this book yet."}
          </p>

          <div className="space-y-3 pt-2">
            {!user ? (
              <p className="rounded-xl bg-secondary p-4 text-sm">
                Please{" "}
                <Link to="/login" className="font-medium underline underline-offset-4">
                  log in
                </Link>{" "}
                or{" "}
                <Link to="/register" className="font-medium underline underline-offset-4">
                  register
                </Link>{" "}
                to borrow this book.
              </p>
            ) : !available ? (
              <p className="rounded-xl bg-secondary p-4 text-sm">
                Every copy is currently borrowed. Please check back after the due date.
              </p>
            ) : (
              <Button size="lg" disabled={borrow.isPending} onClick={() => borrow.mutate(book.id)}>
                {borrow.isPending ? "Borrowing…" : "Borrow this book"}
              </Button>
            )}

            {isAdmin ? (
              <div>
                <Button asChild variant="secondary" size="sm">
                  <Link to="/admin/books/$bookId/edit" params={{ bookId: book.id }}>
                    Edit this book
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { Book } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BookCard({
  book,
  onBorrow,
  borrowing,
}: {
  book: Book;
  onBorrow?: ((book: Book) => void) | undefined;
  borrowing?: boolean | undefined;
}) {
  const available = book.available_copies > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <Link
        to="/books/$bookId"
        params={{ bookId: book.id }}
        className="block aspect-[3/4] overflow-hidden bg-secondary"
      >
        {book.cover_image_url ? (
          <img
            src={book.cover_image_url}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" aria-hidden />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">
            <Link to="/books/$bookId" params={{ bookId: book.id }} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <Badge variant={available ? "default" : "secondary"}>
            {available ? "Available" : "Borrowed"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        <p className="text-xs text-muted-foreground">
          {[book.category, book.publication_year].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-muted-foreground">
          {book.available_copies} of {book.total_copies} copies available
        </p>

        {onBorrow ? (
          <Button
            className="mt-auto"
            size="sm"
            disabled={!available || borrowing}
            onClick={() => onBorrow(book)}
          >
            {available ? (borrowing ? "Borrowing…" : "Borrow") : "Unavailable"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function BookList({
  books,
  onBorrow,
  borrowingId,
}: {
  books: Book[];
  onBorrow?: ((book: Book) => void) | undefined;
  borrowingId?: string | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onBorrow={onBorrow}
          borrowing={borrowingId === book.id}
        />
      ))}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { formatDate, type BorrowingWithBook } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BorrowingCard({
  borrowing,
  onReturn,
  returning,
}: {
  borrowing: BorrowingWithBook;
  onReturn?: (id: string) => void;
  returning?: boolean;
}) {
  const isOut = borrowing.status === "borrowed";
  const overdue = isOut && new Date(borrowing.due_date) < new Date();

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold">
          {borrowing.books ? (
            <Link
              to="/books/$bookId"
              params={{ bookId: borrowing.books.id }}
              className="hover:underline"
            >
              {borrowing.books.title}
            </Link>
          ) : (
            "Removed book"
          )}
        </h3>
        <p className="text-sm text-muted-foreground">{borrowing.books?.author ?? "—"}</p>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
          <div>
            <dt className="inline font-medium">Borrowed: </dt>
            <dd className="inline">{formatDate(borrowing.borrowed_at)}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Due: </dt>
            <dd className="inline">{formatDate(borrowing.due_date)}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Returned: </dt>
            <dd className="inline">{formatDate(borrowing.returned_at)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Badge variant={isOut ? (overdue ? "destructive" : "default") : "secondary"}>
          {isOut ? (overdue ? "Overdue" : "Borrowed") : "Returned"}
        </Badge>
        {onReturn && isOut ? (
          <Button size="sm" variant="secondary" disabled={returning} onClick={() => onReturn(borrowing.id)}>
            {returning ? "Returning…" : "Return book"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

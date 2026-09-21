import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteBook, fetchBook, updateBook, type BookInput } from "@/lib/data";
import { BookForm } from "@/components/BookForm";
import { PageHeader, ErrorMessage, LoadingSpinner, EmptyState } from "@/components/common";
import { AdminRoute } from "@/components/guards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/books/$bookId/edit")({
  head: () => ({
    meta: [
      { title: "Edit book — BookNest Library" },
      { name: "description", content: "Administrators can edit or remove a title from the catalogue." },
      { property: "og:title", content: "Edit book — BookNest Library" },
      { property: "og:description", content: "Edit or remove a title from the catalogue." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <EditBook />
    </AdminRoute>
  ),
});

function EditBook() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: book, isLoading, error } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => fetchBook(bookId),
  });

  const save = useMutation({
    mutationFn: (input: BookInput) =>
      updateBook(bookId, input, book!.total_copies, book!.available_copies),
    onSuccess: () => {
      toast.success("Book updated.");
      void qc.invalidateQueries();
      navigate({ to: "/books/$bookId", params: { bookId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteBook(bookId),
    onSuccess: () => {
      toast.success("Book deleted.");
      void qc.invalidateQueries();
      navigate({ to: "/books" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <LoadingSpinner label="Loading book…" />;
  if (error) return <ErrorMessage message={(error as Error).message} />;
  if (!book) return <EmptyState title="Book not found" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Edit book" subtitle={book.title} />
      <BookForm
        initial={book}
        submitLabel="Save changes"
        submitting={save.isPending}
        onSubmit={(input) => save.mutate(input)}
      />
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="font-display text-base font-semibold">Remove from inventory</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleting a book also removes its borrowing history.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3"
          disabled={remove.isPending}
          onClick={() => remove.mutate()}
        >
          {remove.isPending ? "Deleting…" : "Delete book"}
        </Button>
      </div>
    </div>
  );
}

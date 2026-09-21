import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBook, type BookInput } from "@/lib/data";
import { BookForm } from "@/components/BookForm";
import { PageHeader, ErrorMessage } from "@/components/common";
import { AdminRoute } from "@/components/guards";

export const Route = createFileRoute("/admin/books/new")({
  head: () => ({
    meta: [
      { title: "Add a book — BookNest Library" },
      { name: "description", content: "Administrators can add a new title to the BookNest catalogue." },
      { property: "og:title", content: "Add a book — BookNest Library" },
      { property: "og:description", content: "Add a new title to the BookNest catalogue." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <AddBook />
    </AdminRoute>
  ),
});

function AddBook() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: BookInput) => createBook(input),
    onSuccess: () => {
      toast.success("Book added to the catalogue.");
      void qc.invalidateQueries({ queryKey: ["books"] });
      navigate({ to: "/books" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add a book" subtitle="New titles appear in the catalogue immediately." />
      {mutation.error ? <ErrorMessage message={(mutation.error as Error).message} /> : null}
      <div className="mt-4">
        <BookForm
          submitLabel="Add book"
          submitting={mutation.isPending}
          onSubmit={(input) => mutation.mutate(input)}
        />
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Library, Users, BookMarked } from "lucide-react";
import { fetchAllBorrowings, fetchBooks, fetchProfiles } from "@/lib/data";
import { LoadingSpinner, ErrorMessage, PageHeader } from "@/components/common";
import { AdminRoute } from "@/components/guards";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — BookNest Library" },
      { name: "description", content: "Library statistics and management tools for administrators." },
      { property: "og:title", content: "Admin dashboard — BookNest Library" },
      { property: "og:description", content: "Library statistics and management tools." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  ),
});

function AdminDashboard() {
  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const profiles = useQuery({ queryKey: ["profiles"], queryFn: fetchProfiles });
  const borrowings = useQuery({ queryKey: ["all-borrowings"], queryFn: fetchAllBorrowings });

  const loading = books.isLoading || profiles.isLoading || borrowings.isLoading;
  const error = books.error || profiles.error || borrowings.error;

  const availableCopies = books.data?.reduce((s, b) => s + b.available_copies, 0) ?? 0;
  const activeLoans = borrowings.data?.filter((b) => b.status === "borrowed").length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Admin dashboard" subtitle="Inventory, members and active loans at a glance." />

      {loading ? <LoadingSpinner /> : null}
      {error ? <ErrorMessage message={(error as Error).message} /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={<BookOpen className="h-5 w-5" />} label="Total titles" value={books.data?.length ?? 0} />
            <Stat icon={<Library className="h-5 w-5" />} label="Copies available" value={availableCopies} />
            <Stat icon={<Users className="h-5 w-5" />} label="Registered users" value={profiles.data?.length ?? 0} />
            <Stat icon={<BookMarked className="h-5 w-5" />} label="Active borrowings" value={activeLoans} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/books/new">Add a book</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/books">Manage inventory</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/users">View users</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/borrowings">All borrowings</Link>
            </Button>
          </div>
        </>
      ) : null}
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

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchBooks } from "@/lib/data";
import { BookList } from "@/components/BookCard";
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useBorrowBook } from "@/lib/useBorrow";

export const Route = createFileRoute("/books/")({
  head: () => ({
    meta: [
      { title: "Books — BookNest Library" },
      {
        name: "description",
        content: "Search the full BookNest catalogue by title, author or category and borrow a book.",
      },
      { property: "og:title", content: "Books — BookNest Library" },
      {
        property: "og:description",
        content: "Search the full BookNest catalogue by title, author or category.",
      },
    ],
  }),
  component: BooksPage,
});

function BooksPage() {
  const { user } = useAuth();
  const borrow = useBorrowBook();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: books, isLoading, error } = useQuery({ queryKey: ["books"], queryFn: fetchBooks });

  const categories = useMemo(
    () => Array.from(new Set((books ?? []).map((b) => b.category).filter(Boolean))) as string[],
    [books],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (books ?? []).filter((b) => {
      const matches =
        !term || b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term);
      const inCategory = category === "all" || b.category === category;
      return matches && inCategory;
    });
  }, [books, search, category]);

  return (
    <div>
      <PageHeader title="Catalogue" subtitle="Every book on the shelves, with live availability." />

      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="search">Search by title or author</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="search"
              className="pl-9"
              placeholder="e.g. Tolkien"
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm sm:w-48"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <LoadingSpinner label="Loading catalogue…" /> : null}
      {error ? <ErrorMessage message={(error as Error).message} /> : null}
      {books && filtered.length === 0 ? (
        <EmptyState title="No books match your search" description="Try another title, author or category." />
      ) : null}
      {filtered.length > 0 ? (
        <BookList
          books={filtered}
          onBorrow={user ? (book) => borrow.mutate(book.id) : undefined}
          borrowingId={borrow.isPending ? (borrow.variables as string) : null}
        />
      ) : null}
    </div>
  );
}

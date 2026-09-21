import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Borrowing = Database["public"]["Tables"]["borrowings"]["Row"];
export type BorrowingWithBook = Borrowing & { books: Book | null };
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function fetchBooks(): Promise<Book[]> {
  return unwrap(await supabase.from("books").select("*").order("title"));
}

export async function fetchBook(id: string): Promise<Book | null> {
  return unwrap(await supabase.from("books").select("*").eq("id", id).maybeSingle());
}

export async function fetchMyBorrowings(userId: string): Promise<BorrowingWithBook[]> {
  return unwrap(
    await supabase
      .from("borrowings")
      .select("*, books(*)")
      .eq("user_id", userId)
      .order("borrowed_at", { ascending: false }),
  );
}

export async function fetchAllBorrowings(): Promise<BorrowingWithBook[]> {
  return unwrap(
    await supabase
      .from("borrowings")
      .select("*, books(*)")
      .order("borrowed_at", { ascending: false }),
  );
}

export async function fetchProfiles(): Promise<ProfileRow[]> {
  return unwrap(await supabase.from("profiles").select("*").order("created_at"));
}

export async function fetchProfile(id: string): Promise<ProfileRow | null> {
  return unwrap(await supabase.from("profiles").select("*").eq("id", id).maybeSingle());
}

export async function borrowBook(bookId: string) {
  const { error } = await supabase.rpc("borrow_book", { _book_id: bookId });
  if (error) throw new Error(error.message);
}

export async function returnBook(borrowingId: string) {
  const { error } = await supabase.rpc("return_book", { _borrowing_id: borrowingId });
  if (error) throw new Error(error.message);
}

export type BookInput = {
  title: string;
  author: string;
  description: string;
  category: string;
  publication_year: number | null;
  cover_image_url: string;
  total_copies: number;
};

export async function createBook(input: BookInput) {
  const { error } = await supabase.from("books").insert({
    ...input,
    available_copies: input.total_copies,
  });
  if (error) throw new Error(error.message);
}

export async function updateBook(id: string, input: BookInput, previousTotal: number, availableNow: number) {
  const diff = input.total_copies - previousTotal;
  const available = Math.max(0, Math.min(availableNow + diff, input.total_copies));
  const { error } = await supabase
    .from("books")
    .update({ ...input, available_copies: available })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBook(id: string) {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

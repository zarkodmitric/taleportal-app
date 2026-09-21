import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { borrowBook, returnBook } from "@/lib/data";

export function useBorrowBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => borrowBook(bookId),
    onSuccess: () => {
      toast.success("Book borrowed — it is due in 14 days.");
      void qc.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useReturnBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (borrowingId: string) => returnBook(borrowingId),
    onSuccess: () => {
      toast.success("Book returned. Thank you!");
      void qc.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

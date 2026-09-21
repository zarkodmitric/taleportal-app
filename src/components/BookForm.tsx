import { useState } from "react";
import type { Book, BookInput } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CURRENT_YEAR = new Date().getFullYear();

export function BookForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
}: {
  initial?: Book;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (input: BookInput) => void;
}) {
  const [values, setValues] = useState<BookInput>({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    publication_year: initial?.publication_year ?? null,
    cover_image_url: initial?.cover_image_url ?? "",
    total_copies: initial?.total_copies ?? 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (values['title'].trim().length < 2) next['title'] = "Title must be at least 2 characters.";
    if (values['author'].trim().length < 2) next['author'] = "Author must be at least 2 characters.";
    if (values['category'].trim().length === 0) next['category'] = "Please enter a category.";
    if (
      values['publication_year'] !== null &&
      (values['publication_year'] < 1000 || values['publication_year'] > CURRENT_YEAR)
    )
      next['publication_year'] = `Enter a year between 1000 and ${CURRENT_YEAR}.`;
    if (values['cover_image_url'] && !/^https?:\/\/\S+$/.test(values['cover_image_url']))
      next['cover_image_url'] = "Enter a valid URL starting with http:// or https://";
    if (!Number.isInteger(values['total_copies']) || values['total_copies'] < 1)
      next['total_copies'] = "Enter at least 1 copy.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <form
      noValidate
      className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
          ...values,
          title: values['title'].trim(),
          author: values['author'].trim(),
          category: values['category'].trim(),
          description: values['description'].trim(),
          cover_image_url: values['cover_image_url'].trim(),
        });
      }}
    >
      <Field id="title" label="Title" error={errors['title']}>
        <Input
          id="title"
          value={values['title']}
          maxLength={200}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>

      <Field id="author" label="Author" error={errors['author']}>
        <Input
          id="author"
          value={values['author']}
          maxLength={150}
          onChange={(e) => set("author", e.target.value)}
        />
      </Field>

      <Field id="description" label="Description" error={errors['description']}>
        <Textarea
          id="description"
          rows={4}
          maxLength={2000}
          value={values['description']}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category" label="Category" error={errors['category']}>
          <Input
            id="category"
            value={values['category']}
            maxLength={60}
            onChange={(e) => set("category", e.target.value)}
          />
        </Field>

        <Field id="publication_year" label="Publication year" error={errors['publication_year']}>
          <Input
            id="publication_year"
            type="number"
            value={values['publication_year'] ?? ""}
            onChange={(e) =>
              set("publication_year", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Field>
      </div>

      <Field id="cover_image_url" label="Cover image URL" error={errors['cover_image_url']}>
        <Input
          id="cover_image_url"
          placeholder="https://…"
          value={values['cover_image_url']}
          onChange={(e) => set("cover_image_url", e.target.value)}
        />
      </Field>

      <Field id="total_copies" label="Number of copies" error={errors['total_copies']}>
        <Input
          id="total_copies"
          type="number"
          min={1}
          value={values['total_copies']}
          onChange={(e) => set("total_copies", Number(e.target.value))}
        />
      </Field>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Library, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string };

function useNavItems(): NavItem[] {
  const { user, isAdmin } = useAuth();
  const items: NavItem[] = [
    { to: "/", label: "Home" },
    { to: "/books", label: "Books" },
  ];
  if (user) items.push({ to: "/my-books", label: "My Borrowed Books" });
  if (isAdmin) {
    items.push(
      { to: "/admin", label: "Admin Dashboard" },
      { to: "/admin/books/new", label: "Add Book" },
      { to: "/admin/users", label: "Users" },
    );
  }
  return items;
}

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const items = useNavItems();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Library className="h-6 w-6 text-accent" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight">BookNest Library</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium opacity-80 transition hover:bg-primary-foreground/10 hover:opacity-100 data-[status=active]:bg-primary-foreground/15 data-[status=active]:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <span className="max-w-[12rem] truncate text-sm opacity-80">
                {profile?.full_name || user.email}
              </span>
              <Button variant="secondary" size="sm" onClick={handleSignOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hover:bg-primary-foreground/10">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-primary-foreground/10 px-4 pb-4 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1 pt-2">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium opacity-90 hover:bg-primary-foreground/10"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            {user ? (
              <Button variant="secondary" size="sm" className="w-full" onClick={handleSignOut}>
                Logout
              </Button>
            ) : (
              <>
                <Button asChild size="sm" variant="secondary" className="flex-1">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm" variant="secondary" className="flex-1">
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base font-semibold text-foreground">BookNest Library</p>
        <p>Borrow freely. Return kindly. Books are due 14 days after borrowing.</p>
      </div>
    </footer>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
      <Footer />
    </div>
  );
}

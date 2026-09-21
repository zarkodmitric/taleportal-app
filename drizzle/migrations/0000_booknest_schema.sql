-- ROLES
create type public.app_role as enum ('user','admin');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

-- USER ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "admins read profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create policy "own roles read" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins read roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- BOOKS
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text,
  category text,
  publication_year integer,
  cover_image_url text,
  total_copies integer not null default 1 check (total_copies >= 0),
  available_copies integer not null default 1 check (available_copies >= 0),
  created_at timestamptz not null default now()
);
grant select on public.books to anon;
grant select, insert, update, delete on public.books to authenticated;
grant all on public.books to service_role;
alter table public.books enable row level security;
create policy "books public read" on public.books for select to anon, authenticated using (true);
create policy "admins insert books" on public.books for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admins update books" on public.books for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins delete books" on public.books for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create index books_title_idx on public.books (title);
create index books_author_idx on public.books (author);
create index books_category_idx on public.books (category);

-- BORROWINGS
create table public.borrowings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  borrowed_at timestamptz not null default now(),
  due_date date not null default (current_date + 14),
  returned_at timestamptz,
  status text not null default 'borrowed' check (status in ('borrowed','returned'))
);
grant select on public.borrowings to authenticated;
grant all on public.borrowings to service_role;
alter table public.borrowings enable row level security;
create policy "own borrowings read" on public.borrowings for select to authenticated using (auth.uid() = user_id);
create policy "admins read borrowings" on public.borrowings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create index borrowings_user_idx on public.borrowings (user_id);
create index borrowings_book_idx on public.borrowings (book_id);
create index borrowings_status_idx on public.borrowings (status);

-- SIGNUP TRIGGER: profile + role (first ever user becomes admin)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''));

  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- BORROW / RETURN
create or replace function public.borrow_book(_book_id uuid)
returns public.borrowings language plpgsql security definer set search_path = public as $$
declare _row public.borrowings; _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if exists (select 1 from public.borrowings where user_id = _uid and book_id = _book_id and status = 'borrowed') then
    raise exception 'You already borrowed this book';
  end if;
  update public.books set available_copies = available_copies - 1
    where id = _book_id and available_copies > 0;
  if not found then raise exception 'Book is not available'; end if;
  insert into public.borrowings (user_id, book_id) values (_uid, _book_id) returning * into _row;
  return _row;
end;
$$;

create or replace function public.return_book(_borrowing_id uuid)
returns public.borrowings language plpgsql security definer set search_path = public as $$
declare _row public.borrowings; _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  update public.borrowings set status = 'returned', returned_at = now()
   where id = _borrowing_id and status = 'borrowed'
     and (user_id = _uid or public.has_role(_uid,'admin'))
   returning * into _row;
  if _row.id is null then raise exception 'Borrowing not found or already returned'; end if;
  update public.books set available_copies = least(available_copies + 1, total_copies) where id = _row.book_id;
  return _row;
end;
$$;

grant execute on function public.borrow_book(uuid) to authenticated;
grant execute on function public.return_book(uuid) to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon;

-- SAMPLE BOOKS
insert into public.books (title, author, description, category, publication_year, cover_image_url, total_copies, available_copies) values
('The Hobbit','J.R.R. Tolkien','Bilbo Baggins is swept into a quest to reclaim a treasure guarded by a dragon.','Fantasy',1937,'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',3,3),
('Dune','Frank Herbert','A desert planet, a noble family, and the most valuable substance in the universe.','Science Fiction',1965,'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&q=80',2,2),
('Pride and Prejudice','Jane Austen','Elizabeth Bennet navigates manners, morality and marriage in Georgian England.','Classic',1813,'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',4,4),
('Sapiens','Yuval Noah Harari','A sweeping history of humankind from the Stone Age to the present.','History',2011,'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=600&q=80',2,2),
('Clean Code','Robert C. Martin','A handbook of agile software craftsmanship for writing readable code.','Technology',2008,'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80',2,2),
('The Silent Patient','Alex Michaelides','A psychotherapist becomes obsessed with uncovering his patient''s silence.','Thriller',2019,'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',1,1),
('Atomic Habits','James Clear','Tiny changes, remarkable results: a proven framework for better habits.','Self-Help',2018,'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',3,3),
('One Hundred Years of Solitude','Gabriel García Márquez','The multi-generational story of the Buendía family in Macondo.','Classic',1967,'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600&q=80',2,2);

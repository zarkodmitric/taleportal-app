# BookNest Library

Create a full-stack web application called "BookNest Library".

APPLICATION GOAL:

The goal of this application is to manage a library and allow users to browse books, register, log in, and borrow books. The application should help library administrators manage books and users, while regular users can view available books and manage their borrowed books.

TECHNOLOGY:

- Use React with TypeScript.

- Use Tailwind CSS for styling.

- Use Supabase for the database and authentication.

- Use React Router for navigation.

- Create a responsive web application that works on desktop, tablet, and mobile devices.

USER TYPES:

1. Regular User:

- Register an account.

- Log in and log out.

- Browse available books.

- View book details.

- Borrow available books.

- View their borrowed books.

- Return borrowed books.

- View their profile information.

2. Administrator:

- Log in to the application.

- Add new books.

- Edit book information.

- Delete books.

- View all registered users.

- View all borrowed books.

- View which books are borrowed by each user.

- Manage library inventory.

MAIN PAGES:

1. HOME PAGE:

- Display the application name "BookNest Library".

- Include a navigation bar.

- Display a welcome message.

- Show statistics such as total books, available books, and borrowed books.

- Display a selection of available books.

- Include buttons for browsing books and logging in.

- Use a clean and modern library design.

2. BOOKS PAGE:

- Display all books stored in the Supabase database.

- Show books in a responsive card layout.

- Each book card should display:

  - Book cover image.

  - Title.

  - Author.

  - Category.

  - Publication year.

  - Availability status.

- Add a search bar for searching books by title or author.

- Add filtering by category.

- Allow users to click on a book and open its details page.

- Include a button to borrow an available book.

- Disable the borrow button when the book is unavailable.

3. BOOK DETAILS PAGE:

- Display detailed information about a selected book.

- Show the title, author, description, category, publication year, and availability.

- Display the current availability status.

- Allow authenticated users to borrow the book if it is available.

- Show an appropriate message if the user is not logged in.

- Show an appropriate message if the book is already borrowed.

4. ADD BOOK PAGE:

- Create a form for adding a new book.

- The form should include:

  - Title.

  - Author.

  - Description.

  - Category.

  - Publication year.

  - Cover image URL.

  - Number of available copies.

- Validate the form fields.

- Save the submitted book information to the Supabase database.

- Display a success message after adding a book.

- Display an error message if the operation fails.

- Only administrators should have access to this page.

5. USERS PAGE:

- Display all registered users from the database.

- Show user information such as name, email, and registration date.

- Display the number of books borrowed by each user.

- Allow administrators to click on a user and open the user's details page.

6. USER DETAILS PAGE:

- Display detailed information about a selected user.

- Show the user's name and email.

- Display a list of all books borrowed by that user.

- For each borrowed book, show:

  - Book title.

  - Author.

  - Borrow date.

  - Due date.

  - Return status.

- Retrieve the user's borrowed books from the Supabase database.

- Display a message if the user has not borrowed any books.

- Only administrators should be able to view all users' details.

7. MY BORROWED BOOKS PAGE:

- Display all books borrowed by the currently logged-in user.

- Show the book title, author, borrow date, due date, and return status.

- Include a button to return a book.

- Update the database when a book is returned.

- Display a message if the user has no borrowed books.

8. LOGIN PAGE:

- Create a login form with email and password.

- Use Supabase Authentication.

- Display validation errors.

- Redirect the user to the home page after successful login.

- Include a link to the registration page.

9. REGISTER PAGE:

- Create a registration form with:

  - Full name.

  - Email.

  - Password.

  - Confirm password.

- Validate the form fields.

- Use Supabase Authentication for registration.

- Save additional user information in a profiles table.

- Display appropriate error messages.

- Redirect the user after successful registration.

10. ADMIN DASHBOARD:

- Create a dashboard for administrators.

- Display statistics:

  - Total books.

  - Available books.

  - Total users.

  - Active borrowings.

- Include links to manage books, users, and borrowings.

- Protect the dashboard so only administrators can access it.

DATABASE STRUCTURE:

Use Supabase PostgreSQL database.

Create the following tables:

1. profiles:

- id (UUID, primary key, linked to auth.users)

- full_name (text)

- email (text)

- role (text, either "user" or "admin")

- created_at (timestamp)

2. books:

- id (UUID, primary key)

- title (text, required)

- author (text, required)

- description (text)

- category (text)

- publication_year (integer)

- cover_image_url (text)

- total_copies (integer)

- available_copies (integer)

- created_at (timestamp)

3. borrowings:

- id (UUID, primary key)

- user_id (UUID, foreign key referencing profiles)

- book_id (UUID, foreign key referencing books)

- borrowed_at (timestamp)

- due_date (date)

- returned_at (timestamp, nullable)

- status (text, either "borrowed" or "returned")

DATABASE RELATIONSHIPS:

- One user can have multiple borrowings.

- One book can be borrowed multiple times over time.

- Each borrowing belongs to one user and one book.

- Use foreign keys to connect the tables.

- Create appropriate indexes for frequently queried fields.

BORROWING FUNCTIONALITY:

- Only authenticated users can borrow books.

- A user can borrow a book only if available_copies is greater than zero.

- When a book is borrowed:

  - Create a new record in the borrowings table.

  - Decrease available_copies by one.

  - Set the borrowing status to "borrowed".

  - Set borrowed_at to the current timestamp.

  - Set due_date to 14 days after the borrowing date.

- When a book is returned:

  - Update the borrowing status to "returned".

  - Set returned_at to the current timestamp.

  - Increase available_copies by one.

- Prevent users from borrowing unavailable books.

- Ensure that only authorized users can perform these actions.

AUTHENTICATION AND SECURITY:

- Use Supabase Authentication for registration and login.

- Implement logout functionality.

- Protect private pages.

- Implement role-based access control for administrators.

- Configure Row Level Security (RLS) policies in Supabase.

- Users should only be able to view and manage their own borrowings.

- Administrators should be able to manage books and view users and borrowings according to their permissions.

- Do not expose sensitive information in the frontend.

NAVIGATION:

Create a responsive navigation bar with:

- Home

- Books

- My Borrowed Books

- Users (admin only)

- Add Book (admin only)

- Admin Dashboard (admin only)

- Login

- Register

- Logout

Use React Router for navigation between pages.

UI DESIGN AND STYLE:

- Use a modern, clean, and professional library design.

- Main colors: dark blue, white, and light beige.

- Use a readable font.

- Use rounded cards and subtle shadows.

- Use consistent spacing and typography.

- Make the design responsive.

- Display loading indicators when fetching data.

- Display user-friendly error messages.

- Display success notifications after successful actions.

- Use accessible forms with clear labels.

- Use icons where appropriate.

- Make the interface easy to understand for beginners.

COMPONENT STRUCTURE:

Create reusable React components:

- Navbar

- Footer

- BookCard

- BookList

- BookForm

- BorrowingCard

- UserCard

- ProtectedRoute

- AdminRoute

- LoadingSpinner

- ErrorMessage

- EmptyState

IMPORTANT REQUIREMENTS:

- The application must use a real Supabase database.

- Forms must save data to Supabase.

- Pages must retrieve and display real data from Supabase.

- Implement working authentication.

- Implement working book borrowing and returning.

- Implement navigation between all pages.

- Ensure that the application is functional, not just a static UI.

- Create a clear and maintainable project structure.

- Provide sample books for testing.

- Explain how to configure Supabase and run the application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://taleportal-app.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d92fc481-1bcb-4690-819c-7a5d5174450e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

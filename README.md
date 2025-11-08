# GEMINI.md

## Project Overview

This is a web application for the NCC Air Wing, built with React, Vite, and TypeScript. It serves as a student information portal, allowing students to manage their profiles, NCC details, and work experience. The application uses Supabase for the backend, including authentication and database storage. The UI is built with shadcn/ui and styled with Tailwind CSS.

The application has the following main features:

*   **Authentication:** Students can sign up, sign in, and reset their passwords. Authentication is handled by Supabase.
*   **Student Portal:** After signing in, students can view and edit their personal information, NCC details, and work experience.
*   **Admin Panel:** Administrators have access to a dashboard where they can view and manage all student records, as well as the content for the Achievements, Announcements, and Gallery pages.
*   **Public Pages:** The application also includes public pages for Achievements, Announcements, and Gallery, which display content managed by the administrators.

## Building and Running

To build and run the project, you need to have Node.js and npm installed.

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the following environment variables:

    ```
    VITE_SUPABASE_URL=<your-supabase-url>
    VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-publishable-key>
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    This will start the development server at `http://localhost:8080`.

4.  **Build for production:**

    ```bash
    npm run build
    ```

    This will create a `dist` directory with the production-ready files.

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. The configuration is in the `tailwind.config.ts` file.
*   **Components:** The UI is built with shadcn/ui components. The components are located in the `src/components/ui` directory.
*   **Routing:** The application uses React Router for routing. The routes are defined in the `src/App.tsx` file.
*   **Authentication:** Authentication is handled by Supabase. The authentication logic is in the `src/context/AuthContext.tsx` file.
*   **Database:** The application uses Supabase for the database. The database schema is defined in the `supabase/migrations` directory.
*   **Linting:** The project uses ESLint for linting. The configuration is in the `eslint.config.js` file.

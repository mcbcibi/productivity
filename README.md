# Productivity To-Do List Web App

A clean, minimal, aesthetic three-pane productivity web application designed inside a large rounded white card on a soft sage-green canvas. Built with **React**, **Vite**, **Tailwind CSS**, **Supabase** backend, and configured for seamless deployment on **Netlify**.

---

## Features

- **Three-Pane Layout**:
  - **Left Sidebar**: Collapsible menu with live search (`/`), smart task views, custom lists with color dots, pastel tag chips, settings, and sign-out.
  - **Center Pane**: Large view title with count badge, sort dropdown (Due Date, Priority, Name A-Z, Created Date, Manual Drag & Drop), status & priority filters, quick add row (`N`), active tasks, and collapsible completed tasks section with confetti celebration.
  - **Right Detail Pane**: Seamless task editing (title, description, list picker, due date picker, priority flags, recurrence selector, tags selector, subtasks with progress bar, delete button, and vibrant `#FFD43B` yellow save button).
- **Specialized Views**:
  - **Today & Upcoming (7 days)**: Smart filtered views.
  - **Calendar View**: Interactive month grid showing scheduled tasks on their due dates with one-click task inspection and creation.
  - **Sticky Wall**: Freeform canvas with colorful draggable notes that persist coordinate positions (`sticky_x`, `sticky_y`) and color palette selections.
- **Subtasks & Progress Tracking**: Subtask checklists with automatic progress bars per task and list.
- **Recurring Tasks**: Daily, Weekly, and Monthly recurrences automatically schedule the next occurrence upon completion.
- **Optimistic UI & Realtime Sync**: Immediate feedback on add, edit, toggle, reorder, and delete with automatic rollback toast on network failure, synchronized across devices via Supabase Realtime channels.
- **Float Midpoint Reordering**: Single-row database position updates for drag-and-drop.
- **Theme Support**: Seamless Dark & Light modes with preferences safely saved in `localStorage`.
- **Keyboard Shortcuts**: `N` = New Task, `/` = Search, `Esc` = Close Detail Pane.

---

## 1. Supabase Setup

1. **Create a Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Database Schema**:
   - Open the **SQL Editor** from the left navigation.
   - Paste the contents of `supabase/schema.sql` into the editor and click **Run**.
   - This creates all necessary tables (`lists`, `tags`, `tasks`, `subtasks`, `task_tags`), Row Level Security (RLS) policies (`auth.uid() = user_id`), triggers, indexes, and enables Realtime publication.
3. **Configure Google OAuth (Optional)**:
   - Navigate to **Authentication > Providers > Google** and toggle it ON.
   - Enter your Google Client ID and Secret if you want Google Sign-in enabled.
4. **Copy API Credentials**:
   - In Supabase, go to **Project Settings > API**.
   - Copy the **Project URL** and the **anon public key**.

---

## 2. Local Run

1. Clone or navigate to the repository directory:
   ```bash
   cd "Productivity Tool"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   *(Note: If left empty, the app runs in **Demo / Mock Mode** with sample data and localStorage persistence so you can test immediately without credentials).*

4. Start the local Vite development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Deploy to Netlify

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In the Netlify dashboard:
   - Click **Add new site > Import an existing project**.
   - Select your Git repository.
3. In **Site configuration > Environment variables**, add the two variables **before the first deploy**:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
4. Confirm build settings (pre-configured via `netlify.toml`):
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy site**.

---

## 4. After Deploying (Supabase URL Configuration)

To ensure email signups, confirmation links, and OAuth redirects operate seamlessly:
1. In your Supabase dashboard, go to **Authentication > URL Configuration**.
2. Set the **Site URL** to your Netlify production URL (e.g., `https://your-app-name.netlify.app`).
3. Add the following to **Redirect URLs**:
   - `https://<your-app-name>.netlify.app/**`
   - `http://localhost:5173/**`
4. Click **Save**.

---

## 5. Troubleshooting

- **Blank data / missing connection**:
  - Vite bakes environment variables into the static bundle at build time. If you added or updated environment variables in Netlify after deploying, go to **Deploys > Trigger deploy > Deploy site** to create a fresh build with the updated keys.
- **Refresh 404 errors on sub-routes**:
  - The included `netlify.toml` contains `[[redirects]] from = "/*" to = "/index.html" status = 200` to properly route all requests to Vite's single-page app root.
- **Realtime updates not reflecting across tabs**:
  - Verify that `supabase_realtime` publication includes all tables (already automated in `supabase/schema.sql`).
- **Database permission denied errors**:
  - Ensure Row Level Security policies have been applied by running `supabase/schema.sql`. Operations automatically verify that `auth.uid() = user_id`.

---

## License

MIT

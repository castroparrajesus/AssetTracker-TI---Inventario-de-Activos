Supabase setup for inventario-ti

1) Create a new project in Supabase
- Go to https://app.supabase.com and create a project.
- Note the project URL and the `anon` (publishable) key.

2) Add redirect URLs for OAuth
- In Supabase dashboard -> Authentication -> Providers -> Google
  - Add these redirect URLs:
    - http://127.0.0.1:5174
    - http://localhost:5174
  - If you run on a different port use that port instead.

3) Database schema
- Open Database -> SQL Editor and paste the contents of `supabase-schema.sql` from the repo.
- Run the script to create tables and example RLS policies.

4) Service Role key (server-only)
- For server-side tasks (migrations, cron jobs) use the SERVICE_ROLE_KEY from Settings -> API.
- NEVER put the Service Role key in the frontend or commit it to source control.

5) Environment variables
- Create a `.env` file in the project root with these entries (Vite reads VITE_ vars):

  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_KEY=your-anon-publishable-key

- Do NOT commit `.env` (it's already in `.gitignore`). Use `.env.example` for a template.

6) Test auth locally
- Start the dev server: `npm run dev`
- Open the app and try the demo credentials or Google sign-in.
- If you get redirect errors, verify the redirect URL in Supabase matches the browser URL exactly.

7) Next steps / production
- For production, set env vars in your hosting provider and ensure HTTPS redirect URLs are registered.
- Remove any hard-coded keys from the repo.

If you want, I can also run the SQL in your Supabase project if you provide temporary access (not recommended) or give step-by-step commands to run in the SQL editor.

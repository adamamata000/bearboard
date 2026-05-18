# 🍺 Beerboard

A live drink leaderboard for nights out with your crew. Dark mode, neon vibes, PWA-ready.

---

## Stack

- **React 18** + **Vite 5**
- **Supabase** — database + realtime subscriptions
- **Tailwind CSS v3**
- **vite-plugin-pwa** — installable on iPhone/Android

---

## 1. Supabase Setup

### Create your project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the following:

```sql
-- Create the drinks table
CREATE TABLE drinks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code   text        NOT NULL,
  username     text        NOT NULL,
  total_count  integer     NOT NULL DEFAULT 0,
  beer_count   integer     NOT NULL DEFAULT 0,
  liquor_count integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT drinks_group_username_unique UNIQUE (group_code, username)
);

-- Index for fast leaderboard queries
CREATE INDEX idx_drinks_group_code ON drinks (group_code, total_count DESC);

-- Enable Row Level Security
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all rows (public leaderboard)
CREATE POLICY "Public read"
  ON drinks FOR SELECT
  USING (true);

-- Allow anyone to insert new rows
CREATE POLICY "Public insert"
  ON drinks FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update counts (app controls logic)
CREATE POLICY "Public update"
  ON drinks FOR UPDATE
  USING (true);

-- Enable Realtime on the drinks table
ALTER PUBLICATION supabase_realtime ADD TABLE drinks;
```

3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

---

## 2. Local Development

```bash
# Clone / create the project folder and install deps
npm install

# Copy env file and fill in your Supabase values
cp .env.example .env
# Edit .env:
#   VITE_SUPABASE_URL=https://xxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Start dev server
npm run dev
# Open http://localhost:5173
```

---

## 3. Deploy to Vercel

### Option A — Vercel CLI
```bash
npm install -g vercel
vercel

# Follow prompts. When asked for environment variables, add:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
```

### Option B — Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Framework Preset: **Vite**
4. Add Environment Variables:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
5. Click **Deploy**

The `vercel.json` handles SPA routing automatically.

---

## 4. Deploy to Netlify (alternative)

```bash
npm run build
# Drag the `dist/` folder to netlify.com/drop
# Or connect via GitHub + set env vars in Site Settings → Environment
```

Add a `_redirects` file inside `public/`:
```
/* /index.html 200
```

---

## 5. PWA — Install on iPhone

After deploying:
1. Open the deployed URL in **Safari** on iPhone
2. Tap the **Share** button → **Add to Home Screen**
3. Beerboard appears as a full-screen app icon

---

## Features

| Feature | Details |
|---------|---------|
| Join with name + group code | Persisted in localStorage |
| Tap 🍺 or 🥃 | Increments counts instantly (optimistic UI) |
| Live leaderboard | Supabase Realtime — updates across all phones |
| Sorted by total drinks | Descending |
| Leave board | Clears localStorage, back to join screen |
| Admin reset | Only visible when `username === "admin"` |
| PWA | Installable, offline-capable |
| Dark mode | Neon pub aesthetic |

---

## Usage

- Share a **Group Code** (e.g. `FRIDAY23`) with your crew
- Everyone joins with their name + the same code
- Tap your drink buttons — the leaderboard updates live on everyone's screen
- To be admin, join with username `admin`

---

## Project Structure

```
beerboard/
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── beer-icon.svg        # Favicon
│   ├── icon-192.png         # PWA icon
│   └── icon-512.png         # PWA icon
├── src/
│   ├── lib/
│   │   └── supabase.js      # Supabase client
│   ├── components/
│   │   ├── JoinScreen.jsx   # Landing / join screen
│   │   └── LeaderboardScreen.jsx  # Main app screen
│   ├── App.jsx              # Root + localStorage session
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind + global styles
├── index.html
├── package.json
├── vite.config.js           # Vite + PWA config
├── tailwind.config.js       # Custom neon theme
├── postcss.config.js
├── vercel.json              # SPA rewrite rules
├── .env.example
└── .gitignore
```

---

> Drink responsibly. Don't pressure people to drink.

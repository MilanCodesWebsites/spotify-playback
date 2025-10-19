# Vercel KV Setup Guide

Your Spotify Now Playing widget now uses **Vercel KV (Redis)** for persistent token storage. This means:
- ✅ Tokens persist across deployments
- ✅ Works on all devices without authentication
- ✅ Auto-refreshes tokens when they expire
- ✅ Free on Vercel's Hobby tier

## Steps to Set Up Vercel KV

### 1. Create a Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`spotify-now-playing` or `spotify-playback`)
3. Click on the **Storage** tab in the top navigation
4. Click **Create Database**
5. Select **KV (Redis)**
6. Choose a name (e.g., `spotify-tokens`)
7. Select your region (choose one closest to your users)
8. Click **Create**

### 2. Get Your KV Environment Variables

After creating the database:

1. You'll see a page with your KV credentials
2. Click the **`.env.local`** tab to see the environment variables
3. You should see 4 variables:
   ```bash
   KV_URL="redis://..."
   KV_REST_API_URL="https://..."
   KV_REST_API_TOKEN="..."
   KV_REST_API_READ_ONLY_TOKEN="..."
   ```

### 3. Add Variables to Your Project

#### For Local Development:

1. Copy the 4 KV variables
2. Add them to your `.env.local` file (create it if it doesn't exist)
3. Your `.env.local` should look like:



# Vercel KV
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

#### For Vercel Deployment:

The KV variables are **automatically added** to your Vercel project! No need to manually add them.

### 4. Test It

#### Local Testing:
```bash
pnpm dev
```
1. Go to `http://localhost:3000/admin`
2. Click "Connect with Spotify"
3. Authenticate
4. Open `http://localhost:3000` in a **different browser** (or incognito)
5. You should see your currently playing music without logging in!

#### Production Testing:
1. Push your code to GitHub
2. Vercel will auto-deploy
3. Go to `https://spotify-playback-lemon.vercel.app/admin`
4. Authenticate once
5. Share `https://spotify-playback-lemon.vercel.app` - anyone can now see your currently playing music!

## What You Need to Provide

Please get these from Vercel and add them to your `.env.local` file:

```bash
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

## Troubleshooting

### "Cannot connect to Redis" error:
- Make sure all 4 KV environment variables are set correctly
- Restart your dev server after adding variables

### Tokens not persisting:
- Check Vercel Dashboard → Your Project → Storage → KV Database
- Verify the database is created and running
- Check if the environment variables match your database

### "Not authenticated" on other devices:
- Make sure you've authenticated at least once from `/admin`
- Check the KV database in Vercel to see if `spotify_tokens` key exists
- Verify the KV environment variables are set in Vercel

## How It Works

1. **You authenticate** once at `/admin` with your Spotify account
2. **Tokens are stored** in Vercel KV (Redis) - a persistent cloud database
3. **All API requests** fetch tokens from KV (not browser cookies)
4. **Anyone visiting your site** sees what YOU are currently playing on Spotify
5. **Tokens auto-refresh** when they expire (good for ~60 days with refresh token)

Your Spotify credentials are securely stored server-side and are never exposed to visitors!


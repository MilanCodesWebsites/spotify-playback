# spotify now playing widget

real-time widget that shows what you're currently listening to on spotify. works for portfolios, personal sites, or whatever.

## features

- real-time updates with live progress bar
- authenticate once, works on all devices
- tokens auto-refresh so it never expires
- server-side token storage for security
- built with next.js 15

## prerequisites

you'll need:

- node.js 18 or higher
- a spotify account
- a vercel account (free tier is fine)
- git

## setup

### 1. Clone the Repository

```bash
### 1. clone the repo

```bash
git clone https://github.com/MilanCodesWebsites/spotify-playback.git
cd spotify-now-playing
```

### 2. install dependencies

```bash
pnpm install
# or npm install
# or yarn install
```

### 3. create spotify app

go to [spotify developer dashboard](https://developer.spotify.com/dashboard) and create a new app.

fill in whatever for the name and description. for the redirect uri, use `http://localhost:3000/admin` for now.

save it and grab your client id and client secret from the settings.
You need a Redis database to store your Spotify tokens persistently.

#### Option A: Using Vercel KV (Recommended - Free Tier Available)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to the **Storage** tab
4. Click **"Create Database"**
5. Select **"KV"** (Redis)
6. Choose a name: `spotify-tokens`
### 4. setup redis

you need a redis database to store tokens. pick one:

**vercel kv** (easiest if deploying to vercel)
- go to vercel dashboard
- create or select a project
- storage tab, create database, select kv
- name it whatever, pick a region
- copy the `spotify_tokens_REDIS_URL` that shows up

**upstash** (good alternative)
- go to [console.upstash.com](https://console.upstash.com/)
- create a redis database
- copy the redis url from database details

**redis cloud**
- go to [redis.com](https://redis.com/try-free/)
- create account and database
- grab the connection url
# Spotify API Credentials
# Get these from https://developer.spotify.com/dashboard
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# The base URL of your application (no trailing slash, no /admin)
### 5. set environment variables

create `.env.local` in the root:

```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000
spotify_tokens_REDIS_URL="your_redis_url"
```

### 6. run it

```bash
pnpm dev
```

open localhost:3000 in your browser.

### 7. authenticate

go to localhost:3000/admin and connect your spotify account. you only need to do this once.

### 8. test it

play a song on spotify and check localhost:3000. should show what's playing.

try opening it on another device or incognito - should still work without logging in.
6. After deployment, go to **Project Settings → Environment Variables**
7. Add the following variables:

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID = your_client_id
SPOTIFY_CLIENT_SECRET = your_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = https://yourdomain.vercel.app
spotify_tokens_REDIS_URL = your_redis_url
```

**Important**: If you created the Redis database in the same Vercel project, the `spotify_tokens_REDIS_URL` will already be set automatically! ✅

8. **Update Spotify Redirect URI**:
   - Go back to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Open your app settings
   - Add production redirect URI: `https://yourdomain.vercel.app/admin`
   - Click **"Save"**

9. Redeploy your app (or it will auto-deploy on the next push)

10. Visit `https://yourdomain.vercel.app/admin` and authenticate once

11. Share `https://yourdomain.vercel.app` - everyone can see your music! 🎵

##  Project Structure

## deploy to production

### vercel

push to github first (make sure .env.local is gitignored):

```bash
git add .
git commit -m "initial commit"
git push origin main
```

then:
- go to vercel dashboard
- import your github repo
- deploy

add environment variables in project settings:
```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID = your_client_id
SPOTIFY_CLIENT_SECRET = your_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = https://yourdomain.vercel.app
spotify_tokens_REDIS_URL = your_redis_url
```

note: if you made the redis database in the same vercel project, the redis url is already set.

update your spotify app settings with the production redirect uri: `https://yourdomain.vercel.app/admin`

redeploy if needed. visit yourdomain.vercel.app/admin to authenticate, then share the main url.
```

### Adjust Polling Interval

By default, the widget checks for updates every 2 seconds. To change this:

```tsx
// In components/now-playing-widget.tsx
useEffect(() => {
  fetchCurrentTrack()
## project structure

```
spotify-now-playing/
├── app/
│   ├── admin/                 # authentication page
│   ├── api/spotify/           # api routes
│   │   ├── auth/              # token exchange
│   │   ├── callback/          # oauth callback
│   │   ├── logout/            # clear tokens
│   │   ├── now-playing/       # get current track
│   │   └── status/            # check auth status
### change appearance

edit `components/now-playing-widget.tsx` to modify colors, layout, fonts, whatever.

```tsx
// example: change background
className="bg-gradient-to-br from-slate-800 to-slate-900"
```

### polling interval

default is 2 seconds. change it in the widget component:

```tsx
const interval = setInterval(fetchCurrentTrack, 5000) // 5 seconds instead
```

### spotify permissions

add more scopes in `app/admin/page.tsx` if you want to access more data:

```tsx
const scopes = "user-read-currently-playing user-read-playback-state user-read-recently-played"
```

check [spotify docs](https://developer.spotify.com/documentation/web-api/concepts/scopes) for available scopes.
2. Check that you've granted the correct scopes during authentication
3. Try disconnecting and reconnecting in `/admin`
4. Verify your Spotify account is actually playing music (check Spotify app)

### Tokens Not Persisting After Deployment

**Problem**: Have to re-authenticate every time on Vercel.

**Solution**:
1. Make sure `spotify_tokens_REDIS_URL` is set in Vercel environment variables
2. Verify the Redis database is accessible from Vercel's servers
## troubleshooting

### invalid redirect uri

make sure the redirect uri in spotify dashboard matches exactly. for local use `http://localhost:3000/admin`, for production use `https://yourdomain.com/admin`.

important: `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` should NOT include /admin at the end. just use `http://localhost:3000`.

### not authenticated on other devices

check that redis is set up correctly and `spotify_tokens_REDIS_URL` is in your env file. make sure you authenticated at least once from /admin.

### redis connection failed

verify your redis url is correct and the database is actually running. restart your dev server after changing env variables.

### nothing playing shows up

make sure music is actually playing on spotify (not paused). try disconnecting and reconnecting from /admin. check you have the right scopes.

### tokens don't persist

verify `spotify_tokens_REDIS_URL` is set in vercel environment variables. check deployment logs for errors.com/documentation/web-api)

## 💬 Support

## security

- never commit .env.local to git
- client secret stays in environment variables only
- tokens are stored server-side in redis
- use https in production
- widget has read-only permissions

## how it works

authenticate once at /admin, tokens get stored in redis. when someone visits your site, the widget calls the api which grabs tokens from redis and fetches your current track from spotify. updates every 2 seconds. tokens auto-refresh every hour.

## contributing

feel free to open issues or submit prs.

## license

mit

## credits

built with next.js, shadcn/ui, and spotify web api.

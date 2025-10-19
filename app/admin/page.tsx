"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/spotify/status")
        if (response.ok) {
          setIsAuthenticated(true)
        }
        setLoading(false)
      } catch (err) {
        setLoading(false)
      }
    }

    checkAuth()

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      exchangeCode(code)
    }
  }, [])

  const exchangeCode = async (code: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/spotify/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setSuccess(true)
        window.history.replaceState({}, document.title, "/admin")
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError("Failed to authenticate with Spotify")
      }
    } catch (err) {
      setError("Error during authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const redirectUri = `${window.location.origin}/admin`

    if (!clientId) {
      setError("Spotify credentials not configured")
      return
    }

    const scopes = "user-read-currently-playing user-read-playback-state"
    const authUrl = new URL("https://accounts.spotify.com/authorize")
    authUrl.searchParams.append("client_id", clientId)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("redirect_uri", redirectUri)
    authUrl.searchParams.append("scope", scopes)

    window.location.href = authUrl.toString()
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/spotify/logout", { method: "POST" })
      setIsAuthenticated(false)
      setError(null)
    } catch (err) {
      setError("Failed to logout")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 w-full max-w-md">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            <p className="text-slate-400">Checking authentication status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "Funnel Display, sans-serif" }}>
              Spotify Setup
            </h1>
            <p className="text-slate-400 text-sm">
              Authenticate your Spotify account to display your now playing widget
            </p>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">Successfully authenticated! Your widget is now active.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-green-400 font-semibold text-sm">✓ Authenticated</p>
                <p className="text-slate-400 text-xs mt-1">Your Spotify account is connected</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Disconnect Spotify
              </button>
              <a
                href="/"
                className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-center block"
              >
                View Widget
              </a>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <img
                src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png"
                alt="Spotify"
                className="w-5 h-5"
              />
              Connect with Spotify
            </button>
          )}

          <p className="text-xs text-slate-500 text-center">
            Your access token is stored securely on the server. We only request permission to read your currently
            playing track.
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface Track {
  name: string
  artist: string
  album: string
  imageUrl: string
  isPlaying: boolean
  progress: number
  duration: number
  spotifyUrl: string
}

export default function NowPlayingWidget() {
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCurrentTrack()
    const interval = setInterval(fetchCurrentTrack, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch("/api/spotify/now-playing")

      if (response.status === 204) {
        // No track playing
        setTrack(null)
        setError(null)
        setLoading(false)
        return
      }

      if (!response.ok) {
        if (response.status === 401) {
          setError("Spotify not authenticated. Please set up your account in the admin panel.")
        } else {
          setError("Failed to fetch track data")
        }
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.item) {
        setTrack({
          name: data.item.name,
          artist: data.item.artists.map((a: any) => a.name).join(", "),
          album: data.item.album.name,
          imageUrl: data.item.album.images[0]?.url || "",
          isPlaying: data.is_playing,
          progress: data.progress_ms,
          duration: data.item.duration_ms,
          spotifyUrl: data.item.external_urls.spotify,
        })
        setError(null)
      } else {
        setTrack(null)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching track:", err)
      setError("Unable to fetch track data")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your track...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-red-500/20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-red-400 text-sm text-center">{error}</p>
            <a
              href="/admin"
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center text-sm"
            >
              Go to Setup
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center p-2">
              <img
                src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_White.png"
                alt="Spotify"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <h3
                className="text-2xl font-semibold text-white mb-2"
                style={{ fontFamily: "Funnel Display, sans-serif" }}
              >
                nothing playing?
              </h3>
              <p className="text-slate-400 text-sm">i'm probably busy with some stuff irl</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progressPercent = (track.progress / track.duration) * 100

  return (
    <div className="w-full max-w-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
        {/* Album Art */}
        <div className="relative aspect-square overflow-hidden bg-slate-900">
          {track.imageUrl && (
            <Image
              src={track.imageUrl || "/placeholder.svg"}
              alt={track.album}
              fill
              className="object-cover"
              priority
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          {/* Playing indicator */}
          {track.isPlaying && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="flex gap-0.5">
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
              </div>
              <span className="text-xs font-semibold text-white ml-1">Playing</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Track Info */}
          <div className="space-y-2">
            <h2
              className="text-2xl font-bold text-white line-clamp-2 hover:text-green-400 transition-colors"
              style={{ fontFamily: "Funnel Display, sans-serif" }}
            >
              {track.name}
            </h2>
            <p className="text-sm text-slate-400 line-clamp-1">{track.artist}</p>
            <p className="text-xs text-slate-500 line-clamp-1">{track.album}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatTime(track.progress)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Actions */}
          <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center text-sm shadow-lg hover:shadow-xl block"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  )
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

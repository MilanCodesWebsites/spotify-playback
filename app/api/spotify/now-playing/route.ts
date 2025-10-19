import { type NextRequest, NextResponse } from "next/server"
import { tokenStorage } from "@/lib/token-store"

export async function GET(request: NextRequest) {
  try {
    const tokens = await tokenStorage.get()

    if (!tokens) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let accessToken = tokens.accessToken

    // Check if token is expired and refresh if needed
    if (tokenStorage.isExpired(tokens)) {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

      if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Spotify credentials not configured" }, { status: 500 })
      }

      const refreshResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokens.refreshToken,
        }).toString(),
      })

      if (!refreshResponse.ok) {
        await tokenStorage.clear()
        return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 })
      }

      const newTokenData = await refreshResponse.json()
      await tokenStorage.set(newTokenData.access_token, tokens.refreshToken, newTokenData.expires_in)
      accessToken = newTokenData.access_token
    }

    const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.status === 204) {
      // No track currently playing
      return new NextResponse(null, { status: 204 })
    }

    if (response.status === 401) {
      // Token is invalid, clear storage
      await tokenStorage.clear()
      return NextResponse.json({ error: "Authentication expired" }, { status: 401 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Now playing error:", error)
    return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 })
  }
}

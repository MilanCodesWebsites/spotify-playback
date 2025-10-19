import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("spotify_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
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
      // Token expired, try to refresh
      const refreshToken = request.cookies.get("spotify_refresh_token")?.value

      if (!refreshToken) {
        return NextResponse.json({ error: "Token expired and no refresh token available" }, { status: 401 })
      }

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
          refresh_token: refreshToken,
        }).toString(),
      })

      if (!refreshResponse.ok) {
        return NextResponse.json({ error: "Failed to refresh token" }, { status: 401 })
      }

      const newTokenData = await refreshResponse.json()
      const newResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${newTokenData.access_token}`,
        },
      })

      if (newResponse.status === 204) {
        return new NextResponse(null, { status: 204 })
      }

      if (!newResponse.ok) {
        return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 })
      }

      const data = await newResponse.json()

      // Update the access token cookie
      const responseWithNewToken = NextResponse.json(data)
      responseWithNewToken.cookies.set("spotify_access_token", newTokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: newTokenData.expires_in,
      })

      return responseWithNewToken
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

import { type NextRequest, NextResponse } from "next/server"
import { tokenStorage } from "@/lib/token-store"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "No authorization code provided" }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "http://localhost:3000"}/admin`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Spotify credentials not configured" }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange failed:", errorData)
      return NextResponse.json({ error: "Failed to exchange code for token" }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    // Store tokens in server-side storage (accessible by all clients)
    await tokenStorage.set(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

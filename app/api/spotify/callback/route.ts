import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "http://localhost:3000"}/api/spotify/callback`

    if (!clientId || !clientSecret) {
      throw new Error("Missing Spotify credentials")
    }

    // Exchange authorization code for access token
    const response = await fetch("https://accounts.spotify.com/api/token", {
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

    if (!response.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await response.json()

    // Redirect back to admin with success
    const redirectUrl = new URL("/admin", request.url)
    redirectUrl.searchParams.append("code", code)
    
    // Store tokens in cookies
    const nextResponse = NextResponse.redirect(redirectUrl)
    nextResponse.cookies.set("spotify_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in,
    })

    if (tokenData.refresh_token) {
      nextResponse.cookies.set("spotify_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    return nextResponse
  } catch (error) {
    console.error("Token exchange error:", error)
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
  }
}

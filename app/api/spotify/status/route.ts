import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("spotify_access_token")?.value

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

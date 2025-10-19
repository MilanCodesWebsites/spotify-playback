import { type NextRequest, NextResponse } from "next/server"
import { tokenStorage } from "@/lib/token-store"

export async function GET(request: NextRequest) {
  const tokens = await tokenStorage.get()

  if (!tokens) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}

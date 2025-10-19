import { NextResponse } from "next/server"
import { tokenStorage } from "@/lib/token-store"

export async function POST() {
  await tokenStorage.clear()
  return NextResponse.json({ success: true })
}

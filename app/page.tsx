"use client"

import { useEffect, useState } from "react"
import NowPlayingWidget from "@/components/now-playing-widget"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <NowPlayingWidget />
    </main>
  )
}

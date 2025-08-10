"use client"

import { useEffect, useState } from "react"

// Client-only wrapper to prevent hydration mismatches
// This is especially useful when browser extensions modify the DOM
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null // Return null on server-side to prevent hydration mismatch
  }

  return <>{children}</>
} 
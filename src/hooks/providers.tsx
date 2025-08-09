"use client"

import type React from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  )
}

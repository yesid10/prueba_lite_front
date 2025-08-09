import type React from "react"
import { AppProviders } from "@/hooks/providers"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>
}

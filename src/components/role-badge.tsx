"use client"

import { Badge } from "@/components/ui/badge"

export function RoleBadge({ role }: { role?: "admin" | "external" }) {
  if (!role) return null
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>{role === "admin" ? "Administrador" : "Externo"}</Badge>
  )
}

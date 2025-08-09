import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { LogOut, Building2, Package, Boxes, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

export function TemplateShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="border-b bg-white/70 backdrop-blur dark:bg-zinc-900/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div
              className={cn(
                "rounded-md p-2",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
              )}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                {"Empresas"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/products">
                <Package className="mr-2 h-4 w-4" />
                {"Productos"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/inventory">
                <Boxes className="mr-2 h-4 w-4" />
                {"Inventario"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/ai-assistant">
                <Bot className="mr-2 h-4 w-4" />
                {"Asistente IA"}
              </Link>
            </Button>

            {user ? (
              <Button onClick={logout} variant="outline" className="ml-2 bg-transparent">
                <LogOut className="mr-2 h-4 w-4" />
                {"Salir"}
              </Button>
            ) : (
              <Button asChild className="ml-2 bg-emerald-600 hover:bg-emerald-700">
                <Link href="/login">{"Entrar"}</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Card className="p-4 md:p-6">{children}</Card>
      </main>
    </div>
  )
}

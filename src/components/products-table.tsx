import { useAppStore } from "@/stores/app-store"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"

export function ProductsTable() {
  const { products, companies } = useAppStore()
  const [query, setQuery] = useState("")

  const companiesByNit = useMemo(() => {
    const m: Record<string, string> = {}
    companies.forEach((c) => (m[c.nit] = c.name))
    return m
  }, [companies])

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.features.toLowerCase().includes(query.toLowerCase()),
    )
  }, [products, query])

  return (
    <Card className="p-4">
      <div className="mb-3">
        <Input
          placeholder="Buscar por código, nombre o características..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-2">{"Código"}</th>
              <th className="p-2">{"Nombre"}</th>
              <th className="p-2">{"Características"}</th>
              <th className="p-2">{"Base"}</th>
              <th className="p-2">{"Empresa"}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={5}>
                  {"Sin productos registrados."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.code} className="border-b">
                  <td className="p-2">{p.code}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 max-w-[420px]">{p.features}</td>
                  <td className="p-2">{`${p.baseCurrency} ${p.basePrice.toLocaleString()}`}</td>
                  <td className="p-2">{companiesByNit[p.companyNit] || p.companyNit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

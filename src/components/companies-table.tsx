import { useAppStore } from "@/stores/app-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { useAuth } from "@/stores/auth-store"

export function CompaniesTable() {
  const { companies, removeCompany, updateCompany } = useAppStore()
  const { user } = useAuth()
  const [editNit, setEditNit] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return companies.filter(
      (c) =>
        c.nit.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.address.toLowerCase().includes(query.toLowerCase()),
    )
  }, [companies, query])

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Input
          placeholder="Buscar por NIT, nombre o dirección..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="p-2">{"NIT"}</th>
              <th className="p-2">{"Nombre"}</th>
              <th className="p-2">{"Dirección"}</th>
              <th className="p-2">{"Teléfono"}</th>
              {user?.role === "admin" ? <th className="p-2">{"Acciones"}</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={5}>
                  {"Sin empresas registradas."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.nit} className="border-b">
                  <td className="p-2">{c.nit}</td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.name}
                        onBlur={(e) => {
                          updateCompany(c.nit, { ...c, name: e.target.value })
                          setEditNit(null)
                        }}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.address}
                        onBlur={(e) => {
                          updateCompany(c.nit, { ...c, address: e.target.value })
                          setEditNit(null)
                        }}
                      />
                    ) : (
                      c.address
                    )}
                  </td>
                  <td className="p-2">
                    {editNit === c.nit ? (
                      <Input
                        defaultValue={c.phone}
                        onBlur={(e) => {
                          updateCompany(c.nit, { ...c, phone: e.target.value })
                          setEditNit(null)
                        }}
                      />
                    ) : (
                      c.phone
                    )}
                  </td>
                  {user?.role === "admin" ? (
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditNit(c.nit)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => removeCompany(c.nit)} aria-label="Eliminar">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

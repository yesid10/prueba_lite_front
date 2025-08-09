import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMemo, useState, useEffect } from "react"
import { type Product } from "@/services/products"
import { useProducts } from "@/zustand/products"
import { useCompanies } from "@/zustand/companies"
import { Pencil, Trash2 } from "lucide-react"

export function ProductsTable() {
  const { products, loading: isLoading, error, fetchProducts } = useProducts()
  const { companies } = useCompanies()
  const [query, setQuery] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editCode, setEditCode] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Eliminar producto
  const handleDelete = async (code: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    setActionLoading(code)
    try {
      await import('@/services/products').then(({ deleteProduct }) => deleteProduct(code))
      fetchProducts()
    } catch (err) {
      alert('Error al eliminar el producto')
    } finally {
      setActionLoading(null)
    }
  }

  // Editar producto (prompt simple)
  const startEdit = (product: Product) => {
    setEditCode(product.code)
    setEditValues(product)
  }

  const cancelEdit = () => {
    setEditCode(null)
    setEditValues({})
  }

  const saveEdit = async () => {
    if (!editCode) return
    setActionLoading(editCode)
    try {
      await import('@/services/products').then(({ updateProduct }) => updateProduct(editCode, editValues))
      fetchProducts()
      cancelEdit()
    } catch (err) {
      alert('Error al editar el producto')
    } finally {
      setActionLoading(null)
    }
  }

  const companiesByNit = useMemo(() => {
    const m: Record<string, string> = {}
    companies.forEach((c: { nit: string; name: string }) => (m[c.nit] = c.name))
    return m
  }, [companies])

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.features?.toLowerCase() || "").includes(query.toLowerCase())
    )
  }, [products, query])

  return (
    <Card className="p-4 border-gray-200">
      <div className="mb-3">
        <Input
        className="border-gray-200"
          placeholder="Buscar por código, nombre o características..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Cargando productos...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-100">
              <tr className="border-b border-gray-200 bg-muted/50 text-left">
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Características</th>
                <th className="p-2">Precio COP</th>
                <th className="p-2">Precio USD</th>
                <th className="p-2">Precio EUR</th>
                <th className="p-2">Empresa</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={7}>
                    Sin productos registrados.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.code} className="border-b border-gray-200">
                    <td className="p-2">{product.code}</td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <Input
                          value={editValues.name ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))}
                          className="border-gray-200"
                        />
                      ) : product.name}
                    </td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <Input
                          value={editValues.features ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, features: e.target.value }))}
                          className="border-gray-200"
                        />
                      ) : (product.features || "-")}
                    </td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <Input
                          type="number"
                          value={editValues.price_cop ?? 0}
                          onChange={e => setEditValues(v => ({ ...v, price_cop: Number(e.target.value) }))}
                          className="border-gray-200"
                        />
                      ) : product.price_cop.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                    </td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <Input
                          type="number"
                          value={editValues.price_usd ?? 0}
                          onChange={e => setEditValues(v => ({ ...v, price_usd: Number(e.target.value) }))}
                          className="border-gray-200"
                        />
                      ) : product.price_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <Input
                          type="number"
                          value={editValues.price_eur ?? 0}
                          onChange={e => setEditValues(v => ({ ...v, price_eur: Number(e.target.value) }))}
                          className="border-gray-200"
                        />
                      ) : product.price_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="p-2">{companiesByNit[product.company_nit] || product.company_nit}</td>
                    <td className="p-2">
                      {editCode === product.code ? (
                        <>
                          <button
                            className="mr-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={saveEdit}
                            disabled={actionLoading === product.code}
                          >
                            {actionLoading === product.code ? '...' : 'Guardar'}
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            onClick={cancelEdit}
                            disabled={actionLoading === product.code}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="mr-2 px-2 py-1 text-xs cursor-pointer"
                            onClick={() => startEdit(product)}
                            disabled={actionLoading === product.code}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="px-2 py-1 text-xs cursor-pointer"
                            onClick={() => handleDelete(product.code)}
                            disabled={actionLoading === product.code}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  )
}

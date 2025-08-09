import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMemo, useState, useEffect } from "react"
import { getProducts, type Product } from "@/services/products"
import { useCompanies } from "@/zustand/companies"

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { companies } = useCompanies()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await getProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        setError('Error al cargar los productos')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.features || "-"}</td>
                    <td className="p-2">{product.price_cop.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
                    <td className="p-2">{product.price_usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    <td className="p-2">{product.price_eur.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                    <td className="p-2">{companiesByNit[product.company_nit] || product.company_nit}</td>
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

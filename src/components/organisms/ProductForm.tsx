import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRates } from "@/hooks/use-rates"
import { useMemo, useState } from "react"
import { FormRow } from "../molecules/FormRow"
import { useCompanies } from "@/zustand/companies"

const schema = z.object({
  code: z.string().min(2, "Código requerido"),
  name: z.string().min(2, "Nombre requerido"),
  features: z.string().min(3, "Características requeridas"),
  basePrice: z.coerce.number().positive("Precio debe ser positivo"),
  baseCurrency: z.string().min(3),
  companyNit: z.string().min(1, "Empresa requerida"),
})
type FormValues = z.infer<typeof schema>

const CURRENCIES = ["USD", "EUR", "COP", "MXN", "ARS", "BRL"]

export function ProductForm() {
  const { companies } = useCompanies()
  const { data: rates } = useRates()
  const [previewPrices, setPreviewPrices] = useState<Record<string, number>>({})

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", name: "", features: "", basePrice: 0, baseCurrency: "USD", companyNit: "" },
  })

  const selectCompanyOptions = useMemo(() => companies.map((c) => ({ label: c.name, value: c.nit })), [companies])

  const computePrices = (bp: number, base: string) => {
    const out: Record<string, number> = {}
    if (!rates) return out
    const baseRate = rates?.rates?.[base] ? 1 : 1 // rates base is USD; convert via USD
    // price in USD:
    let priceUSD = bp
    if (base !== "USD") {
      // Convert base -> USD
      const r = rates?.rates?.[base]
      if (r) priceUSD = bp / r
    }
    CURRENCIES.forEach((cur) => {
      const r = rates?.rates?.[cur]
      if (r) out[cur] = +(priceUSD * r).toFixed(2)
    })
    return out
  }

  const onSubmit = (v: FormValues) => {
    const prices = computePrices(v.basePrice, v.baseCurrency)
    // addProduct({
    //   code: v.code,
    //   name: v.name,
    //   features: v.features,
    //   basePrice: v.basePrice,
    //   baseCurrency: v.baseCurrency,
    //   prices,
    //   companyNit: v.companyNit,
    // })
    // toast({ title: "Producto registrado", description: v.name })
    form.reset()
    setPreviewPrices({})
  }

  return (
    <Card className="mb-6 border-gray-200">
      <CardHeader>
        <CardTitle>{"Registrar Producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormRow label="Código" htmlFor="code">
            <Input className="border-gray-200" id="code" placeholder="SKU-001" {...form.register("code")} />
            {form.formState.errors.code && <p className="text-xs text-red-500">{form.formState.errors.code.message}</p>}
          </FormRow>
          <FormRow label="Nombre" htmlFor="name">
            <Input className="border-gray-200"  id="name" placeholder="Producto X" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </FormRow>
          <div className="md:col-span-2">
            <FormRow label="Características" htmlFor="features">
              <Textarea className="border-gray-200"  id="features" placeholder="Detalle y especificaciones..." {...form.register("features")} />
              {form.formState.errors.features && (
                <p className="text-xs text-red-500">{form.formState.errors.features.message}</p>
              )}
            </FormRow>
          </div>
          <FormRow label="Precio base" htmlFor="basePrice">
            <Input
            className="border-gray-200" 
              id="basePrice"
              type="number"
              step="0.01"
              placeholder="100.00"
              {...form.register("basePrice", {
                onChange: (e) => {
                  const next = computePrices(Number.parseFloat(e.target.value || "0"), form.getValues("baseCurrency"))
                  setPreviewPrices(next)
                },
              })}
            />
            {form.formState.errors.basePrice && (
              <p className="text-xs text-red-500">{form.formState.errors.basePrice.message}</p>
            )}
          </FormRow>
          <FormRow label="Moneda base" htmlFor="baseCurrency">
            <Select
              defaultValue="USD"
              onValueChange={(v) => {
                form.setValue("baseCurrency", v)
                const next = computePrices(form.getValues("basePrice"), v)
                setPreviewPrices(next)
              }}
            >
              <SelectTrigger id="baseCurrency">
                <SelectValue placeholder="Selecciona moneda" />
              </SelectTrigger>
              <SelectContent className="z-50">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Empresa" htmlFor="companyNit" hint="Empresa propietaria del producto">
            <Select  onValueChange={(v) => form.setValue("companyNit", v)} defaultValue={form.getValues("companyNit")}>
              <SelectTrigger className="border-gray-200 z-50"  id="companyNit">
                <SelectValue placeholder="Selecciona empresa" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border-gray-200">
                {selectCompanyOptions.length === 0 ? (
                  <div className="p-2 z-50 text-sm text-muted-foreground">{"Primero registra una empresa."}</div>
                ) : (
                  selectCompanyOptions.map((o) => (
                    <SelectItem className="z-10" key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.companyNit && (
              <p className="text-xs text-red-500">{form.formState.errors.companyNit.message}</p>
            )}
          </FormRow>

          <div className="md:col-span-2 grid gap-2">
            <div className="text-sm text-muted-foreground">{"Precios estimados:"}</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
              {Object.entries(previewPrices).map(([cur, val]) => (
                <div key={cur} className="rounded-md border p-2 text-center text-sm">
                  <div className="font-medium">{cur}</div>
                  <div className="text-muted-foreground">{val.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {"Guardar producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

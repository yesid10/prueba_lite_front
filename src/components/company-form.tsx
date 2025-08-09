"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAppStore } from "@/stores/app-store"
import { useToast } from "@/hooks/use-toast"
import { FormRow } from "../molecules/form-row"

const schema = z.object({
  nit: z.string().min(3, "NIT requerido"),
  name: z.string().min(2, "Nombre requerido"),
  address: z.string().min(3, "Dirección requerida"),
  phone: z.string().min(7, "Teléfono requerido"),
})
type FormValues = z.infer<typeof schema>

export function CompanyForm() {
  const { addCompany } = useAppStore()
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nit: "", name: "", address: "", phone: "" },
  })

  const onSubmit = (v: FormValues) => {
    const ok = addCompany(v)
    if (!ok) {
      toast({ title: "NIT duplicado", description: "Ya existe una empresa con ese NIT.", variant: "destructive" })
      return
    }
    toast({ title: "Empresa registrada", description: v.name })
    form.reset()
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{"Registrar Empresa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormRow label="NIT" htmlFor="nit">
            <Input id="nit" placeholder="900123456-7" {...form.register("nit")} />
            {form.formState.errors.nit && <p className="text-xs text-red-500">{form.formState.errors.nit.message}</p>}
          </FormRow>
          <FormRow label="Nombre" htmlFor="name">
            <Input id="name" placeholder="Mi Empresa S.A.S." {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </FormRow>
          <FormRow label="Dirección" htmlFor="address">
            <Input id="address" placeholder="Calle 123 #45-67" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
            )}
          </FormRow>
          <FormRow label="Teléfono" htmlFor="phone">
            <Input id="phone" placeholder="+57 300 123 4567" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </FormRow>

          <div className="md:col-span-2">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              {"Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCompanies } from "@/zustand/companies"
import { useState } from "react"
import { FormRow } from "../molecules/FormRow"

const schema = z.object({
  nit: z.string().min(3, "NIT requerido"),
  name: z.string().min(2, "Nombre requerido"),
  address: z.string().min(3, "Dirección requerida"),
  phone: z.string().min(7, "Teléfono requerido"),
})
type FormValues = z.infer<typeof schema>

const CompanyForm = () => {
  const [loading, setLoading] = useState(false);
  const { companies, addCompany } = useCompanies();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nit: "", name: "", address: "", phone: "" },
  });

  const onSubmit = async (data: FormValues) => {
    // Verificar si el NIT ya existe
    if (companies.some(company => company.nit === data.nit)) {
      alert("Ya existe una empresa con ese NIT");
      return;
    }

    try {
      setLoading(true);
      await addCompany(data);
      form.reset();
      alert("Empresa registrada exitosamente");
    } catch (error: any) {
      alert(error.message || "Error al registrar la empresa");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Card className="mb-6 border-gray-200">
      <CardHeader>
        <CardTitle>{"Registrar Empresa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormRow label="NIT" htmlFor="nit">
            <Input className="border-gray-200" id="nit" placeholder="900123456-7" {...form.register("nit")} />
            {form.formState.errors.nit && <p className="text-xs text-red-500">{form.formState.errors.nit.message}</p>}
          </FormRow>
          <FormRow label="Nombre" htmlFor="name">
            <Input className="border-gray-200" id="name" placeholder="Mi Empresa S.A.S." {...form.register("name")} />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </FormRow>
          <FormRow label="Dirección" htmlFor="address">
            <Input className="border-gray-200" id="address" placeholder="Calle 123 #45-67" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
            )}
          </FormRow>
          <FormRow label="Teléfono" htmlFor="phone">
            <Input className="border-gray-200" id="phone" placeholder="+57 300 123 4567" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </FormRow>

          <div className="md:col-span-2">
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default CompanyForm
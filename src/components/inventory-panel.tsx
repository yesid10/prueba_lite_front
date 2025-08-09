"use client"

import { useAppStore } from "@/stores/app-store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import QRCode from "qrcode"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createInventoryHash } from "@/utils/crypto"
import { ProofPanel } from "./proof-panel"

export function InventoryPanel() {
  const { companies, products } = useAppStore()
  const [companyNit, setCompanyNit] = useState<string>("")
  const [email, setEmail] = useState("")
  const [sendMethod, setSendMethod] = useState<"REST" | "SOAP">("REST")
  const { toast } = useToast()

  const companyOptions = companies.map((c) => ({ label: c.name, value: c.nit }))
  const rows = useMemo(
    () => products.filter((p) => (companyNit ? p.companyNit === companyNit : true)),
    [products, companyNit],
  )

  const inventoryJson = useMemo(() => JSON.stringify({ companyNit, rows }, null, 2), [companyNit, rows])
  const invHash = useMemo(() => createInventoryHash({ companyNit, rows }), [companyNit, rows])

  const generatePdf = async () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text("Inventario por Empresa", 14, 18)
    const companyName = companies.find((c) => c.nit === companyNit)?.name || "Todas"
    doc.setFontSize(10)
    doc.text(`Empresa: ${companyName}`, 14, 26)
    doc.text(`Hash (SHA-256): ${invHash.slice(0, 20)}...`, 14, 32)

    autoTable(doc, {
      startY: 36,
      head: [["Código", "Nombre", "Características", "Base", "Monedas"]],
      body: rows.map((p) => [
        p.code,
        p.name,
        p.features,
        `${p.baseCurrency} ${p.basePrice.toLocaleString()}`,
        Object.entries(p.prices)
          .map(([cur, val]) => `${cur} ${val.toLocaleString()}`)
          .join(" | "),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 211, 153] },
    })

    const qrData = await QRCode.toDataURL(invHash)
    const pageW = doc.internal.pageSize.getWidth()
    doc.addImage(qrData, "PNG", pageW - 40, 14, 24, 24)

    return doc
  }

  const handleDownload = async () => {
    const doc = await generatePdf()
    doc.save("inventario.pdf")
  }

  const handleSend = async () => {
    if (!email) {
      toast({ title: "Correo requerido", description: "Ingresa un correo destino.", variant: "destructive" })
      return
    }
    const doc = await generatePdf()
    const pdfBase64 = btoa(doc.output()) // base64 of raw string
    const res = await fetch("/api/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Inventario adjunto",
        pdfBase64,
        method: sendMethod,
      }),
    })
    const json = await res.json()
    if (json?.success) {
      toast({ title: "Enviado (stub)", description: "Conecta tu backend para envío real." })
    } else {
      toast({ title: "Error de envío", description: "No se pudo enviar el PDF.", variant: "destructive" })
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="company">{"Empresa"}</Label>
            <Select onValueChange={setCompanyNit}>
              <SelectTrigger id="company">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{"Todas"}</SelectItem>
                {companyOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">{"Enviar a (correo)"}</Label>
              <Input
                id="email"
                placeholder="destinatario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>{"Método API"}</Label>
              <Select defaultValue={sendMethod} onValueChange={(v) => setSendMethod(v as "REST" | "SOAP")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REST">{"REST (POST JSON)"}</SelectItem>
                  <SelectItem value="SOAP">{"SOAP (XML)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700">
            {"Descargar PDF"}
          </Button>
          <Button onClick={handleSend} variant="outline">
            {"Enviar PDF (stub)"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(invHash)
            }}
          >
            {"Copiar hash"}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-2">{"Código"}</th>
                <th className="p-2">{"Nombre"}</th>
                <th className="p-2">{"Características"}</th>
                <th className="p-2">{"Precio base"}</th>
                <th className="p-2">{"Precios (multi-moneda)"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={5}>
                    {"No hay productos en este inventario."}
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.code} className="border-b">
                    <td className="p-2">{p.code}</td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2 max-w-[420px]">{p.features}</td>
                    <td className="p-2">{`${p.baseCurrency} ${p.basePrice.toLocaleString()}`}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(p.prices).map(([cur, val]) => (
                          <span
                            key={cur}
                            className="rounded border px-2 py-1 text-xs"
                          >{`${cur} ${val.toLocaleString()}`}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProofPanel inventoryHash={invHash} />
    </div>
  )
}

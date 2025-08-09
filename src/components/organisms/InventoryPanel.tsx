import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getInventories } from "@/services/inventory";
import type { InventoryItem } from "@/services/inventory";
import { createInventoryHash } from "@/utils/cripto";
import { useCompanies } from "@/zustand/companies";

export function InventoryPanel() {
  const [companyNit, setCompanyNit] = useState<string>("");
  const [email, setEmail] = useState("");
  const [sendMethod, setSendMethod] = useState<"REST" | "SOAP">("REST");
  const { companies } = useCompanies();

  const {
    data: inventories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventories"],
    queryFn: getInventories,
  });

  // Obtener lista de empresas únicas
  const companyOptions = useMemo(() => {
    const uniqueCompanies: Record<string, string> = {};
    inventories.forEach((inv) => {
      uniqueCompanies[inv.company_nit] = inv.company_name;
    });
    return Object.entries(uniqueCompanies).map(([nit, name]) => ({
      label: name,
      value: nit,
    }));
  }, [inventories]);

  // Filtrar inventarios por empresa seleccionada
  const rows = useMemo(() => {
    return companyNit && companyNit !== "all"
      ? inventories.filter((inv) => inv.company_nit === companyNit)
      : inventories;
  }, [inventories, companyNit]);

  const invHash = useMemo(
    () => createInventoryHash({ companyNit, rows }),
    [companyNit, rows]
  );

  const generatePdf = async () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Inventario por Empresa", 14, 18);
    const companyName =
      companies.find((c) => c.nit === companyNit)?.name || "Todas";
    doc.setFontSize(10);
    doc.text(`Empresa: ${companyName}`, 14, 26);
    doc.text(`Hash (SHA-256): ${invHash.slice(0, 20)}...`, 14, 32);

    autoTable(doc, {
      startY: 36,
      head: [
        [
          "Código",
          "Nombre",
          "Precio COP",
          "Precio USD",
          "Precio EUR",
          "Empresa",
          "Cantidad",
        ],
      ],
      body: rows.map((inv: InventoryItem) => [
        inv.product_code,
        inv.product_name,
        inv.price_cop.toLocaleString(),
        inv.price_usd.toLocaleString(),
        inv.price_eur.toLocaleString(),
        inv.company_name,
        inv.quantity,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 211, 153] },
    });

    const qrData = await QRCode.toDataURL(invHash);
    const pageW = doc.internal.pageSize.getWidth();
    doc.addImage(qrData, "PNG", pageW - 40, 14, 24, 24);

    return doc;
  };

  const handleDownload = async () => {
    const doc = await generatePdf();
    doc.save("inventario.pdf");
  };

  const handleSend = async () => {
    if (!email) {
      return;
    }
    const doc = await generatePdf();
    const pdfBase64 = btoa(doc.output()); // base64 of raw string
    const res = await fetch("/api/send-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: "Inventario adjunto",
        pdfBase64,
        method: sendMethod,
      }),
    });
    const json = await res.json();
  };

  return (
    <div className="grid gap-6">
      <Card className="p-4 border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label className="mb-2" htmlFor="company">
              {"Empresa"}
            </Label>
            <Select onValueChange={setCompanyNit}>
              <SelectTrigger className="bg-white border-gray-200" id="company">
                <SelectValue placeholder="Todas las empresas" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border-gray-200">
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
              <Label className="mb-2" htmlFor="email">
                {"Enviar a (correo)"}
              </Label>
              <Input
                className="border-gray-200"
                id="email"
                placeholder="destinatario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2">{"Método API"}</Label>
              <Select
                defaultValue={sendMethod}
                onValueChange={(v) => setSendMethod(v as "REST" | "SOAP")}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border-gray-200">
                  <SelectItem value="REST">{"REST (POST JSON)"}</SelectItem>
                  <SelectItem value="SOAP">{"SOAP (XML)"}</SelectItem>
                </SelectContent>
              </Select>
              <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                {"Enviar Correo"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {"Descargar PDF"}
          </Button>
          <Button
            className="border-gray-200"
            onClick={handleSend}
            variant="outline"
          >
            {"Enviar PDF (stub)"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(invHash);
            }}
          >
            {"Copiar hash"}
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-100">
              <tr className="border-b border-gray-200 bg-muted/50 text-left">
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Precio COP</th>
                <th className="p-2">Precio USD</th>
                <th className="p-2">Precio EUR</th>
                <th className="p-2">Empresa</th>
                <th className="p-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={7}>
                    Cargando inventarios...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={7}>
                    Error al cargar inventarios.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={7}>
                    No hay productos en este inventario.
                  </td>
                </tr>
              ) : (
                rows.map((inv: InventoryItem) => (
                  <tr key={inv.id} className="border-b border-gray-200">
                    <td className="p-2">{inv.product_code}</td>
                    <td className="p-2">{inv.product_name}</td>
                    <td className="p-2">{inv.price_cop.toLocaleString()}</td>
                    <td className="p-2">{inv.price_usd.toLocaleString()}</td>
                    <td className="p-2">{inv.price_eur.toLocaleString()}</td>
                    <td className="p-2">{inv.company_name}</td>
                    <td className="p-2">{inv.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

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
import axios from "axios";

export function InventoryPanel() {
  const [companyNit, setCompanyNit] = useState<string>("");
  const [email, setEmail] = useState("");
  const [sendMethod, setSendMethod] = useState<"REST" | "SOAP">("REST");
  const [emailStatus, setEmailStatus] = useState<
    null | "success" | "error" | "loading"
  >(null);
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
    if (!email) return;
    setEmailStatus("loading");

    try {
      const doc = await generatePdf();
      const pdfBase64 = btoa(doc.output());

      const response = await axios.post(
        "/api/resend/emails",
        {
          from: "Acme <onboarding@resend.dev>",
          to: email,
          subject: "Inventario adjunto",
          html: `<p>Adjunto el inventario en PDF.</p><p>Enviado desde tu aplicación de inventario.</p>`,
          attachments: [
            {
              filename: "inventario.pdf",
              content: pdfBase64,
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setEmailStatus("success");
        console.log("Email enviado exitosamente:", response.data);
      } else {
        setEmailStatus("error");
        console.error("Error en respuesta:", response.status, response.data);
      }
    } catch (error) {
      setEmailStatus("error");

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "Error de respuesta:",
            error.response.status,
            error.response.data
          );

          // Mensaje específico para error de dominio
          if (
            error.response.status === 403 &&
            error.response.data?.error?.includes("domain is not verified")
          ) {
            console.error(
              "❌ El dominio del remitente no está verificado en Resend"
            );
            console.log(
              '💡 Usa "onboarding@resend.dev" para pruebas o verifica tu dominio en https://resend.com/domains'
            );
          }
        } else if (error.request) {
          console.error("Error de red:", error.request);
        } else {
          console.error("Error de configuración:", error.message);
        }
      } else {
        console.error("Error desconocido:", error);
      }
    }

    setTimeout(() => setEmailStatus(null), 3000);
  };
  return (
    <div className="grid gap-6">
      <Card className="p-4 border-gray-200">
        {emailStatus === "success" && (
          <div className="text-green-600 mb-2">
            Correo enviado correctamente.
          </div>
        )}
        {emailStatus === "error" && (
          <div className="text-red-600 mb-2">Error al enviar el correo.</div>
        )}
        {emailStatus === "loading" && (
          <div className="text-gray-600 mb-2">Enviando correo...</div>
        )}
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
              <Button
                className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSend}
                disabled={!email || emailStatus === "loading"}
              >
                {emailStatus === "loading" ? "Enviando..." : "Enviar Correo"}
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

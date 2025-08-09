import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { Check, Copy, Wallet } from "lucide-react"
import { recoverMessageAddress } from "viem/utils"

declare global {
  interface Window {
    ethereum?: any
  }
}

export function ProofPanel({ inventoryHash }: { inventoryHash: string }) {
  const [address, setAddress] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [verified, setVerified] = useState<boolean>(false)

  const connectAndSign = async () => {
    if (!window.ethereum) {
      alert("Necesitas MetaMask u otra wallet EVM inyectada.")
      return
    }
    const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" })
    setAddress(acc)
    const msg = `Inventario Hash: ${inventoryHash}`
    const sig = await window.ethereum.request({
      method: "personal_sign",
      params: [msg, acc],
    })
    setSignature(sig)
    try {
      const rec = await recoverMessageAddress({ message: msg, signature: sig as `0x${string}` })
      setVerified(rec.toLowerCase() === acc.toLowerCase())
    } catch {
      setVerified(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-sm text-muted-foreground">{"Prueba de Existencia (Blockchain)"}</div>
          <div className="text-sm">
            {"Firma el hash del inventario con tu wallet (EIP-191). Verificamos localmente la firma con viem."}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={connectAndSign} className="bg-violet-600 hover:bg-violet-700">
            <Wallet className="mr-2 h-4 w-4" />
            {address ? "Firmar de nuevo" : "Conectar y firmar"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(inventoryHash)}
            aria-label="Copiar hash"
          >
            <Copy className="mr-2 h-4 w-4" />
            {"Copiar hash"}
          </Button>
        </div>
        <div className="grid gap-1 text-sm">
          <div>
            <span className="font-medium">{"Wallet: "}</span>
            <span className="text-muted-foreground">{address || "No conectada"}</span>
          </div>
          <div className="break-all">
            <span className="font-medium">{"Firma: "}</span>
            <span className="text-muted-foreground">{signature || "Sin firmar"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{"Verificación: "}</span>
            {verified ? (
              <span className="inline-flex items-center text-emerald-600">
                <Check className="mr-1 h-4 w-4" />
                {"Válida"}
              </span>
            ) : (
              <span className="text-muted-foreground">{"No verificada"}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

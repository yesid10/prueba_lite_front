"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useRef, useState } from "react"
import { Loader2, Wand2 } from "lucide-react"

// Lazy import to avoid SSR issues in Next.js
type WebLLM = typeof import("@mlc-ai/web-llm")

export function AIAssistant() {
  const [prompt, setPrompt] = useState("Producto eco amigable para oficina con enfoque ergonómico")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const engineRef = useRef<any>(null)
  const [supported, setSupported] = useState<boolean>(false)

  useEffect(() => {
    const ok = typeof navigator !== "undefined" && "gpu" in navigator
    setSupported(ok)
  }, [])

  const ensureEngine = async () => {
    if (engineRef.current) return engineRef.current
    const webllm: WebLLM = await import("@mlc-ai/web-llm")
    const initProgress = (r: any) => {
      // Optional: could show model loading progress
      // console.log("web-llm:", r)
    }
    // Use a tiny model for quick demo
    const engine = await webllm.CreateMLCEngine("Qwen2-0.5B-Instruct-q4f16_1-MLC", {
      initProgressCallback: initProgress,
    })
    engineRef.current = engine
    return engine
  }

  const run = async () => {
    setLoading(true)
    setOutput("")
    try {
      if (!supported) {
        const template = `Ideas de nombres:
- ${prompt.split(" ").slice(0, 2).join(" ")} Pro
- ${prompt.split(" ").slice(0, 1).join(" ")} Max
- ${prompt.split(" ").slice(-1).join(" ")} Air

Características:
- Diseño ergonómico y materiales sostenibles.
- Bajo consumo energético.
- Garantía extendida.`
        setOutput(template)
        return
      }
      const engine = await ensureEngine()
      const sys = "Eres un asistente creativo que propone nombres y características concisas de productos."
      const messages = [
        { role: "system", content: sys },
        {
          role: "user",
          content: `Genera 3 nombres pegajosos y 5 características para: ${prompt}. Responde en español.`,
        },
      ]
      const reply = await engine.chat.completions.create({
        messages,
        temperature: 0.7,
        stream: true,
      } as any)

      for await (const delta of reply) {
        const token = delta.choices?.[0]?.delta?.content || ""
        setOutput((prev) => prev + token)
      }
    } catch (e) {
      setOutput("No fue posible ejecutar el modelo. Usa el fallback local.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="grid gap-3">
        <div className="text-sm text-muted-foreground">
          {"Funciona 100% en el navegador con WebGPU. Si no está disponible, usamos un fallback local simple."}
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe tu producto..." />
          <Button onClick={run} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {"Generar"}
          </Button>
        </div>
        <Textarea value={output} readOnly rows={10} />
        <div className="text-xs text-muted-foreground">
          {supported ? "WebGPU detectado ✓" : "WebGPU no disponible, usando fallback ✗"}
        </div>
      </div>
    </Card>
  )
}

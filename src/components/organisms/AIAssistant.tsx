import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

export function AIAssistant() {
  const [prompt, setPrompt] = useState(
    "Producto eco amigable para oficina con enfoque ergonómico"
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput("");
    try {
      const apiKey =
        "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";
      const sys =
        "Eres un asistente creativo que propone nombres y características concisas de productos.";
      const messages = [
        { role: "system", content: sys },
        {
          role: "user",
          content: `Genera 3 nombres pegajosos y 5 características para: ${prompt}. Responde en español.`,
        },
      ];
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo-0125",
            messages,
            temperature: 0.7,
          }),
        }
      );
      if (!response.ok) throw new Error("Error en la API de OpenAI");
      const data = await response.json();
      setOutput(data.choices?.[0]?.message?.content || "Sin respuesta");
    } catch (e) {
      setOutput("No fue posible ejecutar la consulta a ChatGPT.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="grid gap-3 ">
        <div className="text-sm text-muted-foreground">
          {
            "Funciona con ChatGPT (OpenAI). No expongas tu API key en producción."
          }
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            className="border-gray-200"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe tu producto..."
          />
          <Button
            onClick={run}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {"Generar"}
          </Button>
        </div>
        <Textarea
          className="border-gray-200"
          value={output}
          readOnly
          rows={10}
        />
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import axios from "axios";

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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setOutput("Error: API key de Gemini no configurada. Verifica tu archivo .env");
        return;
      }
      
      const promptText = `Genera 3 nombres pegajosos y 5 características para: ${prompt}. Responde en español.`;
      
      const urlGemini = import.meta.env.VITE_GEMINI_URL || `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=`
      const response = await axios.post(
        `${urlGemini}${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: promptText
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const data = response.data;
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
      setOutput(generatedText);
    } catch (e) {
      console.error("Error con Gemini:", e);
      setOutput("No fue posible ejecutar la consulta a Gemini. Verifica tu API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 border-gray-200">
      <div className="grid gap-3 ">
        <div className="text-sm text-muted-foreground">
          {
            "Funciona con Google Gemini. Obtén tu API key gratuita en Google AI Studio."
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

import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Building2, Boxes, Bot, ShieldCheck, LogIn } from "lucide-react"

const HomePage = () => {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-violet-50 ">
      <section className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            {"Prueba Técnica Lite Thinking - 2025"}
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {"Frontend de Prueba: Empresas, Productos e Inventario"}
          </h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {
              "Aplicando Atomic Design, autenticación con contraseña encriptada, generación de PDF, envío por API (stub), IA on-device y firma Web3 para prueba de existencia."
            }
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link className="text-white flex justify-center items-center" to="/login">

                <LogIn className=" mr-2 h-4 w-4" />
                {"Iniciar sesión"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                {"Empresas"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/ai-assistant">
                <Bot className="mr-2 h-4 w-4 text-violet-500" />
                {"Asistente IA"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-emerald-100 dark:border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                {"Roles y seguridad"}
              </CardTitle>
              <CardDescription>{"Admin y Externo, password encriptado con bcrypt."}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                <li>{"Admin: CRUD de empresas, registro de productos e inventario."}</li>
                <li>{"Externo: vista de empresas como visitante."}</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-violet-100 dark:border-violet-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-violet-600" />
                {"Inventario y PDF"}
              </CardTitle>
              <CardDescription>{"Descarga PDF y envíalo por API REST/SOAP (stub)."}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                <li>{"Tabla por empresa con QR y hash de prueba de existencia."}</li>
                <li>{"Firma Web3 del hash con MetaMask."}</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 dark:border-emerald-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-emerald-600" />
                {"IA On-Device"}
              </CardTitle>
              <CardDescription>{"Genera nombres/características de productos (WebGPU)."}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                <li>{"@mlc-ai/web-llm sin API keys."}</li>
                <li>{"Fallback amigable si no hay WebGPU."}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

export default HomePage
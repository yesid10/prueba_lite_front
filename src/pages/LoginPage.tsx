import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { userAuth } from "@/zustand/authUser"
import { useEffect } from "react"

const LoginPage = () => {
    const navigate = useNavigate()
    const { login, loading, error, isAuthenticated } = userAuth();

    // Redireccionar si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/companies")
        }
    }, [isAuthenticated, navigate])

    const schema = z.object({
        email: z.string().email("Correo inválido"),
        password: z.string().min(6, "Mínimo 6 caracteres"),
    })

    type FormValues = z.infer<typeof schema>

 
    const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })

    // Seed an admin account if user store is empty (demo).
    // admin@example.com / Admin#123
    //   seedAdminIfEmpty()

    const onSubmit = async (values: FormValues) => {
        try {
            await login(values.email, values.password);
            // No necesitas navegar aquí, el useEffect se encargará de eso
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    }
    
    return (
        <main className="min-h-[100dvh] grid place-items-center bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),rgba(139,92,246,0.15))]">
            <Card className="border-0 shadow-sm w-full max-w-md">
                <CardHeader>
                    <CardTitle>{"Iniciar sesión"}</CardTitle>
                    <CardDescription>{"Admin y Externo. Contraseña encriptada con bcrypt."}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                        aria-label="Formulario de inicio de sesión"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email">{"Correo"}</Label>
                            <Input className="border-gray-300" id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">{"Contraseña"}</Label>
                            <Input className="border-gray-300" id="password" type="password" placeholder="••••••••" {...form.register("password")} />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col text-amber-50">
                            <Button 
                                type="submit" 
                                className="bg-emerald-600 hover:bg-emerald-700 w-full"
                                disabled={loading}
                            >
                                {loading ? "Cargando..." : "Entrar"}
                            </Button>
                            <Button className="w-full mt-1.5 text-black bg-transparent shadow-gray-300">
                                <Link to="/companies">{"Entrar como visitante"}</Link>
                            </Button>
                            {error && (
                                <p className="mt-2 text-sm text-red-500">{error}</p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">{"Demo Admin: admin@example.com / Admin#123"}</p>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}

export default LoginPage
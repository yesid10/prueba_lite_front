import { Outlet } from "react-router"
import { Building2, Package, Boxes, Bot, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router"
import { userAuth } from "@/zustand/authUser"

const Layout = () => {
  const navigate = useNavigate()
  const { user } = userAuth()

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token")
      navigate("/")
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-gray-200 bg-white/70 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Mi Aplicación</h1>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                {"Empresas"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/products">
                <Package className="mr-2 h-4 w-4" />
                {"Productos"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/inventory">
                <Boxes className="mr-2 h-4 w-4" />
                {"Inventario"}
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/ia">
                <Bot className="mr-2 h-4 w-4" />
                {"Asistente IA"}
              </Link>
            </Button>

            {user ? (
              <Button onClick={handleLogout} variant="outline" className="ml-2 bg-transparent">
                <LogOut className="mr-2 h-4 w-4" />
                {"Salir"}
              </Button>
            ) : (
              <Button asChild className="ml-2 bg-emerald-600 hover:bg-emerald-700">
                <Link to="/login">{"Entrar"}</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
# Sistema de Gestión Empresarial

## 📋 Descripción del Proyecto

Este es un sistema de gestión desarrollado con React, TypeScript y Vite. El proyecto incluye funcionalidades para la gestión de empresas, productos, inventario y asistente de IA, con una interfaz moderna y responsive.

## ✨ Características Principales

- **Gestión de Empresas**: CRUD completo para empresas
- **Gestión de Productos**: Administración de catálogo de productos
- **Control de Inventario**: Seguimiento de stock y movimientos
- **Asistente de IA**: Integración con modelos de lenguaje para asistencia
- **Sistema de Autenticación**: Login y gestión de usuarios
- **Generación de Reportes**: Exportación a PDF con tablas
- **Envío de Emails**: Integración con Resend para notificaciones
- **Diseño Responsive**: Interfaz adaptada a diferentes dispositivos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Zustand** - Gestión de estado global
- **React Router** - Enrutamiento de la aplicación
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas


### Utilidades
- **Axios** - Cliente HTTP
- **jsPDF** - Generación de PDFs
- **QRCode** - Generación de códigos QR
- **Resend** - Servicio de envío de emails

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd front
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
# API Keys
VITE_RESEND_API_KEY=tu_api_key_de_resend
VITE_GEMINI_API_KEY=api_de_gemini

# URLs de API (si es necesario)
VITE_API_URL=http://localhost:3000/api
VITE_RATES_URL=
VITE_GEMINI_URL=
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── atoms/          # Componentes básicos (botones, inputs)
│   ├── molecules/      # Componentes compuestos (formularios)
│   ├── organisms/      # Componentes complejos (tablas, paneles)
│   └── ui/             # Componentes de interfaz base
├── pages/              # Páginas de la aplicación
├── services/           # Servicios de API y lógica de negocio
├── zustand/            # Stores de estado global
├── utils/              # Utilidades y helpers
├── layout/             # Componentes de layout
└── routes/             # Configuración de rutas
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter de código

## 🌐 Funcionalidades por Página

### HomePage
- Dashboard principal con resumen de datos
- Navegación a todas las funcionalidades

### CompanyPage
- Lista de empresas con búsqueda
- Formulario para crear/editar empresas

### ProductsPage
- Catálogo de productos
- Formulario de productos con validaciones
- Exportación de datos a PDF

### InventoryPage
- Control de stock y movimientos
- Panel de inventario
- Gestión de entradas y salidas

### AIAssistantPage
- Chat con asistente de IA

### LoginPage
- Autenticación de usuarios


## 📧 Configuración de Email

El proyecto incluye integración con Resend para el envío de emails:

1. Obtener API key de [Resend](https://resend.com)
2. Configurar en variables de entorno
3. Usar el endpoint `/api/resend/emails` para envíos
---

**Desarrollado con ❤️ usando React, TypeScript y Vite**

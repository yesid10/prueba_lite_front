# Notas de Implementación

- Este proyecto usa Next.js (Next.js) con Atomic Design en `components/atoms`, `molecules`, `organisms`, `templates`.
- Estado global con Zustand (`stores/*`).
- Autenticación con contraseña encriptada (bcryptjs). Usuario demo: admin@example.com / Admin#123
- Productos con precios en múltiples monedas (consulta libre a exchangerate.host).
- Inventario genera PDF (jsPDF + autotable) con QR y hash; envío por API es un stub (`/api/send-pdf`).
- IA on-device con `@mlc-ai/web-llm` (no requiere API keys, requiere WebGPU).
- Prueba de existencia Web3: firma el hash vía MetaMask y verifica con `viem`.

Para enviar correos reales:
- Conecta `/api/send-pdf` a tu backend (FastAPI/Django) o proveedor (Resend, SendGrid, Mailersend).

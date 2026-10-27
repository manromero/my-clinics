# MyClinics

Aplicación para gestionar clínicas, actividad e ingresos de una profesional dental.

Cascarón generado con el asistente oficial de Next.js y pnpm: App Router, TypeScript, CSS Modules y ESLint. Prettier configura el formato. Código en src/ y alias @/*.

## Desarrollo local

Requiere Node.js 20.9 o superior (entorno de creación: Node.js 24) y pnpm 11.25.0.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Abre http://localhost:3000.

## Comandos

| Comando           | Uso                                             |
| ----------------- | ----------------------------------------------- |
| pnpm dev          | Servidor de desarrollo                          |
| pnpm build        | Compilación de producción                       |
| pnpm start        | Servir la compilación de producción             |
| pnpm lint         | Análisis estático con ESLint                    |
| pnpm typecheck    | Generar tipos de Next.js y comprobar TypeScript |
| pnpm format       | Aplicar Prettier                                |
| pnpm format:check | Comprobar el formato                            |

## Estructura

- src/app/layout.tsx: layout raíz, metadatos e idioma.
- src/app/page.tsx: inicio mínimo.
- src/app/page.module.css: estilos de la página.
- src/app/globals.css: estilos globales.

El repositorio está en MyClinics/my-clinics. El Excel de referencia se mantiene en la carpeta superior, fuera del código. Los archivos Excel también están excluidos de Git.

## Alcance inicial

1. Gestión de clínicas y porcentajes por tipo de actividad.
2. Registro de actividad, con honorarios por porcentaje o importe directo.
3. Resumen mensual por clínica.

Este cascarón aún no implementa esos módulos. Facturas, contraste de importes e integración de IA se abordarán en futuras iteraciones.

Referencia: [instalación oficial de Next.js](https://nextjs.org/docs/app/getting-started/installation).

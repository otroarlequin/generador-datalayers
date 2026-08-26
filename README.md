# Generador de dataLayers

Aplicación web para crear **Guías de Medición** con eventos dataLayer, vista previa en tiempo real, exportación (HTML, Markdown, PDF) y biblioteca reutilizable.

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router
- IndexedDB (`idb`)

## Inicio rápido

```bash
npm install
npm run dev
```

Abrir **http://localhost:5173**

## Colaboración (GitHub + Cursor)

| Recurso | Para qué sirve |
|---------|----------------|
| [`AGENTS.md`](./AGENTS.md) | Contexto del proyecto para Cursor y agentes |
| [`docs/COLLABORATION.md`](./docs/COLLABORATION.md) | Cómo clonar, compartir y continuar el trabajo |
| **Exportar backup JSON** (en la app) | Mover guías entre equipos o máquinas |
| **Exportar Markdown** (en el editor) | Entregable versionable en GitHub |

Los datos de las guías viven en el navegador (IndexedDB). Para compartirlos, exporte un backup JSON o commitee archivos en [`data/`](./data/).

## Funcionalidades

- Guías multi-evento con cliente y proyecto
- Tipos de evento: UA Event, NI Event, Custom
- Capturas, script dataLayer, especificación técnica
- Checklist de QA editable por guía
- Vista previa en vivo
- Exportación HTML, Markdown y PDF
- Biblioteca DataLayer reutilizable
- Internacionalización: ES / EN / PT
- Temas claro y oscuro

## Producción

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  components/     # UI y layout
  features/       # Guía, eventos, exportación
  generators/     # Script y documento
  hooks/          # Estado de guías y biblioteca
  i18n/           # Traducciones
  pages/          # Guías, editor, biblioteca
  services/       # IndexedDB, exportación, backup
  types/          # Modelos TypeScript
  utils/          # Utilidades
data/
  backups/        # JSON compartidos (opcional)
  exports/        # MD/HTML de entregas (opcional)
```

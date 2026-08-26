# Generador de dataLayers — contexto para Cursor

## Qué es este proyecto

Aplicación SPA para crear **Guías de Medición** (eventos dataLayer) con preview en vivo, exportación (HTML, Markdown, PDF) y biblioteca reutilizable en IndexedDB.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4
- React Router
- IndexedDB (`idb`)

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Arquitectura

| Carpeta | Responsabilidad |
|---------|-----------------|
| `src/pages/` | Guías, editor, biblioteca |
| `src/features/` | Formularios, preview, exportación |
| `src/generators/` | `scriptGenerator`, `documentGenerator` (DRY) |
| `src/services/` | IndexedDB, guías, biblioteca, export |
| `src/hooks/` | `useGuide`, `useGuides`, `useLibrary` |
| `src/types/` | Modelos TypeScript |
| `src/i18n/locales/` | ES, EN, PT |

## Modelo de datos

- **MeasurementGuide**: título, cliente, proyecto, checklist QA, eventos[]
- **MeasurementEvent**: UA/NI/Custom, campos dataLayer, captura, disparo, spec técnica
- **LibraryEvent**: snapshot en biblioteca con firma de payload

Persistencia local en IndexedDB. Para compartir trabajo entre personas, usar **Exportar backup JSON** e **Importar backup JSON** en la página Guías, o commitear archivos en `data/backups/`.

## Reglas de implementación

- Mantener generadores DRY: un solo `buildDataLayerPayload` y `buildGuideDocument`
- No inventar contenido en especificación técnica; campos editables por el usuario
- i18n obligatorio para textos de UI (es, en, pt)
- Español formal y neutro en documentación
- Prioridad: código limpio, componentes reutilizables, tipado estricto

## Exportaciones

| Formato | Uso |
|---------|-----|
| Markdown | Entregable al cliente; también legible en GitHub |
| HTML | Documento imprimible / compartible |
| PDF | Entrega formal |
| JSON backup | Continuar trabajo en otra máquina o colaborador |

## Pendientes conocidos (v1+)

- Autenticación multi-usuario
- Backend / sync en la nube
- Valores finales de prioridad e interacción (placeholders actuales)

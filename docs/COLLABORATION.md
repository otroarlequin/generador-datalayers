# Colaboración con GitHub y Cursor

Este documento describe cómo compartir el proyecto y continuar el trabajo en otra máquina o con otra persona.

## Qué va en GitHub (código)

El repositorio contiene la **aplicación**: código fuente, configuración y documentación. Cualquier colaborador puede clonarlo y ejecutarlo localmente.

```bash
git clone https://github.com/<usuario>/generador-datalayers.git
cd generador-datalayers
npm install
npm run dev
```

Abrir `http://localhost:5173` (no el puerto 8501, que corresponde a otras apps Streamlit).

## Qué no va automáticamente en GitHub (datos)

Las guías y la biblioteca viven en **IndexedDB del navegador**. No se sincronizan con Git por defecto.

Para compartir el trabajo documentado (eventos, guías, checklist):

### Opción A — Backup JSON (recomendada para continuar editando)

1. En la app: **Guías → Exportar backup JSON**
2. Compartir el archivo `.json` (email, Drive, o commitearlo en `data/backups/`)
3. El colaborador: **Guías → Importar backup JSON**

Ventaja: restaura guías completas con eventos, capturas y checklist.

### Opción B — Markdown de entrega (recomendada para clientes)

1. En el editor de guía: **Exportar Markdown**
2. Guardar el `.md` en `data/exports/` y commitearlo si se desea versionar la entrega

Ventaja: legible en GitHub, ideal para revisión y entrega. No reimporta a la app.

### Opción C — Ambos

- JSON para seguir editando en la herramienta
- MD/HTML/PDF para entregar al cliente o al equipo de desarrollo

## Flujo recomendado en Cursor

1. Clonar el repo y abrir la carpeta en Cursor
2. Leer `AGENTS.md` (contexto para el agente)
3. Ejecutar `npm run dev`
4. Importar backup JSON si se recibió uno
5. Trabajar en ramas y abrir Pull Requests en GitHub

## Estructura de carpetas para datos compartidos

```
data/
  backups/     # JSON exportados (opcional en git)
  exports/     # MD/HTML de entregas (opcional en git)
```

Los archivos en `data/` pueden versionarse si el equipo lo acuerda. No incluir secretos ni credenciales.

## Permisos en GitHub

- **Private**: solo invitados ven el repo
- **Collaborator**: Settings → Collaborators → Add people

El colaborador clona, instala dependencias e importa el backup JSON para retomar exactamente donde se dejó.

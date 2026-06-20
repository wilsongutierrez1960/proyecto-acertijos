# Banco de Conocimiento QPM — AcertiLab

Base de embeddings para el futuro tutor local (Ollama). Roadmap #5.

## Archivos

| Archivo | Contenido |
|---|---|
| `QPM_Knowledge_Base.md` | Documento de referencia humano-legible (13 capítulos) |
| `QPM_Embedding_Chunks.json` | 44 chunks etiquetados, listos para generar embeddings |
| `QPM_Implementation_Guide.md` | Script Python + pasos para generar embeddings y RAG con Ollama |

## Taxonomía de módulos (oficial)

`M0-Intro` · `M1-Fundamentos` · `M2-Estructura` · `M3-Extensiones` ·
**`M4-Datos`** · **`M5-Kalman`** · **`M6-Calibración`** · `M7-Solución` ·
`M8-Aplicaciones` · `M9-Validación` · `M10-Adaptaciones` · `M11-Técnico` · `Glosario`

Los tags en negrita coinciden 1:1 con las secciones M4/M5/M6 ya usadas en
`acertilab-qpm-c.html` (Módulo C). Se descartó la numeración alternativa
de `Estructura_Banco_Conocimiento.pdf` (donde M4=Kalman) por incompatibilidad
con el código en producción.

## Metadata por chunk

Cada entrada de `QPM_Embedding_Chunks.json` tiene:
`id`, `module`, `title`, `content`, `tags`, `type`, `generic_flag`, `source`.

- `type` y `generic_flag` se agregaron en esta sesión (no estaban en el JSON
  original generado por Kimi), tomando la idea de `grok_report.pdf`.
- `generic_flag: false` solo en `M10-002` y `M10-003` (módulo de Adaptaciones
  por país — mencionan Ghana, Sri Lanka, WAEMU, Laos a propósito, es el único
  módulo donde corresponde). El resto es 100% genérico.

## Dos niveles de procedencia (44 + 8 chunks)

| Rango de IDs | Origen | Confiabilidad |
|---|---|---|
| `M0-001` … `M11-003`, `Glosario-*` (44 chunks) | Síntesis de Kimi (LLM) a partir de su conocimiento sobre papers públicos del FMI | Buena para v1, no verbatim de fuente primaria |
| `M2-TNM-00X`, `M6-TNM-00X`, `M11-TNM-001` (8 chunks nuevos) | **Extraídos directamente** del texto real de *Solving the Canonical QPM Using EViews* (TNM/2026/03, Ouliaris & Rochon, IMF) | Alta — fuente primaria, ecuaciones y Tabla 1 de calibración exactas |

Se decidió **no reemplazar** los chunks de Kimi en M2/M6, sino agregar los del
TNM como complemento con `source` explícito. El sistema de retrieval puede
priorizar los `*-TNM-*` cuando ambos compiten por relevancia, dado que citan
la fuente primaria.

## Sobre el curso edX (IMFx: Monetary Policy Analysis and Forecasting / MPAFx)

No se pudo ni se intentó extraer contenido del curso: es material privativo
de la plataforma (videos, transcripciones, foros) protegido por copyright y
con muro de inscripción/login. La única información pública disponible es la
descripción de una línea en la página de marketing del curso, que no incluye
el temario semanal real (se carga vía JavaScript dentro de la plataforma).

Dato relevante igualmente: el propio TNM/2026/03 indica en una nota al pie
que sus gráficos de "stylized facts" están basados en los que se producen
con IRIS/MATLAB para ese mismo curso (impartido por el Institute for Capacity
Development del FMI) — es decir, **el TNM es la fuente pública más cercana
al contenido real del curso** que se puede usar legítimamente en este banco
de conocimiento.

## Procedencia y nivel de confianza ⚠️

Este contenido fue **sintetizado por un LLM** (Kimi) a partir de su conocimiento
sobre documentos públicos del FMI citados en `QPM_Implementation_Guide.md`
(Berg/Karam/Laxton 2006, Technical Note EViews 2026, Nalban & Zanna 2025, etc.),
**no extraído directamente de los PDFs originales**. Es información de dominio
público y no contiene nada sensible, pero al ser una síntesis puede tener
imprecisiones puntuales en detalles técnicos (notación exacta de parámetros,
matices entre versiones del modelo).

**Tratamiento recomendado para esta etapa (#5):** usarlo como v1 funcional
para probar el pipeline completo (chunking → embeddings → retrieval → tutor)
sin esperar a tener los PDFs primarios. Si en el futuro se consiguen los
documentos fuente reales, conviene regenerar/corregir los chunks de
`M2-Estructura` (ecuaciones core) y `M6-Calibración` (valores numéricos)
contra el texto original — son los módulos más sensibles a errores de síntesis.

## Próximo paso (#6)

`QPM_Implementation_Guide.md` ya incluye el script de embeddings con
`ollama pull nomic-embed-text` y el sistema de retrieval filtrado por módulo —
es el punto de partida para la integración Ollama local en el HP250G7.

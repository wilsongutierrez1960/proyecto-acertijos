
# GUÍA: Banco de Conocimiento QPM para Tutor Ollama
## Quarterly Projection Model (QPM) del FMI - Sistema de Embeddings

---

## 1. RESUMEN DEL PROYECTO

Este banco de conocimiento está diseñado para alimentar un tutor basado en Ollama
que enseña el Quarterly Projection Model (QPM) del FMI de manera genérica (no
específica de país), enfocándose en sus características técnicas y capacidad de
predicción de variables de política monetaria.

### Estructura de Módulos
Los documentos están segmentados en chunks etiquetados por módulo para que el tutor
responda "en contexto" del módulo donde se encuentra el alumno:

| Módulo | Tema | Chunks |
|--------|------|--------|
| M0-Intro | Introducción y Visión General | 3 |
| M1-Fundamentos | Fundamentos Teóricos | 3 |
| M2-Estructura | Estructura del Modelo Core | 4 |
| M3-Extensiones | Componentes Extendidos | 4 |
| M4-Datos | Datos y Análisis de Tendencias | 4 |
| M5-Kalman | Filtro de Kalman y Espacio de Estados | 3 |
| M6-Calibración | Calibración del Modelo | 4 |
| M7-Solución | Solución y Pronósticos | 3 |
| M8-Aplicaciones | Aplicaciones de Política Monetaria | 4 |
| M9-Validación | Validación y Desempeño | 3 |
| M10-Adaptaciones | Adaptaciones por País | 3 |
| M11-Técnico | Implementación Técnica | 3 |
| Glosario | Términos Clave | 3 |

**Total: 44 chunks**

---

## 2. FUENTES DOCUMENTALES PRINCIPALES

### Documentos Fundamentales (Genéricos, no país-específicos):

1. **Berg, Karam, y Laxton (2006)** - "A Practical Model-Based Approach to Monetary Policy Analysis—Overview"
   - IMF Working Paper 06/80
   - El documento fundacional del QPM canónico
   - URL: https://www.imf.org/-/media/Files/Publications/WP/2006/English/wpea2006080.pdf

2. **"Solving the Canonical Quarterly Projection Model Using EViews"** (2026)
   - IMF Technical Note
   - Guía paso a paso para calibrar y resolver el QPM canónico
   - Incluye código EViews y explicaciones detalladas
   - URL: https://www.elibrary.imf.org/view/journals/005/2026/003/article-A001-en.xml

3. **"QPM-Based Analysis of Weather Shocks and Monetary Policy in Developing Countries"** (2025)
   - IMF Working Paper 25/95 (Nalban y Zanna)
   - Explica la estructura canónica y extensiones
   - URL: https://www.imf.org/-/media/files/publications/wp/2025/english/wpiea2025095-print-pdf.pdf

4. **Curso MPAFx del FMI** - "Model-Based Monetary Policy Analysis and Forecasting"
   - Curso en línea del Institute for Capacity Development
   - Cubre estructura del modelo, implementación en MATLAB/Octave/IRIS
   - URL: https://www.imf.org/en/capacity-development/training/icdtc/courses/mpafx

5. **"Taking Stock of IMF Capacity Development on Monetary Policy Forecasting and Policy Analysis Systems"**
   - IMF Departmental Paper 2021/026 (Mæhle et al.)
   - Panorama de las prácticas de FPAS/QPM del FMI

### Documentos de Referencia por Módulo:

| Módulo | Documentos Recomendados |
|--------|------------------------|
| M0-Intro | Berg et al. (2006), Mæhle et al. (2021) |
| M1-Fundamentos | Berg et al. (2006), Nalban & Zanna (2025) |
| M2-Estructura | Berg et al. (2006), Technical Note EViews (2026) |
| M3-Extensiones | Nalban & Zanna (2025), Ghana QPM (2024) |
| M4-Datos | Technical Note EViews (2026), Czech National Bank QPM |
| M5-Kalman | Laos QPM Thesis (Sayaphone, 2023) |
| M6-Calibración | Technical Note EViews (2026), Nalban & Zanna (2025) |
| M7-Solución | Technical Note EViews (2026) |
| M8-Aplicaciones | Nalban & Zanna (2025), Various country QPMs |
| M9-Validación | WAEMU QPM (2022), Sri Lanka QPM (2018) |
| M10-Adaptaciones | Various country-specific IMF Working Papers |
| M11-Técnico | MPAFx Course, Technical Note EViews (2026) |

---

## 3. ESTRUCTURA DE LOS CHUNKS PARA EMBEDDINGS

### Formato JSON por Chunk:
```json
{
  "id": "M2-001",
  "module": "M2-Estructura",
  "title": "Curva IS - Demanda Agregada",
  "content": "...texto del chunk...",
  "tags": ["IS curve", "demanda agregada", "brecha de producto", ...]
}
```

### Campos:
- **id**: Identificador único (formato: Módulo-Número)
- **module**: Etiqueta del módulo para filtrado contextual
- **title**: Título descriptivo del contenido
- **content**: Texto del chunk (optimizado para embeddings)
- **tags**: Palabras clave para búsqueda semántica

### Estrategia de Chunking:
- Cada chunk tiene entre 500-1500 caracteres
- Contenido autocontenido (puede entenderse independientemente)
- Incluye ecuaciones clave en formato LaTeX-like
- Tags en español e inglés para búsqueda bilingüe
- Referencias cruzadas implícitas a través de tags compartidos

---

## 4. INSTRUCCIONES PARA GENERAR EMBEDDINGS CON OLLAMA

### Paso 1: Instalar Ollama y modelo de embeddings
```bash
# Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo de embeddings (ejemplo: nomic-embed-text)
ollama pull nomic-embed-text

# O usar mxbai-embed-large para embeddings de mayor calidad
ollama pull mxbai-embed-large
```

### Paso 2: Script Python para generar embeddings
```python
import json
import ollama
import numpy as np

# Cargar chunks
with open('QPM_Embedding_Chunks.json', 'r', encoding='utf-8') as f:
    chunks = json.load(f)

# Generar embeddings
embeddings = []
for chunk in chunks:
    # Combinar título y contenido para el embedding
    text_to_embed = f"{chunk['title']}
{chunk['content']}"

    response = ollama.embeddings(
        model='nomic-embed-text',
        prompt=text_to_embed
    )

    embeddings.append({
        'id': chunk['id'],
        'module': chunk['module'],
        'title': chunk['title'],
        'embedding': response['embedding'],
        'tags': chunk['tags']
    })

# Guardar embeddings
with open('QPM_Embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(embeddings, f, ensure_ascii=False)
```

### Paso 3: Sistema de recuperación (Retrieval)
```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def retrieve_relevant_chunks(query, embeddings_data, top_k=5, module_filter=None):
    """
    Recupera los chunks más relevantes para una consulta.

    Args:
        query: Pregunta del usuario
        embeddings_data: Lista de chunks con embeddings
        top_k: Número de chunks a recuperar
        module_filter: Filtrar por módulo específico (opcional)
    """
    # Generar embedding de la consulta
    query_embedding = ollama.embeddings(
        model='nomic-embed-text',
        prompt=query
    )['embedding']

    # Filtrar por módulo si se especifica
    candidates = embeddings_data
    if module_filter:
        candidates = [c for c in candidates if c['module'] == module_filter]

    # Calcular similitud coseno
    similarities = []
    for chunk in candidates:
        sim = cosine_similarity(
            [query_embedding],
            [chunk['embedding']]
        )[0][0]
        similarities.append((chunk, sim))

    # Ordenar por similitud y retornar top_k
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]
```

### Paso 4: Generar respuesta con contexto
```python
def generate_tutor_response(query, module_context=None):
    """
    Genera una respuesta del tutor usando RAG.
    """
    # Recuperar chunks relevantes
    relevant = retrieve_relevant_chunks(
        query, 
        embeddings_data, 
        module_filter=module_context
    )

    # Construir contexto
    context = "\n\n".join([
        f"[{chunk['id']}] {chunk['title']}:\n{chunk['content']}"
        for chunk, _ in relevant
    ])

    # Prompt para el tutor
    prompt = f"""Eres un tutor experto en el Quarterly Projection Model (QPM) del FMI.
Responde la siguiente pregunta basándote ÚNICAMENTE en el contexto proporcionado.
Si la información no está en el contexto, indica que no tienes esa información.

Contexto:
{context}

Pregunta del alumno: {query}

Responde de manera clara, técnica pero accesible, usando ecuaciones cuando sea relevante.
"""

    # Generar respuesta con Ollama
    response = ollama.generate(
        model='llama3.1',  # o el modelo que prefieras
        prompt=prompt,
        options={'temperature': 0.3}
    )

    return response['response']
```

---

## 5. EJEMPLOS DE CONSULTAS POR MÓDULO

### M0-Intro:
- "¿Qué es el QPM y para qué sirve?"
- "¿Cuáles son las características principales del QPM?"
- "¿Cómo se relaciona el QPM con el FPAS?"

### M1-Fundamentos:
- "¿Cuáles son los fundamentos teóricos del QPM?"
- "¿Qué es el enfoque de brechas (gap approach)?"
- "¿Qué supuestos de economía abierta pequeña hace el QPM?"

### M2-Estructura:
- "¿Cuál es la ecuación de la curva IS en el QPM?"
- "¿Cómo se especifica la curva de Phillips?"
- "¿Qué es la UIP y cómo se modela?"
- "¿Cómo funciona la regla de Taylor en el QPM?"

### M3-Extensiones:
- "¿Cómo se descompone el QPM sectorialmente?"
- "¿Qué incluye el bloque fiscal?"
- "¿Cómo se modela el sector externo?"

### M4-Datos:
- "¿Qué datos se necesitan para el QPM?"
- "¿Cómo se hace la descomposición tendencia-ciclo?"
- "¿Qué métodos de ajuste estacional se usan?"

### M5-Kalman:
- "¿Cómo se representa el QPM en espacio de estados?"
- "¿Para qué se usa el filtro de Kalman en el QPM?"
- "¿Cómo se identifican los choques estructurales?"

### M6-Calibración:
- "¿Por qué se prefiere la calibración sobre la estimación?"
- "¿Cuáles son los pasos de calibración del QPM?"
- "¿Cómo se validan los parámetros calibrados?"

### M7-Solución:
- "¿Cómo se obtiene la solución de línea base?"
- "¿Cómo se realizan análisis de escenarios?"
- "¿Qué software se usa para implementar el QPM?"

### M8-Aplicaciones:
- "¿Qué trade-offs enfrenta el banco central en el QPM?"
- "¿Cómo se analizan los choques en el QPM?"
- "¿Cómo apoya el QPM la comunicación de política?"

### M9-Validación:
- "¿Cómo se valida el desempeño del QPM?"
- "¿Cuáles son las limitaciones del modelo?"

### M10-Adaptaciones:
- "¿Cómo se adapta el QPM para objetivos de inflación?"
- "¿Qué modificaciones para tipos de cambio fijos?"

### M11-Técnico:
- "¿Qué software necesito para implementar el QPM?"
- "¿Cuál es la estructura de archivos en EViews?"

---

## 6. RECOMENDACIONES PARA EL TUTOR

### Comportamiento del Tutor:
1. **Contexto de Módulo**: Cuando el alumno indica estar en un módulo específico,
   filtrar los chunks por ese módulo para respuestas más enfocadas.

2. **Respuestas Técnicas**: Incluir ecuaciones matemáticas cuando sea relevante,
   usando formato claro.

3. **Conexiones entre Módulos**: Cuando una pregunta toca múltiples módulos,
   recuperar chunks de ambos y mostrar las conexiones.

4. **Ejemplos Numéricos**: Cuando sea apropiado, proporcionar ejemplos de
   calibración con valores numéricos ilustrativos.

5. **Lenguaje**: Responder en el idioma de la consulta (español/inglés).

### Metadatos Sugeridos para el Sistema RAG:
```python
METADATA = {
    "model": "QPM-IMF-Generic",
    "version": "1.0",
    "language": "es/en",
    "total_chunks": 44,
    "embedding_model": "nomic-embed-text",
    "chunk_size": "500-1500 chars",
    "modules": [
        "M0-Intro", "M1-Fundamentos", "M2-Estructura",
        "M3-Extensiones", "M4-Datos", "M5-Kalman",
        "M6-Calibración", "M7-Solución", "M8-Aplicaciones",
        "M9-Validación", "M10-Adaptaciones", "M11-Técnico",
        "Glosario"
    ]
}
```

---

## 7. ARCHIVOS GENERADOS

1. **QPM_Knowledge_Base.md** - Documento completo de conocimiento QPM
2. **QPM_Embedding_Chunks.json** - Chunks etiquetados por módulo en formato JSON
3. **QPM_Guide.md** - Esta guía de implementación

---

## 8. PRÓXIMOS PASOS SUGERIDOS

1. Descargar los documentos fuente del FMI (especialmente Berg et al. 2006 y el Technical Note EViews 2026)
2. Ampliar chunks con contenido más detallado de las fuentes primarias
3. Generar los embeddings usando Ollama
4. Construir la interfaz del tutor (web o CLI)
5. Implementar el sistema de filtrado por módulo
6. Probar con consultas de ejemplo y ajustar retrieval
7. Añadir capacidad de seguimiento de conversación (memory)

---

*Documento generado para proyecto de tutor Ollama sobre QPM del FMI*
*Enfoque: Modelo genérico, no específico de país*
*Fecha: Junio 2026*

# Proyecto Acertijos (AcertiLab)

Plataforma de estudio local con 4 módulos de acertijos/preguntas, tutor con RAG sobre Ollama, y banco de conocimiento propio. Corre 100% en local, sin servicios externos.

---

## 1. Requisitos

- **Ollama** instalado y corriendo localmente (`ollama serve`)
  - Modelo de chat: `qwen2.5:3b` (alternativas más rápidas: `phi3:mini`, `llama3.2:3b`)
  - Modelo de embeddings: `nomic-embed-text`
- Navegador moderno (Chrome/Firefox/Edge)
- Python o cualquier servidor HTTP simple para servir los archivos estáticos (el script de arranque ya lo maneja)
- Git

## 2. Arranque rápido

### En Linux Mint
```bash
./start.sh
```

### En Windows
```bat
start.bat
```

Ambos scripts:
1. Levantan Ollama (`ollama serve`) si no está corriendo
2. Levantan un servidor HTTP local para servir `index.html` y los módulos
3. Abren el navegador automáticamente

Si el navegador no abre solo, ir manualmente a `http://localhost:<puerto>` (ver consola del script para el puerto exacto).

## 3. Estructura del proyecto

```
proyecto-acertijos/
├── index.html                  # Landing / selector de módulos
├── acertilab-tutor.js          # Tutor flotante (RAG + Ollama), compartido por los 4 módulos
├── acertilab-storage.js        # Almacenamiento unificado (localStorage)
├── acertilab-ui.js             # Helpers de UI compartidos
├── acertilab-export.js         # Exportación (en desarrollo)
├── acertilab-fun.html          # Módulo A — Matemática Curiosa
├── [módulo B].html              # QPM Núcleo
├── [módulo C].html              # QPM Aplicado
├── [módulo D].html              # QPM con modo examen (temporizador)
├── knowledge-base/
│   └── QPM_Embeddings.json     # 52 chunks con embeddings precalculados
├── start.sh                     # Script de arranque (Mint)
├── start.bat                    # Script de arranque (Windows)
└── README.md
```

> Nota: completar nombres reales de los archivos B/C/D si difieren al ajustar este README.

### El tutor (`acertilab-tutor.js`)

Un único script inyecta el widget flotante (botón 🎓) en cualquier módulo:

```html
<script src="acertilab-tutor.js"></script>
<script>
  AcertiLabTutor.init({
    moduleHint: 'M5-Kalman',   // opcional: prioriza chunks de ese módulo en el retrieval
    embeddingsPath: '...',     // opcional: default QPM_Embeddings.json
    label: 'QPM',              // opcional: nombre corto mostrado en el panel
    subjectDesc: '...'         // opcional: descripción larga para el prompt del modelo
  });
</script>
```

Como es compartido por los 4 módulos, **cualquier cambio acá debe probarse en los 4** antes de comitear.

## 4. Rutina de trabajo con Git (dos máquinas)

Este proyecto se edita desde Windows y desde Mint. Ya tuvimos un conflicto por editar en paralelo sin sincronizar — la rutina abajo es obligatoria para evitarlo.

**Antes de empezar a tocar código:**
```bash
git pull
```

**Después de cada sesión de cambios (aunque sea chica):**
```bash
git add .
git commit -m "Descripción breve del cambio"
git push
```

**Regla de oro:** nunca dejar cambios sin comitear/pushear al cambiar de máquina. Si en algún momento hay que parar a mitad de un cambio, comitear igual con un mensaje tipo `WIP: ...` antes de cerrar.

## 5. Estado del roadmap original (6 puntos)

| # | Punto | Estado |
|---|-------|--------|
| 1 | Almacenamiento unificado (localStorage) | ✅ Completo |
| 2 | Modo examen con temporizador (módulo D) | ✅ Completo — pendiente menor: verificar/pulir |
| 3 | Sistema de niveles | ⚠️ Pospuesto a "ronda 2" (requiere clasificar preguntas por dificultad) |
| 4 | Exportar a PDF | ⚠️ Pospuesto, sin discutir en detalle aún |
| 5 | Banco de conocimiento QPM (embeddings) | ✅ Completo — 52 chunks |
| 6 | Integración Ollama local | ✅ Completo (resuelto vía script de arranque) |

## 6. Prioridades actuales y pendientes

**Prioridad confirmada:** Módulo A (Matemática Curiosa) — banco de preguntas ampliado a 61, suficiente por ahora. B y C (QPM) en buen nivel, en pausa.

**Bloque 2 (en curso):**
- [x] Ampliar banco de preguntas de A (61 preguntas)
- [x] Botón "limpiar conversación" en el tutor (`acertilab-tutor.js`, afecta los 4 módulos)

**Bloque 3 (baja prioridad):**
- [ ] `moduleHint` dinámico en módulo C
- [ ] Streaming de respuestas del tutor
- [ ] `.info-card` en módulos B/C

**Bloque 4:**
- [x] Este README

**Ronda 2 (más adelante, una vez clasificado el banco de A por dificultad):**
- [ ] Sistema de niveles (punto 3 del roadmap original)
- [ ] Exportar a PDF (punto 4 del roadmap original)

> Sugerencia de proceso: al agregar preguntas nuevas a A de ahora en más, conviene etiquetar dificultad desde el momento de creación (aunque no se use todavía), para no tener que reclasificar todo retroactivamente cuando llegue la Ronda 2.

## 7. Proyecto relacionado (en espera, repo separado)

Diagnóstico de política monetaria con Artifacts: ingestión de datos públicos de bancos centrales, modelos DSGE/QPM con filtro de Kalman, econometría bayesiana, state space (con apertura a HANK), generación de IRFs ante shocks. Comparte la filosofía de "Ollama local + banco de conocimiento" pero es de otra naturaleza (modelado matemático con datos en vivo) — se recomienda tratarlo como repo nuevo, no como rama de este.

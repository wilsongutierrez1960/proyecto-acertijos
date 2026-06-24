/* ──────────────────────────────────────────────────────────
   generar_embeddings.js
   Lee un archivo de chunks (formato QPM_Embedding_Chunks.json)
   y genera un archivo nuevo con el campo "embedding" agregado
   a cada chunk, usando el endpoint /api/embeddings de Ollama.

   Requisitos previos:
     - ollama serve corriendo (ollama serve, o el ícono de Ollama activo)
     - modelo de embeddings descargado: ollama pull nomic-embed-text
     - Node.js 18+ (trae fetch nativo; si tu Node es más viejo, instalá
       node-fetch y agregá: const fetch = require('node-fetch');)

   Uso:
     node generar_embeddings.js entrada.json salida.json

   Ejemplo concreto para Matemática Curiosa:
     node generar_embeddings.js QPM_style_Matematica_Embedding_Chunks.json QPM_Embeddings_Matematica.json
   ────────────────────────────────────────────────────────── */

const fs = require('fs');

const OLLAMA_URL = 'http://localhost:11434';
const EMBED_MODEL = 'nomic-embed-text'; // debe coincidir con EMBED_MODEL del init() en el HTML

async function embed(text) {
  const r = await fetch(OLLAMA_URL + '/api/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`Ollama embeddings falló (${r.status}): ${body}`);
  }
  const data = await r.json();
  return data.embedding;
}

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) {
    console.error('Uso: node generar_embeddings.js entrada.json salida.json');
    process.exit(1);
  }

  console.log(`Leyendo ${inputPath} ...`);
  const chunks = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`Encontrados ${chunks.length} chunks. Generando embeddings con '${EMBED_MODEL}' ...`);

  const result = [];
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    // Texto a embeber: título + contenido, igual criterio que se usaría al
    // indexar cualquier base de conocimiento de AcertiLab.
    const textoParaEmbedding = `${c.title}\n${c.content}`;
    try {
      const vector = await embed(textoParaEmbedding);
      result.push(Object.assign({}, c, { embedding: vector }));
      console.log(`  [${i + 1}/${chunks.length}] ${c.id} OK (dim=${vector.length})`);
    } catch (e) {
      console.error(`  [${i + 1}/${chunks.length}] ${c.id} ERROR: ${e.message}`);
      console.error('  Verificá que "ollama serve" esté corriendo y que el modelo esté descargado:');
      console.error(`    ollama pull ${EMBED_MODEL}`);
      process.exit(1);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\nListo. Guardado en ${outputPath} (${result.length} chunks con embedding).`);
}

main();

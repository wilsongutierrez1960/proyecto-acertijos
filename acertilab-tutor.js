/* ──────────────────────────────────────────────────────────
   AcertiLabTutor — widget flotante de tutor (RAG + Ollama)
   Se autoinyecta (HTML+CSS+JS) en cualquier módulo con solo:
     <script src="acertilab-tutor.js"></script>
     <script>AcertiLabTutor.init({ moduleHint: 'M5-Kalman' });</script>
   moduleHint es opcional: si se pasa, prioriza chunks de ese módulo
   en el retrieval (no lo excluye del todo, solo le da prioridad).

   Parámetros opcionales nuevos de init():
     embeddingsPath: ruta al JSON de embeddings (default: QPM)
     label:          nombre corto del tema, p.ej. 'Matemática' (default: 'QPM')
     subjectDesc:    descripción larga para el prompt del modelo
                      (default: descripción de QPM)
   ────────────────────────────────────────────────────────── */
const AcertiLabTutor = (function () {

  // ── CONFIG — ajustar acá, nada más ─────────────────────
  const CONFIG = {
    OLLAMA_URL: 'http://localhost:11434',
    CHAT_MODEL: 'qwen2.5:3b',          // cambiar a phi3:mini o llama3.2:3b si hace falta más velocidad
    EMBED_MODEL: 'nomic-embed-text',
    DEFAULT_EMBEDDINGS_PATH: 'knowledge-base/QPM_Embeddings.json',
    DEFAULT_LABEL: 'QPM',
    DEFAULT_SUBJECT_DESC: 'el Quarterly Projection Model (QPM) del FMI',
    TOP_K: 4,
    MODULE_BOOST: 0.12                 // bonus de similitud para chunks del módulo actual
  };

  let embeddingsData = null;
  let loadingEmbeddings = null;
  let moduleHint = null;
  let embeddingsPath = CONFIG.DEFAULT_EMBEDDINGS_PATH;
  let subjectLabel = CONFIG.DEFAULT_LABEL;
  let subjectDesc = CONFIG.DEFAULT_SUBJECT_DESC;
  let chatHistory = []; // [{role:'user'|'assistant', content:'...'}]

  // ── Inyección de CSS ────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('al-tutor-styles')) return;
    const style = document.createElement('style');
    style.id = 'al-tutor-styles';
    style.textContent = `
      #al-tutor-fab {
        position: fixed; bottom: 20px; right: 20px;
        width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #f7a531, #e67e22);
        color: #fff; font-size: 24px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.35);
        z-index: 9998; border: none; transition: transform .15s;
      }
      #al-tutor-fab:hover { transform: scale(1.07); }
      #al-tutor-panel {
        position: fixed; bottom: 86px; right: 20px;
        width: 340px; max-height: 70vh;
        background: #15191f; border: 1px solid #2a2f37;
        border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.5);
        display: none; flex-direction: column;
        font-family: 'Segoe UI', Arial, sans-serif;
        z-index: 9999; overflow: hidden;
      }
      #al-tutor-panel.open { display: flex; }
      #al-tutor-head {
        background: #1c2128; padding: 10px 14px;
        display: flex; align-items: center; justify-content: space-between;
        border-bottom: 1px solid #2a2f37;
      }
      #al-tutor-head span { color: #f7a531; font-weight: 700; font-size: 13px; letter-spacing: .03em; }
      #al-tutor-close { background: none; border: none; color: #8b949e; font-size: 18px; cursor: pointer; line-height: 1; }
      #al-tutor-close:hover { color: #fff; }
      #al-tutor-log {
        flex: 1; overflow-y: auto; padding: 12px 14px;
        display: flex; flex-direction: column; gap: 10px;
        min-height: 160px; max-height: 360px;
      }
      .al-tutor-msg { font-size: 13px; line-height: 1.5; padding: 8px 11px; border-radius: 8px; max-width: 90%; white-space: pre-wrap; }
      .al-tutor-msg.user { align-self: flex-end; background: #f7a531; color: #15191f; }
      .al-tutor-msg.bot  { align-self: flex-start; background: #20262e; color: #e6edf3; }
      .al-tutor-msg.bot.err { background: #3a1a1a; color: #f78166; }
      .al-tutor-msg.bot.thinking { color: #8b949e; font-style: italic; }
      .al-tutor-src { font-size: 10px; color: #6e7681; margin-top: 4px; }
      #al-tutor-inputwrap { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #2a2f37; background: #1c2128; }
      #al-tutor-input {
        flex: 1; background: #0d1117; border: 1px solid #2a2f37; color: #e6edf3;
        border-radius: 6px; padding: 8px 10px; font-size: 13px; resize: none;
      }
      #al-tutor-send {
        background: #f7a531; color: #15191f; border: none; border-radius: 6px;
        padding: 0 14px; font-weight: 700; cursor: pointer; font-size: 13px;
      }
      #al-tutor-send:disabled { opacity: .5; cursor: default; }
      #al-tutor-hint { font-size: 10px; color: #6e7681; padding: 0 14px 8px; }
    `;
    document.head.appendChild(style);
  }

  // ── Inyección de DOM ────────────────────────────────────
  function injectDOM() {
    if (document.getElementById('al-tutor-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'al-tutor-fab';
    fab.innerHTML = '🎓';
    fab.title = 'Tutor ' + subjectLabel + ' (local, Ollama)';
    fab.onclick = togglePanel;
    document.body.appendChild(fab);

    const panel = document.createElement('div');
    panel.id = 'al-tutor-panel';
    panel.innerHTML = `
      <div id="al-tutor-head">
        <span>🎓 Tutor ${subjectLabel} ${moduleHint ? '· ' + moduleHint : ''}</span>
        <button id="al-tutor-close">✕</button>
      </div>
      <div id="al-tutor-log"></div>
      <div id="al-tutor-hint">Corre 100% local vía Ollama — necesita <code>ollama serve</code> activo.</div>
      <div id="al-tutor-inputwrap">
        <textarea id="al-tutor-input" rows="1" placeholder="Preguntá sobre ${subjectLabel}..."></textarea>
        <button id="al-tutor-send">➤</button>
      </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('al-tutor-close').onclick = togglePanel;
    document.getElementById('al-tutor-send').onclick = handleSend;
    document.getElementById('al-tutor-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
  }

  function togglePanel() {
    const panel = document.getElementById('al-tutor-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !embeddingsData && !loadingEmbeddings) {
      loadEmbeddings();
    }
  }

  function addMsg(role, text, cls) {
    const log = document.getElementById('al-tutor-log');
    const div = document.createElement('div');
    div.className = 'al-tutor-msg ' + role + (cls ? ' ' + cls : '');
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // ── Carga de embeddings precalculados ──────────────────
  function loadEmbeddings() {
    loadingEmbeddings = fetch(embeddingsPath)
      .then(function (r) {
        if (!r.ok) throw new Error('No se encontró ' + embeddingsPath);
        return r.json();
      })
      .then(function (data) {
        embeddingsData = data;
      })
      .catch(function (e) {
        addMsg('bot', '⚠️ No pude cargar la base de conocimiento (' + e.message + '). ' +
          'Generá el archivo de embeddings correspondiente antes de usar el tutor.', 'err');
      });
    return loadingEmbeddings;
  }

  // ── Matemática de retrieval ─────────────────────────────
  function cosineSim(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
  }

  function retrieve(queryEmbedding) {
    const scored = embeddingsData.map(function (c) {
      let sim = cosineSim(queryEmbedding, c.embedding);
      if (moduleHint && c.module === moduleHint) sim += CONFIG.MODULE_BOOST;
      return { chunk: c, sim: sim };
    });
    scored.sort(function (a, b) { return b.sim - a.sim; });
    return scored.slice(0, CONFIG.TOP_K);
  }

  // ── Llamadas a Ollama ───────────────────────────────────
  async function ollamaEmbed(text) {
    const r = await fetch(CONFIG.OLLAMA_URL + '/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: CONFIG.EMBED_MODEL, prompt: text })
    });
    if (!r.ok) throw new Error('Ollama embeddings falló (' + r.status + ')');
    const data = await r.json();
    return data.embedding;
  }

  async function ollamaGenerate(prompt) {
    const r = await fetch(CONFIG.OLLAMA_URL + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: CONFIG.CHAT_MODEL, prompt: prompt, stream: false, options: { temperature: 0.3 } })
    });
    if (!r.ok) throw new Error('Ollama generate falló (' + r.status + ')');
    const data = await r.json();
    return data.response;
  }

  function buildPrompt(query, retrieved) {
    const context = retrieved.map(function (r) {
      return '[' + r.chunk.id + '] ' + r.chunk.title + ':\n' + r.chunk.content;
    }).join('\n\n');

    const history = chatHistory.slice(-6).map(function (m) {
      return (m.role === 'user' ? 'Alumno: ' : 'Tutor: ') + m.content;
    }).join('\n');

    return 'Eres un tutor experto en ' + subjectDesc + ', ' +
      'parte de la plataforma de estudio AcertiLab. Respondé en español, de forma clara ' +
      'y técnica pero accesible, basándote ÚNICAMENTE en el contexto provisto. ' +
      'Si la respuesta no está en el contexto, decilo honestamente en vez de inventar.\n\n' +
      'Contexto recuperado:\n' + context + '\n\n' +
      (history ? 'Conversación previa:\n' + history + '\n\n' : '') +
      'Pregunta del alumno: ' + query + '\n\nRespuesta del tutor:';
  }

  // ── Flujo principal de un mensaje ───────────────────────
  async function handleSend() {
    const input = document.getElementById('al-tutor-input');
    const sendBtn = document.getElementById('al-tutor-send');
    const query = input.value.trim();
    if (!query) return;

    addMsg('user', query);
    chatHistory.push({ role: 'user', content: query });
    input.value = '';
    sendBtn.disabled = true;
    const thinkingMsg = addMsg('bot', 'Pensando…', 'thinking');

    try {
      if (loadingEmbeddings) await loadingEmbeddings;
      if (!embeddingsData) throw new Error('Base de conocimiento no disponible.');

      const qEmbedding = await ollamaEmbed(query);
      const retrieved = retrieve(qEmbedding);
      const prompt = buildPrompt(query, retrieved);
      const answer = await ollamaGenerate(prompt);

      thinkingMsg.remove();
      const botDiv = addMsg('bot', answer.trim());
      const srcDiv = document.createElement('div');
      srcDiv.className = 'al-tutor-src';
      srcDiv.textContent = 'Fuentes: ' + retrieved.map(function (r) { return r.chunk.id; }).join(', ');
      botDiv.appendChild(srcDiv);

      chatHistory.push({ role: 'assistant', content: answer.trim() });
    } catch (e) {
      thinkingMsg.remove();
      addMsg('bot',
        '⚠️ ' + e.message + '\n\nVerificá que Ollama esté corriendo (ollama serve) y que ' +
        'OLLAMA_ORIGINS permita este origen.',
        'err'
      );
    } finally {
      sendBtn.disabled = false;
    }
  }

  // ── API pública ──────────────────────────────────────────
  function init(opts) {
    opts = opts || {};
    moduleHint = opts.moduleHint || null;
    embeddingsPath = opts.embeddingsPath || CONFIG.DEFAULT_EMBEDDINGS_PATH;
    subjectLabel = opts.label || CONFIG.DEFAULT_LABEL;
    subjectDesc = opts.subjectDesc || CONFIG.DEFAULT_SUBJECT_DESC;
    injectStyles();
    injectDOM();
  }

  return { init: init };
})();

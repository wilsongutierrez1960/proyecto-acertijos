/* ============================================================
   AcertiLab · Almacenamiento unificado (v1)
   Puntaje + progreso + sistema de niveles, persistido en
   localStorage del navegador. Sin backend, sin dependencias.

   Uso típico desde cada módulo:
     AcertiLab.saveModuleResult('A', { correct: 8, total: 10, details: [...] });
     const prev = AcertiLab.getModule('A');
     const { level } = AcertiLab.computeLevel();
   ============================================================ */
(function (window) {
  'use strict';

  const STORAGE_KEY = 'acertilab_progress_v1';
  const PASS_THRESHOLD = 0.6; // 60% para considerar un módulo "aprobado" a fines de nivel

  // Catálogo de módulos. 'requiresFor' se usa en el cálculo de nivel.
  const MODULES = {
    A: { name: 'Matemática & Lógica', total: 10, order: 1 },
    B: { name: 'QPM Núcleo', total: 28, order: 2 },
    C: { name: 'QPM Aplicado (M4–M6)', total: 28, order: 3 },
    D: { name: 'Examen Final QPM', total: 28, order: 4 }
  };

  // Escalera de niveles — cada nivel exige tener aprobados (≥60%) los módulos previos.
  const LEVELS = [
    { id: 'beginner', name: 'Beginner', requires: [] },
    { id: 'imf_candidate', name: 'IMF Candidate', requires: ['A'] },
    { id: 'qpm_practitioner', name: 'QPM Practitioner', requires: ['A', 'B'] },
    { id: 'qpm_analyst', name: 'QPM Analyst', requires: ['A', 'B', 'C'] }
  ];

  function blank() {
    return { version: 1, modules: {}, updatedAt: null };
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return blank();
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || typeof data.modules !== 'object') return blank();
      return data;
    } catch (e) {
      console.warn('AcertiLab: no se pudo leer el progreso guardado.', e);
      return blank();
    }
  }

  function persist(data) {
    data.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Cuota llena, modo incógnito sin storage, etc. — fallamos silenciosamente,
      // la página sigue funcionando, solo no persiste.
      console.warn('AcertiLab: no se pudo guardar el progreso (localStorage no disponible).', e);
    }
    return data;
  }

  /**
   * Guarda el resultado de un intento de módulo.
   * @param {string} moduleId 'A' | 'B' | 'C' | 'D'
   * @param {Object} result
   * @param {number} result.correct
   * @param {number} result.total
   * @param {Array}  [result.details]   - [{ qIndex, chosen, isCorrect }, ...] del último intento
   * @param {Object} [result.breakdown] - desglose libre por sección (lo que ya calcula cada módulo)
   * @param {number} [result.elapsedSeconds]
   */
  function saveModuleResult(moduleId, result) {
    const data = load();
    const prev = data.modules[moduleId];
    const total = result.total || (MODULES[moduleId] && MODULES[moduleId].total) || 0;
    const percent = total > 0 ? Math.round((result.correct / total) * 100) : 0;
    const passedNow = total > 0 && (result.correct / total) >= PASS_THRESHOLD;

    const entry = {
      lastScore: result.correct,
      lastTotal: total,
      lastPercent: percent,
      lastAttemptAt: new Date().toISOString(),
      attempts: (prev && prev.attempts ? prev.attempts : 0) + 1,
      bestScore: prev ? Math.max(prev.bestScore, result.correct) : result.correct,
      bestPercent: prev ? Math.max(prev.bestPercent, percent) : percent,
      passed: prev ? (prev.passed || passedNow) : passedNow,
      elapsedSeconds: result.elapsedSeconds != null ? result.elapsedSeconds : (prev ? prev.elapsedSeconds : null),
      breakdown: result.breakdown || (prev ? prev.breakdown : null),
      details: result.details || (prev ? prev.details : null)
    };

    data.modules[moduleId] = entry;
    persist(data);
    return entry;
  }

  function getModule(moduleId) {
    const data = load();
    return data.modules[moduleId] || null;
  }

  function getAll() {
    return load();
  }

  /**
   * Calcula el nivel actual según los módulos aprobados (≥60%).
   * Devuelve también el próximo nivel y qué falta para alcanzarlo.
   */
  function computeLevel(dataIn) {
    const data = dataIn || load();
    let idx = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      const lvl = LEVELS[i];
      const ok = lvl.requires.every(m => data.modules[m] && data.modules[m].passed);
      if (ok) { idx = i; break; }
    }
    const current = LEVELS[idx];
    const next = LEVELS[idx + 1] || null;
    let missing = [];
    if (next) {
      missing = next.requires.filter(m => !(data.modules[m] && data.modules[m].passed));
    }
    return { level: current, index: idx, next, missingForNext: missing, all: LEVELS };
  }

  /** Resumen listo para pintar en index.html (badges por módulo + nivel). */
  function getOverallSummary() {
    const data = load();
    const modules = {};
    Object.keys(MODULES).forEach(id => {
      const m = data.modules[id];
      modules[id] = {
        name: MODULES[id].name,
        total: MODULES[id].total,
        attempted: !!m,
        bestScore: m ? m.bestScore : null,
        bestPercent: m ? m.bestPercent : null,
        passed: m ? m.passed : false,
        attempts: m ? m.attempts : 0
      };
    });
    return { modules, levelInfo: computeLevel(data) };
  }

  function resetModule(moduleId) {
    const data = load();
    delete data.modules[moduleId];
    persist(data);
  }

  function resetAll() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
  }

  window.AcertiLab = {
    MODULES,
    LEVELS,
    PASS_THRESHOLD,
    saveModuleResult,
    getModule,
    getAll,
    computeLevel,
    getOverallSummary,
    resetModule,
    resetAll
  };
})(window);

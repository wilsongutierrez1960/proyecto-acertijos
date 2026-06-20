/* ──────────────────────────────────────────────────────────
   AcertiLabExport — exportación a PDF de resultados guardados
   Depende de: acertilab-storage.js (objeto global AcertiLab)
   Librería externa: jsPDF (cargada on-demand desde CDN)
   ────────────────────────────────────────────────────────── */
const AcertiLabExport = (function () {

  function loadJsPDF() {
    return new Promise(function (resolve, reject) {
      if (window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF);
        else reject(new Error('jsPDF no se cargó correctamente'));
      };
      s.onerror = function () { reject(new Error('No se pudo cargar la librería de PDF (revisá tu conexión)')); };
      document.head.appendChild(s);
    });
  }

  function moduleNames() {
    return {
      A: 'Módulo A · Matemática & Lógica',
      B: 'Módulo B · QPM Núcleo',
      C: 'Módulo C · QPM Aplicado',
      D: 'Módulo D · Examen Final'
    };
  }

  function drawHeader(doc, title) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(title, 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const date = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text('AcertiLab · generado el ' + date, 14, 24);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 28, 196, 28);
    return 38;
  }

  function ensureSpace(doc, y, needed) {
    if (y + needed > 280) { doc.addPage(); return 18; }
    return y;
  }

  function writeBreakdown(doc, y, breakdown, labels) {
    labels = labels || {};
    Object.keys(breakdown).forEach(function (key) {
      const d = breakdown[key];
      const label = labels[key] || key.toUpperCase();
      const pct = d.total ? Math.round((d.ok / d.total) * 100) : 0;
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text('• ' + label + ':  ' + d.ok + '/' + d.total + '  (' + pct + '%)', 18, y);
      y += 6;
    });
    return y;
  }

  // ── PDF de un módulo individual ──────────────────────────
  async function exportModule(moduleId, opts) {
    opts = opts || {};
    let doc;
    try {
      const jsPDF = await loadJsPDF();
      doc = new jsPDF();
    } catch (e) {
      alert('No se pudo generar el PDF: ' + e.message);
      return;
    }

    const names = moduleNames();
    let y = drawHeader(doc, names[moduleId] || ('Módulo ' + moduleId));

    const m = AcertiLab.getModule(moduleId);
    if (!m || !m.attempted) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(90, 90, 90);
      doc.text('Todavía no hay intentos registrados para este módulo.', 14, y);
      doc.save('acertilab-' + moduleId.toLowerCase() + '.pdf');
      return;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text('Resumen', 14, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text('Intentos realizados: ' + m.attempts, 14, y); y += 5.5;
    doc.text('Mejor puntaje: ' + m.bestScore + '/' + m.total + '  (' + m.bestPercent + '%)', 14, y); y += 5.5;
    doc.text('Estado: ' + (m.passed ? 'Aprobado (≥60%)' : 'No aprobado todavía'), 14, y); y += 5.5;
    if (typeof m.elapsedSeconds === 'number') {
      const mm = Math.floor(m.elapsedSeconds / 60), ss = m.elapsedSeconds % 60;
      doc.text('Tiempo del último intento: ' + mm + 'm ' + (ss < 10 ? '0' : '') + ss + 's', 14, y);
      y += 5.5;
    }
    if (m.partial) {
      doc.setTextColor(180, 110, 20);
      doc.text('(Este intento fue parcial — solo cubre una sección del módulo)', 14, y);
      doc.setTextColor(90, 90, 90);
      y += 5.5;
    }
    y += 6;

    if (m.breakdown && Object.keys(m.breakdown).length) {
      y = ensureSpace(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      doc.text('Desglose por sección', 14, y);
      y += 8;
      y = writeBreakdown(doc, y, m.breakdown, opts.sectionLabels);
    }

    doc.save('acertilab-' + moduleId.toLowerCase() + '-resultado.pdf');
  }

  // ── PDF general (todos los módulos + nivel) ─────────────
  async function exportOverall() {
    let doc;
    try {
      const jsPDF = await loadJsPDF();
      doc = new jsPDF();
    } catch (e) {
      alert('No se pudo generar el PDF: ' + e.message);
      return;
    }

    let y = drawHeader(doc, 'Reporte de Progreso General');

    const summary = AcertiLab.getOverallSummary();
    const levelInfo = summary.levelInfo;
    const names = moduleNames();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('Nivel actual: ' + levelInfo.level.name, 14, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    if (levelInfo.next) {
      const missing = levelInfo.missingForNext.map(function (id) { return summary.modules[id].name; }).join(', ');
      doc.text('Próximo nivel: ' + levelInfo.next.name + ' — falta aprobar (≥60%): ' + missing, 14, y);
    } else {
      doc.text('Nivel máximo alcanzado.', 14, y);
    }
    y += 12;

    const sectionLabels = {
      B: { nucleo: 'Núcleo QPM', post: 'Post-Course IMF' },
      C: { m4: 'Módulo 4 · Datos', m5: 'Módulo 5 · Kalman', m6: 'Módulo 6 · Calibración' }
      // D: claves dinámicas según 'mod' de cada pregunta -> se muestran tal cual (sin mapeo)
    };

    Object.keys(summary.modules).forEach(function (id) {
      const m = summary.modules[id];
      y = ensureSpace(doc, y, 16);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(20, 20, 20);
      doc.text(names[id] || ('Módulo ' + id), 14, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(90, 90, 90);

      if (!m.attempted) {
        doc.text('Sin intentos registrados.', 18, y);
        y += 10;
        return;
      }

      doc.text(
        'Intentos: ' + m.attempts + '   ·   Mejor puntaje: ' + m.bestScore + '/' + m.total +
        ' (' + m.bestPercent + '%)   ·   ' + (m.passed ? 'Aprobado' : 'No aprobado'),
        18, y
      );
      y += 7;

      if (m.breakdown && Object.keys(m.breakdown).length) {
        y = writeBreakdown(doc, y, m.breakdown, sectionLabels[id]);
      }
      y += 6;
    });

    doc.save('acertilab-progreso-general.pdf');
  }

  return { exportOverall: exportOverall, exportModule: exportModule };
})();

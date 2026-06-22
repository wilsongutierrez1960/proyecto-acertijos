/* ============================================================
   AcertiLab · UI compartida para el banner de progreso
   y el panel de "ver mis respuestas anteriores".
   Requiere que acertilab-storage.js esté cargado antes.
   ============================================================ */
(function (window) {
  'use strict';

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /**
   * Pinta el banner "tu progreso" arriba de un módulo.
   * @param {Object} opts
   * @param {string} opts.moduleId
   * @param {HTMLElement} opts.bannerEl
   * @param {HTMLElement} opts.reviewEl
   * @param {function(number): {q:string, exp:string}} opts.getQuestion - dado un índice de pregunta, devuelve su texto y explicación
   */
  function renderBanner(opts) {
    const banner = opts.bannerEl;
    if (!banner) return;
    const mod = window.AcertiLab.getModule(opts.moduleId);

    if (!mod) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'flex';
    const reviewBtnId = 'al-review-btn-' + opts.moduleId;
    const statusTxt = mod.passed ? '✅ Aprobado' : '— aún no alcanza el 60% requerido para nivel';

    banner.innerHTML =
      '<span>📊 Tu mejor puntaje: <span class="al-badge">' + mod.bestScore + '/' + mod.lastTotal + '</span> (' + mod.bestPercent + '%)</span>' +
      '<span class="al-muted">· Intentos: ' + mod.attempts + '</span>' +
      '<span class="al-muted">' + statusTxt + '</span>' +
      (mod.details ? '<button class="al-link-btn" id="' + reviewBtnId + '">Ver mis respuestas anteriores</button>' : '');

    if (mod.details && opts.reviewEl) {
      const btn = document.getElementById(reviewBtnId);
      if (btn) {
        btn.addEventListener('click', function () {
          toggleReview(opts, mod);
        });
      }
    }
  }

  function toggleReview(opts, mod) {
    const panel = opts.reviewEl;
    if (!panel) return;
    const isOpen = panel.classList.contains('show');
    if (isOpen) {
      panel.classList.remove('show');
      return;
    }
    const rows = mod.details.map(function (d) {
      const q = opts.getQuestion(d.qIndex);
      if (!q) return '';
      const cls = d.isCorrect ? 'correct' : 'wrong';
      const mark = d.isCorrect ? '✓' : '✗';
      return (
        '<div class="al-review-item ' + cls + '">' +
        '<strong>' + mark + ' Pregunta ' + (d.qIndex + 1) + '.</strong> ' + escapeHtml(q.q) +
        '<div class="al-muted" style="margin-top:4px;">' + q.exp + '</div>' +
        '</div>'
      );
    }).join('');
    panel.innerHTML = rows || '<span class="al-muted">Sin detalle disponible para este intento.</span>';
    panel.classList.add('show');
  }

  window.AcertiLabUI = { renderBanner: renderBanner, escapeHtml: escapeHtml };
})(window);

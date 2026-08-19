/* ------------------------------------------------------------------ */
/* أذكار الصباح والمساء — منطق التطبيق (JS خالص، بدون أي اتصال إنترنت)   */
/* تحويل مطابق لسلوك نسخة React الأصلية                                */
/* ------------------------------------------------------------------ */

(function () {
  'use strict';

  const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const toArabicDigits = (num) =>
    String(num).split('').map((c) => (/\d/.test(c) ? AR_DIGITS[+c] : c)).join('');

  // موضع على قوس السماء، t في [0,1] -> {x,y} في viewBox بحجم 100x40
  const arcPoint = (t) => {
    const x = 4 + t * 92;
    const y = 34 - 30 * Math.sin(t * Math.PI);
    return { x, y };
  };

  function icon(name, size, extraStyle) {
    const svg = ICONS[name] || '';
    const style = `width:${size}px;height:${size}px;${extraStyle || ''}`;
    return `<span class="icon" style="${style}">${svg}</span>`;
  }

  /* ------------------------------- الحالة ------------------------------- */
  const state = {
    mode: 'morning', // 'morning' | 'evening'
    index: 0,
    remaining: MORNING.map((d) => d.n),
    justTapped: false,
  };

  const root = document.getElementById('app-root');

  function currentList() {
    return state.mode === 'morning' ? MORNING : EVENING;
  }

  function getPalette(isMorning) {
    return isMorning
      ? {
          bg: 'linear-gradient(180deg, #EAF3F7 0%, #FBEAD2 55%, #FBDDBE 100%)',
          ink: '#2C3B41',
          sub: '#6B7E80',
          card: 'rgba(255,255,255,0.72)',
          cardBorder: 'rgba(224,164,88,0.35)',
          accent: '#D98E3F',
          accentSoft: 'rgba(217,142,63,0.14)',
          chip: 'rgba(255,255,255,0.55)',
          onAccent: '#3A2A0F',
        }
      : {
          bg: 'linear-gradient(180deg, #12162E 0%, #241E45 55%, #3A2B55 100%)',
          ink: '#F3EFE6',
          sub: '#B7AFD6',
          card: 'rgba(255,255,255,0.055)',
          cardBorder: 'rgba(232,185,106,0.22)',
          accent: '#E8B96A',
          accentSoft: 'rgba(232,185,106,0.14)',
          chip: 'rgba(255,255,255,0.08)',
          onAccent: '#241833',
        };
  }

  /* ------------------------------- الأفعال ------------------------------- */
  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    state.index = 0;
    state.remaining = currentList().map((d) => d.n);
    render();
  }

  function tap() {
    const list = currentList();
    if (state.remaining[state.index] === 0) return;
    state.justTapped = true;
    state.remaining[state.index] = Math.max(0, state.remaining[state.index] - 1);
    render();
    setTimeout(() => {
      state.justTapped = false;
      updateCounterVisual();
    }, 160);
  }

  function goNext() {
    const total = currentList().length;
    state.index = Math.min(total - 1, state.index + 1);
    render();
  }
  function goPrev() {
    state.index = Math.max(0, state.index - 1);
    render();
  }
  function resetAll() {
    state.remaining = currentList().map((d) => d.n);
    render();
  }

  // تحديث بصري خفيف لزر العدّاد فقط (بدون إعادة رسم كاملة) عند انتهاء لمسة الجس
  function updateCounterVisual() {
    const btn = document.querySelector('.counter-btn');
    if (!btn) return;
    const list = currentList();
    const curRemaining = state.remaining[state.index];
    const isDone = curRemaining === 0;
    const palette = getPalette(state.mode === 'morning');
    btn.style.background = isDone ? palette.accent : 'transparent';
  }

  /* ------------------------------- العرض ------------------------------- */
  function render() {
    const list = currentList();
    const total = list.length;
    const doneCount = state.remaining.filter((r) => r === 0).length;
    const progress = doneCount / total;
    const current = list[state.index];
    const curRemaining = state.remaining[state.index];
    const isDone = curRemaining === 0;
    const allDone = doneCount === total;
    const isMorning = state.mode === 'morning';
    const palette = getPalette(isMorning);
    const { x, y } = arcPoint(progress);

    document.body.style.background = palette.bg;
    document.body.style.color = palette.ink;

    let html = '';

    // header
    html += `
      <div class="header-wrap">
        <div class="header-kicker" style="color:${palette.sub}">حصن المسلم اليومي</div>
        <div class="header-title">أذكار ${isMorning ? 'الصباح' : 'المساء'}</div>
      </div>
    `;

    // sky arc
    html += `
      <div class="arc-wrap">
        <svg viewBox="0 0 100 40">
          <path d="M 4 34 Q 50 -8 96 34" fill="none" stroke="${palette.cardBorder}"
            stroke-width="0.8" stroke-dasharray="1.2 2.4" stroke-linecap="round" />
          <circle cx="${x}" cy="${y}" r="3.4" fill="${palette.accent}"
            style="transition:cx 500ms ease, cy 500ms ease; filter:drop-shadow(0 0 6px ${palette.accent})" />
        </svg>
        <div class="arc-labels" style="color:${palette.sub}">
          <span>${isMorning ? 'شروق' : 'غروب'}</span>
          <span>${isMorning ? 'ظهيرة' : 'منتصف الليل'}</span>
        </div>
      </div>
    `;

    // segmented control
    html += `
      <div class="segmented" style="background:${palette.chip}; border-color:${palette.cardBorder}">
        <button data-mode="morning" style="color:${isMorning ? palette.onAccent : palette.sub}; background:${isMorning ? palette.accent : 'transparent'}">
          ${icon('sun', 16)} الصباح
        </button>
        <button data-mode="evening" style="color:${!isMorning ? palette.onAccent : palette.sub}; background:${!isMorning ? palette.accent : 'transparent'}">
          ${icon('moon', 16)} المساء
        </button>
      </div>
    `;

    if (allDone) {
      html += `
        <div class="done-wrap card-anim" style="background:${palette.card}; border-color:${palette.cardBorder}">
          <div class="done-icon" style="background:${palette.accentSoft}">
            ${icon('check', 26, `color:${palette.accent}`)}
          </div>
          <div class="done-title">أتممتَ أذكار ${isMorning ? 'الصباح' : 'المساء'} اليوم</div>
          <div class="done-sub" style="color:${palette.sub}">تقبّل الله منك، جعلها الله في ميزان حسناتك.</div>
          <button class="done-reset" style="border-color:${palette.cardBorder}; color:${palette.ink}">
            ${icon('rotate-ccw', 15)} إعادة من البداية
          </button>
        </div>
      `;
    } else {
      html += `
        <div class="progress-row" style="color:${palette.sub}">
          <span>${toArabicDigits(state.index + 1)} من ${toArabicDigits(total)}</span>
          <span>أُنجز ${toArabicDigits(doneCount)} / ${toArabicDigits(total)}</span>
        </div>

        <div class="card card-anim" style="background:${palette.card}; border-color:${isDone ? palette.accent : palette.cardBorder}; box-shadow:${isMorning ? '0 8px 30px rgba(180,140,80,0.10)' : '0 8px 30px rgba(0,0,0,0.25)'}">
          ${current.s ? `<div class="card-source" style="color:${palette.accent}">${current.s}</div>` : ''}
          <div class="dhikr-text card-text">${current.t}</div>
          ${current.v ? `<div class="card-virtue" style="border-color:${palette.cardBorder}; color:${palette.sub}">${icon('sparkles', 12, `color:${palette.accent}`)} ${current.v}</div>` : ''}
          <div class="counter-wrap">
            <button class="counter-btn count-tap" aria-label="عدّ التكرار"
              style="border-color:${palette.accent}; color:${isDone ? palette.onAccent : palette.ink}; background:${isDone ? palette.accent : (state.justTapped ? palette.accentSoft : 'transparent')}">
              ${isDone ? icon('check', 26) : toArabicDigits(curRemaining)}
              ${!isDone ? `<span class="remaining-label" style="color:${palette.sub}">تبقّى</span>` : ''}
            </button>
          </div>
        </div>

        <div class="nav-row">
          <button class="nav-prev" ${state.index === 0 ? 'disabled' : ''}
            style="border-color:${palette.cardBorder}; color:${state.index === 0 ? palette.sub : palette.ink}; opacity:${state.index === 0 ? 0.5 : 1}">
            ${icon('chevron-right', 17)} السابق
          </button>
          <button class="nav-next" ${state.index === total - 1 ? 'disabled' : ''}
            style="background:${state.index === total - 1 ? palette.chip : palette.accent}; color:${state.index === total - 1 ? palette.sub : palette.onAccent}">
            التالي ${icon('chevron-left', 17)}
          </button>
        </div>

        <div class="reset-row">
          <button class="reset-btn" style="color:${palette.sub}">
            ${icon('rotate-ccw', 12)} إعادة تعيين العدّاد
          </button>
        </div>
      `;
    }

    root.innerHTML = html;
    attachHandlers();
    document.dispatchEvent(new Event('azkar:render'));
  }

  function attachHandlers() {
    document.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => setMode(btn.getAttribute('data-mode')));
    });
    const counterBtn = document.querySelector('.counter-btn');
    if (counterBtn) counterBtn.addEventListener('click', tap);
    const prevBtn = document.querySelector('.nav-prev');
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    const nextBtn = document.querySelector('.nav-next');
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetAll);
    const doneResetBtn = document.querySelector('.done-reset');
    if (doneResetBtn) doneResetBtn.addEventListener('click', resetAll);
  }

  // جزيئات الضوء الخلفية (ثابتة، لا تُعاد رسمها مع كل تحديث حالة)
  function mountAmbientGlow() {
    const g1 = document.createElement('div');
    g1.className = 'glow-particle';
    g1.style.cssText = 'width:220px;height:220px;top:-60px;right:-40px;';
    const g2 = document.createElement('div');
    g2.className = 'glow-particle';
    g2.style.cssText = 'width:180px;height:180px;bottom:40px;left:-50px;animation-delay:4s;';
    document.body.insertBefore(g1, root);
    document.body.insertBefore(g2, root);
    function syncGlow() {
      const isMorning = state.mode === 'morning';
      const palette = getPalette(isMorning);
      g1.style.background = palette.accent;
      g1.style.opacity = isMorning ? '0.18' : '0.12';
      g2.style.background = isMorning ? '#8FB9C9' : '#6C5CA8';
      g2.style.opacity = '0.16';
    }
    syncGlow();
    document.addEventListener('azkar:render', syncGlow);
  }

  mountAmbientGlow();
  render();
})();

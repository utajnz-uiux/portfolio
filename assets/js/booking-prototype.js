(function () {
  const app = document.getElementById('bookingApp');
  if (!app) return;

  const STEPS = ['Termin', 'Pakete', 'Support', 'Wellness', 'Überblick', 'Anfragen'];
  const PACKAGES = {
    lodge: { name: 'Lodge', pricePerNight: 0, features: [0, 1, 2, 3] },
    rehearsal: { name: 'Probe Retreat', pricePerNight: 20, features: [0, 1, 2, 3, 4, 5] },
    recording: { name: 'Aufnahme Session', pricePerNight: 40, features: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
  };
  const FEATURES = [
    'Übernachtung bis zu 6 Personen',
    'Inspirierende Umgebung für Songwriting',
    'Komplettes Haus inkl. Lounge',
    'Garten',
    'Schallisolierter Proberaum',
    'Probe-Equipment',
    'Aufnahme-Equipment',
    'Auswahl an Mikrofonen',
    'Regie und Gesangskabine',
    'Aufnehmen in Eigenregie ist möglich'
  ];
  const SUPPORT = [
    { id: 'video', title: 'Videodreh', price: 420, unit: '3 Stunden', desc: 'Benno Sattler filmt euren Aufenthalt in professioneller Qualität.' },
    { id: 'tuning', title: 'Flügelstimmung', price: null, desc: 'Yamaha C2 Flügel — termingerecht und nach euren Wünschen.' },
    { id: 'piano', title: 'Klavierunterricht', price: null, desc: 'Einstündige Session zu Improvisation und neuen Impulsen.' },
    { id: 'producer', title: 'Tontechniker – Produzent', price: null, badge: 'Empfohlen', desc: 'Passende Tontechniker/Produzenten je nach Stil und Vorhaben.' }
  ];
  const WELLNESS = [
    { id: 'sauna', title: 'Sauna', price: 40, unit: '2 Nächte', desc: 'Bauwagensauna — SPA-Erholung vom Bandalltag.', badge: 'Empfohlen' },
    { id: 'hottub', title: 'Hot Tub', price: 80, unit: '2 Nächte', desc: 'Holzbefeuerter Whirlpool in der Natur.', badge: 'Häufig gebucht' },
    { id: 'yoga', title: 'Yogastunde', price: null, desc: 'Beweglichkeit, Stützmuskulatur und Wohlbefinden.' }
  ];
  const RESERVED = [10, 11, 12, 13, 14];
  const UNAVAILABLE_RANGE = { start: '2026-07-19', end: '2026-07-23' };

  const state = {
    step: 0,
    checkIn: null,
    checkOut: null,
    guests: 2,
    package: 'recording',
    support: new Set(),
    wellness: new Set(),
    name: '',
    email: '',
    company: '',
    message: '',
    privacy: false,
    newsletter: false
  };

  let calMonth = new Date().getMonth();
  let calYear = new Date().getFullYear();

  const stepperItems = app.querySelectorAll('.booking-stepper-item');
  const panels = app.querySelectorAll('.booking-panel');
  const btnBack = app.querySelector('[data-action="back"]');
  const btnNext = app.querySelector('[data-action="next"]');
  const alertEl = app.querySelector('[data-date-alert]');
  const chipStart = app.querySelector('[data-chip-start]');
  const chipEnd = app.querySelector('[data-chip-end]');
  const guestCountEl = app.querySelector('[data-guest-count]');
  const calContainer = app.querySelector('[data-calendars]');
  const modal = document.getElementById('bookingFaqModal');

  function fmtDate(d) {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  function parseISO(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function nights() {
    if (!state.checkIn || !state.checkOut) return 0;
    return Math.round((state.checkOut - state.checkIn) / 86400000);
  }

  function isUnavailable(date) {
    const t = date.getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (UNAVAILABLE_RANGE.start) {
      const s = parseISO(UNAVAILABLE_RANGE.start);
      const e = parseISO(UNAVAILABLE_RANGE.end);
      if (t >= s.getTime() && t <= e.getTime()) return true;
    }
    return false;
  }

  function isReserved(day, month, year) {
    if (month === 6 && (year === 2021 || year === 2026)) return RESERVED.includes(day);
    return false;
  }

  function calcPrices() {
    const n = Math.max(nights(), 2);
    const pkg = PACKAGES[state.package];
    const overnight = 170 * n;
    const session = state.package === 'recording' ? 40 * n : state.package === 'rehearsal' ? 20 * n : 0;
    const subtotal = overnight + session;
    const discount = state.package === 'recording' ? Math.round(subtotal * 0.1) : 0;
    const afterDiscount = subtotal - discount;
    const cleaning = 50;
    const total = afterDiscount + cleaning;
    const original = discount ? subtotal + cleaning : total;
    return { n, overnight, session, subtotal, discount, cleaning, total, original, perPerson: (total / state.guests).toFixed(2).replace('.', ',') };
  }

  function renderCalendars() {
    if (!calContainer) return;
    const months = [calMonth, calMonth + 1];
    calContainer.innerHTML = months.map((m, i) => {
      const month = ((m % 12) + 12) % 12;
      const year = calYear + Math.floor(m / 12);
      const label = new Date(year, month, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      const navPrev = i === 0 ? `<button type="button" class="booking-cal-nav" data-cal-prev aria-label="Vorheriger Monat">‹</button>` : '<span></span>';
      const navNext = i === 1 ? `<button type="button" class="booking-cal-nav" data-cal-next aria-label="Nächster Monat">›</button>` : '<span></span>';
      return `<div class="booking-calendar" data-month="${month}" data-year="${year}">
        <div class="booking-calendar-header">${navPrev}<span class="booking-calendar-title">${label}</span>${navNext}</div>
        <table class="booking-cal-table" role="grid" aria-label="${label}">
          <thead><tr>${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => `<th scope="col">${d}</th>`).join('')}</tr></thead>
          <tbody>${renderMonthGrid(month, year)}</tbody>
        </table>
      </div>`;
    }).join('');

    calContainer.querySelector('[data-cal-prev]')?.addEventListener('click', () => { calMonth--; renderCalendars(); });
    calContainer.querySelector('[data-cal-next]')?.addEventListener('click', () => { calMonth++; renderCalendars(); });

    calContainer.querySelectorAll('.booking-cal-day').forEach(btn => {
      btn.addEventListener('click', () => selectDate(parseISO(btn.dataset.date)));
    });
  }

  function renderMonthGrid(month, year) {
    const first = new Date(year, month, 1);
    let startDay = first.getDay() - 1;
    if (startDay < 0) startDay = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    let html = '<tr>';
    let day = 1;
    let nextDay = 1;
    for (let i = 0; i < 42; i++) {
      if (i % 7 === 0 && i > 0) html += '</tr><tr>';
      let d, m, y, other = false;
      if (i < startDay) {
        d = prevDays - startDay + i + 1;
        m = month - 1; y = year; other = true;
      } else if (day > daysInMonth) {
        d = nextDay++; m = month + 1; y = year; other = true;
      } else {
        d = day++; m = month; y = year;
      }
      const date = new Date(y, m, d);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const unavail = isUnavailable(date);
      const reserved = isReserved(d, m, y);
      let cls = 'booking-cal-day';
      if (other) cls += ' is-other-month';
      if (reserved) cls += ' is-reserved';
      if (state.checkIn && date.getTime() === state.checkIn.getTime()) cls += ' is-selected is-range-start';
      if (state.checkOut && date.getTime() === state.checkOut.getTime()) cls += ' is-selected is-range-end';
      if (state.checkIn && state.checkOut && date > state.checkIn && date < state.checkOut) cls += ' is-in-range';
      const aria = reserved ? 'Unbestätigte Anfrage' : unavail ? 'Belegt' : `Datum ${fmtDate(date)}`;
      html += `<td><button type="button" class="${cls}" data-date="${iso}" ${unavail ? 'disabled' : ''} aria-label="${aria}">${d}</button></td>`;
    }
    return html + '</tr>';
  }

  function selectDate(date) {
    if (!state.checkIn || (state.checkIn && state.checkOut)) {
      state.checkIn = date;
      state.checkOut = null;
    } else if (date <= state.checkIn) {
      state.checkIn = date;
      state.checkOut = null;
    } else {
      state.checkOut = date;
    }
    updateDateUI();
    renderCalendars();
  }

  function updateDateUI() {
    if (chipStart) chipStart.textContent = state.checkIn ? fmtDate(state.checkIn) : '—';
    if (chipEnd) chipEnd.textContent = state.checkOut ? fmtDate(state.checkOut) : '—';
    const bad = state.checkIn && state.checkOut && isRangeUnavailable();
    if (alertEl) alertEl.hidden = !bad;
  }

  function isRangeUnavailable() {
    if (!state.checkIn || !state.checkOut) return false;
    const s = parseISO(UNAVAILABLE_RANGE.start);
    const e = parseISO(UNAVAILABLE_RANGE.end);
    return state.checkIn <= e && state.checkOut >= s;
  }

  function renderOverview() {
    const p = calcPrices();
    const pkg = PACKAGES[state.package];
    const priceEls = app.querySelectorAll('[data-overview-prices]');
    const optsEl = app.querySelector('[data-overview-options]');
    const priceHtml = `
        <table class="booking-price-table"><tbody>
          <tr><td>Paket ${pkg.name}</td><td></td></tr>
          <tr><td>Übernachten (${p.n} Nächte)</td><td>${p.overnight} €</td></tr>
          ${p.session ? `<tr><td>Proben ${state.package === 'recording' ? '40' : '20'} € × ${p.n} Nächte</td><td>${p.session} €</td></tr>` : ''}
          ${p.discount ? `<tr><td class="is-discount">Rabattaktion</td><td class="is-discount">10 % Rabatt</td></tr>` : ''}
          <tr><td>Zwischensumme</td><td>${p.subtotal - p.discount} €</td></tr>
          <tr><td>Reinigungsgebühr</td><td>${p.cleaning} €</td></tr>
        </tbody></table>
        <div class="booking-price-total">
          ${p.discount ? `<del>${p.original} €</del>` : ''}
          <strong>${p.total} €</strong>
          <div class="booking-price-per-person">= ${p.perPerson} € / Person</div>
        </div>`;
    priceEls.forEach(el => { el.innerHTML = priceHtml; });
    if (optsEl) {
      const items = [];
      SUPPORT.filter(s => state.support.has(s.id)).forEach(s => items.push(`${s.title}${s.price ? ` (ab ${s.price} €)` : ''}`));
      WELLNESS.filter(w => state.wellness.has(w.id)).forEach(w => items.push(`${w.title}${w.price ? ` (${w.price} €)` : ''}`));
      optsEl.innerHTML = items.length ? items.map(i => `<div>${i}</div>`).join('') : '<div style="color:var(--bb-muted)">Keine Optionen gewählt</div>';
    }
    app.querySelectorAll('[data-summary-dates]').forEach(el => {
      el.textContent = state.checkIn && state.checkOut ? `${fmtDate(state.checkIn)} – ${fmtDate(state.checkOut)}` : '—';
    });
    app.querySelectorAll('[data-summary-guests]').forEach(el => { el.textContent = state.guests; });
  }

  function validateStep() {
    switch (state.step) {
      case 0: return state.checkIn && state.checkOut && nights() > 0 && !isRangeUnavailable();
      case 1: return !!state.package;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return state.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email) && state.privacy;
      default: return true;
    }
  }

  function updateUI() {
    stepperItems.forEach((item, i) => {
      item.classList.toggle('is-active', i === state.step);
      item.classList.toggle('is-done', i < state.step);
      item.setAttribute('aria-current', i === state.step ? 'step' : 'false');
    });
    panels.forEach((p, i) => p.classList.toggle('is-active', i === state.step));
    btnBack.style.visibility = state.step === 0 || state.step === 6 ? 'hidden' : 'visible';
    if (state.step === 5) {
      btnNext.textContent = 'Unverbindlich anfragen';
    } else if (state.step === 6) {
      btnNext.textContent = 'Neue Anfrage';
    } else {
      btnNext.textContent = 'Weiter';
    }
    btnNext.disabled = state.step < 6 && !validateStep();
    if (state.step === 4 || state.step === 5) renderOverview();
    app.setAttribute('aria-label', `Buchung Schritt ${state.step + 1} von 6: ${STEPS[state.step]}`);
  }

  function goStep(n) {
    state.step = Math.max(0, Math.min(6, n));
    updateUI();
    const panel = panels[state.step];
    if (panel) {
      const focus = panel.querySelector('button, input, [tabindex="0"]');
      if (focus) focus.focus({ preventScroll: true });
    }
  }

  btnBack?.addEventListener('click', () => goStep(state.step - 1));
  btnNext?.addEventListener('click', () => {
    if (state.step === 5 && validateStep()) goStep(6);
    else if (state.step === 6) location.reload();
    else if (validateStep()) goStep(state.step + 1);
  });

  app.querySelector('[data-guest-minus]')?.addEventListener('click', () => {
    if (state.guests > 1) { state.guests--; guestCountEl.textContent = state.guests; updateUI(); }
  });
  app.querySelector('[data-guest-plus]')?.addEventListener('click', () => {
    if (state.guests < 6) { state.guests++; guestCountEl.textContent = state.guests; updateUI(); }
  });

  app.querySelectorAll('[data-package]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.package = btn.dataset.package;
      app.querySelectorAll('[data-package]').forEach(b => {
        b.classList.toggle('is-selected', b === btn);
        b.textContent = b === btn ? 'Ausgewählt' : 'Auswählen';
        b.closest('.booking-pkg-col')?.classList.toggle('is-highlight', b === btn);
      });
      updateUI();
    });
  });

  function renderPackageFeatures() {
    app.querySelectorAll('[data-pkg][data-feature]').forEach(cell => {
      const pkgKey = cell.dataset.pkg;
      const feat = parseInt(cell.dataset.feature, 10);
      const has = PACKAGES[pkgKey]?.features.includes(feat);
      cell.innerHTML = has ? '<span class="booking-check-icon" aria-label="Enthalten">✓</span>' : '';
    });
  }

  function bindOptionCards(selector, set) {
    app.querySelectorAll(selector).forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.option;
        if (set.has(id)) set.delete(id); else set.add(id);
        card.classList.toggle('is-selected', set.has(id));
        card.setAttribute('aria-pressed', set.has(id));
        updateUI();
      });
    });
  }
  bindOptionCards('[data-support]', state.support);
  bindOptionCards('[data-wellness]', state.wellness);

  app.querySelector('[data-field-name]')?.addEventListener('input', e => { state.name = e.target.value; updateUI(); });
  app.querySelector('[data-field-email]')?.addEventListener('input', e => { state.email = e.target.value; updateUI(); });
  app.querySelector('[data-field-company]')?.addEventListener('input', e => { state.company = e.target.value; });
  app.querySelector('[data-field-message]')?.addEventListener('input', e => { state.message = e.target.value; });
  app.querySelector('[data-field-privacy]')?.addEventListener('change', e => { state.privacy = e.target.checked; updateUI(); });
  app.querySelector('[data-field-newsletter]')?.addEventListener('change', e => { state.newsletter = e.target.checked; });

  app.querySelector('[data-open-faq]')?.addEventListener('click', () => {
    modal.hidden = false;
    modal.querySelector('.booking-modal-close')?.focus();
  });
  modal?.querySelector('.booking-modal-close')?.addEventListener('click', () => { modal.hidden = true; });
  modal?.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });

  app.querySelectorAll('.booking-accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      panel.hidden = open;
    });
  });

  app.querySelectorAll('.booking-faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      panel.hidden = open;
    });
  });

  app.querySelectorAll('.booking-tip-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.booking-tip-box')?.remove());
  });

  renderPackageFeatures();

  // Default dates demo
  state.checkIn = new Date(2026, 6, 16);
  state.checkOut = new Date(2026, 6, 18);
  updateDateUI();
  renderCalendars();
  updateUI();
})();

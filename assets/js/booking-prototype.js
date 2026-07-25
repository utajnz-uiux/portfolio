(function () {
  const offers = {
    holiday: { name: 'Holiday home', base: 189, unit: 'night', desc: 'Musician retreat — sleep, eat, make music.' },
    rehearsal: { name: 'Rehearsal room', base: 95, unit: 'day', desc: 'Fully equipped rehearsal space for bands.' },
    recording: { name: 'Recording studio', base: 320, unit: 'day', desc: 'Professional recording setup on site.' },
    package: { name: 'Band retreat package', base: 890, unit: 'package', desc: '3 nights lodging + rehearsal + studio time.' }
  };

  const extras = [
    { id: 'sauna', name: 'Private sauna', price: 45, unit: 'session', desc: '2-hour slot, towels included.' },
    { id: 'hottub', name: 'Hot tub', price: 35, unit: 'session', desc: 'Evening slot under the stars.' },
    { id: 'breakfast', name: 'Breakfast basket', price: 18, unit: 'person/day', desc: 'Local bakery, fruit, coffee & tea.' },
    { id: 'late', name: 'Late checkout', price: 50, unit: 'once', desc: 'Stay until 2 pm on departure day.' }
  ];

  const app = document.getElementById('bookingApp');
  if (!app) return;

  const panels = Array.from(app.querySelectorAll('.booking-panel'));
  const dots = Array.from(app.querySelectorAll('.booking-step-dot'));
  const btnBack = app.querySelector('[data-action="back"]');
  const btnNext = app.querySelector('[data-action="next"]');
  const priceList = app.querySelector('[data-price-list]');

  let step = 0;
  const state = {
    offer: null,
    checkIn: '',
    checkOut: '',
    guests: 2,
    extras: new Set(),
    name: '',
    email: '',
    message: '',
    rulesAccepted: false
  };

  function nightsBetween(start, end) {
    if (!start || !end) return 0;
    const a = new Date(start);
    const b = new Date(end);
    const diff = (b - a) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  }

  function calcPricing() {
    const offer = offers[state.offer];
    if (!offer) return { lines: [], total: 0 };

    const nights = state.offer === 'package' ? 1 : Math.max(nightsBetween(state.checkIn, state.checkOut), 1);
    const lines = [];

    if (state.offer === 'package') {
      lines.push({ label: offer.name, amount: offer.base });
    } else {
      const qty = state.offer === 'holiday' ? nights : nights;
      const label = state.offer === 'holiday'
        ? `${offer.name} · ${nights} night${nights !== 1 ? 's' : ''}`
        : `${offer.name} · ${nights} day${nights !== 1 ? 's' : ''}`;
      lines.push({ label, amount: offer.base * qty });
    }

    extras.forEach((extra) => {
      if (!state.extras.has(extra.id)) return;
      let amount = extra.price;
      let label = extra.name;
      if (extra.unit === 'person/day' && state.offer === 'holiday') {
        const n = Math.max(nightsBetween(state.checkIn, state.checkOut), 1);
        amount = extra.price * state.guests * n;
        label = `${extra.name} · ${state.guests} guests × ${n} days`;
      } else if (extra.unit === 'session') {
        label = `${extra.name} · 1 session`;
      }
      lines.push({ label, amount });
    });

    const total = lines.reduce((sum, line) => sum + line.amount, 0);
    return { lines, total };
  }

  function renderPricing() {
    if (!priceList) return;
    const { lines, total } = calcPricing();
    priceList.innerHTML = lines.map((line) =>
      `<div class="booking-price-row"><span>${line.label}</span><span>€${line.amount}</span></div>`
    ).join('') + `<div class="booking-price-row is-total"><span>Estimated total</span><span>€${total}</span></div>`;
  }

  function validateStep() {
    if (step === 0) return !!state.offer;
    if (step === 1) {
      if (state.offer === 'package') return true;
      return state.checkIn && state.checkOut && nightsBetween(state.checkIn, state.checkOut) > 0;
    }
    if (step === 2) return true;
    if (step === 3) {
      renderPricing();
      return true;
    }
    if (step === 4) {
      return state.name.trim() && state.email.trim() && state.rulesAccepted;
    }
    return true;
  }

  function updateUI() {
    panels.forEach((panel, i) => panel.classList.toggle('is-active', i === step));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === step && step < 5);
      dot.classList.toggle('is-done', i < step || step === 5);
    });

    btnBack.style.visibility = step === 0 || step === 5 ? 'hidden' : 'visible';
    btnNext.textContent = step === 4 ? 'Send request' : step === 5 ? 'Done' : 'Continue';
    btnNext.disabled = step < 5 && !validateStep();

    if (step === 5) {
      btnNext.disabled = false;
      btnBack.style.visibility = 'hidden';
    }
  }

  app.querySelectorAll('.booking-offer-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.offer = card.dataset.offer;
      app.querySelectorAll('.booking-offer-card').forEach((c) => c.classList.toggle('is-selected', c === card));
      updateUI();
    });
  });

  app.querySelectorAll('[data-extra]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) state.extras.add(input.value);
      else state.extras.delete(input.value);
      updateUI();
    });
  });

  ['checkIn', 'checkOut', 'guests', 'name', 'email', 'message', 'rulesAccepted'].forEach((key) => {
    const el = app.querySelector(`[data-field="${key}"]`);
    if (!el) return;
    const event = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(event, () => {
      if (el.type === 'checkbox') state[key] = el.checked;
      else if (key === 'guests') state[key] = parseInt(el.value, 10) || 1;
      else state[key] = el.value;
      updateUI();
    });
  });

  btnBack.addEventListener('click', () => {
    if (step > 0 && step < 5) {
      step -= 1;
      updateUI();
    }
  });

  btnNext.addEventListener('click', () => {
    if (step === 4) {
      step = 5;
      updateUI();
      return;
    }
    if (step === 5) {
      step = 0;
      state.offer = null;
      state.checkIn = '';
      state.checkOut = '';
      state.guests = 2;
      state.extras.clear();
      state.name = '';
      state.email = '';
      state.message = '';
      state.rulesAccepted = false;
      app.querySelectorAll('.booking-offer-card').forEach((c) => c.classList.remove('is-selected'));
      app.querySelectorAll('[data-extra]').forEach((i) => { i.checked = false; });
      app.querySelectorAll('[data-field]').forEach((el) => {
        if (el.type === 'checkbox') el.checked = false;
        else if (el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = el.dataset.field === 'guests' ? '2' : '';
      });
      updateUI();
      return;
    }
    if (validateStep()) {
      step += 1;
      if (step === 3) renderPricing();
      updateUI();
    }
  });

  updateUI();
})();

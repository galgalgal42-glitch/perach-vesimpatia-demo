(() => {
  'use strict';

  const { SHOP, OCCASIONS, PRODUCTS, SIZES, ADDONS, REVIEWS } = window;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const page = document.body.dataset.page;

  document.documentElement.classList.add('js');

  const price = (n) => `₪${n.toLocaleString('he-IL')}`;
  const waUrl = (text) => `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const sizeLabel = (p, i) => (p.sizeLabels ? p.sizeLabels[i] : SIZES[i]);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    }
  };

  /* ---------- Opening hours, in the shop's own time zone ---------- */

  const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function shopNow() {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: SHOP.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric', hourCycle: 'h23'
    }).formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    return {
      day: WEEKDAY_INDEX[get('weekday')],
      minutes: Number(get('hour')) * 60 + Number(get('minute')),
      date: new Date(Number(get('year')), Number(get('month')) - 1, Number(get('day')))
    };
  }

  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  function openState() {
    const now = shopNow();
    const today = SHOP.hours[now.day];
    if (today && now.minutes >= toMin(today[0]) && now.minutes < toMin(today[1])) {
      return { open: true, text: `פתוח עכשיו, עד ${today[1]}` };
    }
    if (today && now.minutes < toMin(today[0])) {
      return { open: false, text: `סגור כרגע. נפתח היום ב־${today[0]}` };
    }
    for (let i = 1; i <= 7; i += 1) {
      const d = (now.day + i) % 7;
      const h = SHOP.hours[d];
      if (h) {
        const when = i === 1 ? 'מחר' : `ביום ${DAY_NAMES[d]}`;
        return { open: false, text: `סגור כרגע. נפתח ${when} ב־${h[0]}` };
      }
    }
    return { open: false, text: '' };
  }

  function renderStatus() {
    const s = openState();
    $$('[data-open-status-long]').forEach((el) => {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
    });
    const now = shopNow();
    const tbody = $('[data-hours]');
    if (tbody) {
      tbody.innerHTML = SHOP.hours.map((h, i) => `
        <tr${i === now.day ? ' class="is-today"' : ''}>
          <th scope="row">יום ${DAY_NAMES[i]}${i === now.day ? ' <span class="hours__today">היום</span>' : ''}</th>
          <td>${h ? `${h[0]} עד ${h[1]}` : 'סגור'}</td>
        </tr>`).join('');
    }
  }

  /* ---------- Shared selects ---------- */

  function dateOptions() {
    const now = shopNow();
    const opts = [];
    const fmt = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric' });
    for (let i = 0; opts.length < 8 && i < 12; i += 1) {
      const d = new Date(now.date);
      d.setDate(d.getDate() + i);
      const dow = (now.day + i) % 7;
      const h = SHOP.hours[dow];
      if (!h) continue;
      if (i === 0 && now.minutes >= toMin(h[1])) continue;
      const name = i === 0 ? 'היום' : i === 1 ? 'מחר' : `יום ${DAY_NAMES[dow]}`;
      const label = `${name}, ${fmt.format(d)}`;
      opts.push(`<option value="${label}">${label}</option>`);
    }
    opts.push('<option value="מועד אחר, נתאם בשיחה">מועד אחר, נתאם בשיחה</option>');
    return opts.join('');
  }

  function fillSelects() {
    $$('[data-date-select]').forEach((s) => { s.innerHTML = dateOptions(); });
    const towns = SHOP.towns.map((t) => `<option value="משלוח ל${t}">משלוח ל${t}</option>`).join('');
    $$('[data-town-select]').forEach((s) => {
      s.innerHTML = `${towns}<option value="משלוח ליישוב אחר בסביבה, נתאם בשיחה">יישוב אחר בסביבה</option><option value="איסוף עצמי מהחנות">איסוף עצמי מהחנות</option>`;
    });
    const list = $('[data-towns]');
    if (list) list.innerHTML = SHOP.towns.map((t) => `<li>${t}</li>`).join('');
  }

  function wireWhatsAppLinks() {
    const href = waUrl('שלום, הגעתי מהאתר ואשמח לעזרה בהזמנת פרחים.');
    $$('[data-wa-link]').forEach((a) => {
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Toast ---------- */

  let toastTimer;
  function toast(message, action) {
    const el = $('[data-toast]');
    el.innerHTML = `<span>${esc(message)}</span>${action ? `<button type="button">${action.label}</button>` : ''}`;
    if (action) $('button', el).addEventListener('click', () => { action.run(); hideToast(); });
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4200);
  }
  function hideToast() {
    const el = $('[data-toast]');
    el.classList.remove('is-visible');
    setTimeout(() => { el.hidden = true; }, 220);
  }

  /* ---------- Catalog ---------- */

  const BUDGET = { low: [0, 200], mid: [201, 300], high: [301, Infinity] };
  const filter = { occasion: null, color: '', budget: '', sort: '' };

  function readQuery() {
    const q = new URLSearchParams(location.search);
    filter.occasion = q.get('occasion') || null;
    filter.color = q.get('color') || '';
    filter.budget = q.get('budget') || '';
    filter.sort = q.get('sort') || '';
  }

  function writeQuery() {
    const q = new URLSearchParams();
    if (filter.occasion) q.set('occasion', filter.occasion);
    if (filter.color) q.set('color', filter.color);
    if (filter.budget) q.set('budget', filter.budget);
    if (filter.sort) q.set('sort', filter.sort);
    const qs = q.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function matches(p) {
    if (filter.occasion && !p.occasions.includes(filter.occasion)) return false;
    if (filter.color && !p.colors.includes(filter.color)) return false;
    if (filter.budget) {
      const [lo, hi] = BUDGET[filter.budget];
      if (p.prices[0] < lo || p.prices[0] > hi) return false;
    }
    return true;
  }

  // Mourning and condolence pieces always close the list, whatever the sort.
  function ordered(list) {
    const out = [...list];
    if (filter.sort === 'asc') out.sort((a, b) => a.prices[0] - b.prices[0]);
    if (filter.sort === 'desc') out.sort((a, b) => b.prices[0] - a.prices[0]);
    return [...out.filter((p) => !p.quiet), ...out.filter((p) => p.quiet)];
  }

  const countFor = (id) => PRODUCTS.filter((p) => p.occasions.includes(id)).length;

  function cardHTML(p, i) {
    return `
      <li class="product${p.quiet ? ' product--quiet' : ''}" style="--i:${i}; view-transition-name: product-${p.id}">
        <button type="button" class="product__hit" data-product="${p.id}" aria-label="${esc(p.name)}, החל מ־${price(p.prices[0])}. לפרטים ולהזמנה">
          <span class="product__media">
            <img src="${p.img}" alt="" loading="lazy" decoding="async" width="600" height="630">
            <span class="product__reveal" aria-hidden="true">לפרטים ולהזמנה</span>
          </span>
          <span class="product__text">
            <span class="product__name">${esc(p.name)}</span>
            <span class="product__flowers">${esc(p.flowers)}</span>
            <span class="product__price">החל מ־${price(p.prices[0])}</span>
          </span>
        </button>
      </li>`;
  }

  function renderGrid() {
    const grid = $('[data-grid]');
    if (!grid) return;
    const featuredOnly = grid.hasAttribute('data-featured');
    const list = featuredOnly ? ordered(PRODUCTS.filter((p) => p.featured)) : ordered(PRODUCTS.filter(matches));
    grid.innerHTML = list.length
      ? list.map(cardHTML).join('')
      : `<li class="product-grid__empty"><p>לא מצאנו זר שמתאים לכל הסינונים יחד.</p><p>אפשר <button type="button" data-clear-filter>לנקות את הסינון</button> או <a href="index.html#personal">לספר לנו מה אתם מחפשים</a>, והשוזר ירכיב זר בשבילכם.</p></li>`;
    const count = $('[data-count]');
    if (count) count.textContent = list.length === 1 ? 'פריט אחד' : `${list.length} פריטים`;
    const clear = $('.results-bar [data-clear-filter]');
    if (clear) clear.hidden = !(filter.occasion || filter.color || filter.budget);
  }

  function renderChips() {
    const wrap = $('[data-chips]');
    if (!wrap) return;
    const items = [{ id: '', label: 'הכול' }, ...OCCASIONS.filter((o) => countFor(o.id))];
    wrap.innerHTML = items.map((o) => {
      const active = (filter.occasion || '') === o.id;
      return `<button type="button" class="filter-chip${o.quiet ? ' filter-chip--quiet' : ''}" aria-pressed="${active}" data-chip="${o.id}">${o.label}</button>`;
    }).join('');
    const sc = $('[data-select-color]'); if (sc) sc.value = filter.color;
    const sb = $('[data-select-budget]'); if (sb) sb.value = filter.budget;
    const so = $('[data-select-sort]'); if (so) so.value = filter.sort;
  }

  function applyFilter() {
    writeQuery();
    const run = () => { renderChips(); renderGrid(); };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(run);
    else run();
  }

  function wireCatalog() {
    const grid = $('[data-grid]');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const hit = e.target.closest('[data-product]');
        if (hit) openQuickView(hit.dataset.product, hit);
      });
    }
    if (page !== 'catalog') return;

    readQuery();
    $('[data-chips]').addEventListener('click', (e) => {
      const chip = e.target.closest('[data-chip]');
      if (!chip) return;
      filter.occasion = chip.dataset.chip || null;
      applyFilter();
    });
    [['[data-select-color]', 'color'], ['[data-select-budget]', 'budget'], ['[data-select-sort]', 'sort']].forEach(([sel, key]) => {
      $(sel).addEventListener('change', (e) => { filter[key] = e.target.value; applyFilter(); });
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-filter]')) {
        Object.assign(filter, { occasion: null, color: '', budget: '' });
        applyFilter();
      }
    });
    // Menu links point at catalog.html?...; on this page, filter in place.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-filter]');
      if (!link) return;
      e.preventDefault();
      const [kind, value] = link.dataset.filter.split(':');
      Object.assign(filter, { occasion: null, color: '', budget: '' });
      filter[kind] = value;
      closeMega();
      closeDrawers();
      applyFilter();
      $('[data-toolbar]').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    renderChips();
    renderGrid();
  }

  /* ---------- Occasions: rows + cursor peek ---------- */

  function occasionLinks() {
    const links = OCCASIONS.filter((o) => countFor(o.id))
      .map((o) => `<li><a href="catalog.html?occasion=${o.id}" data-filter="occasion:${o.id}">${o.label}</a></li>`).join('');
    $$('[data-mega-occasions], [data-menu-occasions]').forEach((ul) => { ul.innerHTML = links; });
  }

  function renderOccasions() {
    const list = $('[data-occasions]');
    if (!list) return;
    const rep = (o) => {
      const p = (o.cover && byId(o.cover)) || PRODUCTS.find((x) => x.occasions.includes(o.id));
      return p ? p.img : '';
    };
    list.innerHTML = OCCASIONS.filter((o) => countFor(o.id)).map((o) => `
        <li class="occasion${o.quiet ? ' occasion--quiet' : ''}">
          <a href="catalog.html?occasion=${o.id}" data-peek-src="${rep(o)}">
            <img class="occasion__thumb" src="${rep(o)}" alt="" loading="lazy" width="600" height="630">
            <span class="occasion__label">${o.label}</span>
            <svg class="icon occasion__arrow" aria-hidden="true"><use href="#i-arrow-left"/></svg>
          </a>
        </li>`).join('');

    const preview = $('[data-preview]');
    if (!preview) return;
    const imgA = $('[data-preview-a]', preview);
    const imgB = $('[data-preview-b]', preview);
    const caption = $('[data-preview-caption]', preview);
    let front = imgA;
    let current = '';
    const show = (a) => {
      const src = a.dataset.peekSrc;
      caption.textContent = a.querySelector('.occasion__label').textContent;
      $$('.occasion a', list).forEach((x) => x.classList.toggle('is-active', x === a));
      if (src === current) return;
      current = src;
      const back = front === imgA ? imgB : imgA;
      back.src = src;
      const swap = () => { back.classList.remove('is-hidden'); front.classList.add('is-hidden'); front = back; };
      if (back.complete) swap(); else back.onload = swap;
    };
    const first = $('.occasion a', list);
    if (first) { imgA.src = first.dataset.peekSrc; current = imgA.src; show(first); }
    list.addEventListener('pointerover', (e) => { const a = e.target.closest('[data-peek-src]'); if (a) show(a); });
    list.addEventListener('focusin', (e) => { const a = e.target.closest('[data-peek-src]'); if (a) show(a); });
  }

  /* ---------- About: rating, reviews, gifts ---------- */

  function renderAbout() {
    const meta = $('[data-rating-meta]');
    if (meta) {
      $('[data-rating-score]').textContent = SHOP.rating.score;
      $('[data-rating-stars]').innerHTML = Array.from({ length: 5 }, () => '<svg class="icon" aria-hidden="true"><use href="#i-star"/></svg>').join('');
      meta.innerHTML = `ממוצע של ${SHOP.rating.count} מדרגים מאומתים באתר <a href="${SHOP.b144}" target="_blank" rel="noopener">${SHOP.rating.source}</a>, נכון ל${SHOP.rating.checked}`;
    }
    const list = $('[data-reviews]');
    if (list) {
      list.innerHTML = REVIEWS.map((r) => `
        <li class="review">
          <svg class="icon review__mark" aria-hidden="true"><use href="#i-quotes"/></svg>
          <blockquote><p>${esc(r.text)}</p></blockquote>
          <p class="review__by">${esc(r.name)} <span>באתר B144, <time>${r.date}</time></span></p>
        </li>`).join('');
    }
    const gifts = $('[data-gifts]');
    if (gifts) {
      gifts.innerHTML = ADDONS.map((a) => `
        <li class="gift">
          <img src="${a.img}" alt="" loading="lazy" width="600" height="630">
          <p class="gift__name">${a.name}</p>
          <p class="gift__price">${price(a.price)}</p>
        </li>`).join('');
    }
  }

  /* ---------- Mega menu (desktop) ---------- */

  const megaTrigger = $('[data-mega-trigger]');
  const megaPanel = $('[data-mega-panel]');
  let megaOpenTimer; let megaCloseTimer;

  function openMega() {
    clearTimeout(megaCloseTimer);
    if (!megaPanel.hidden) return;
    megaPanel.hidden = false;
    requestAnimationFrame(() => megaPanel.classList.add('is-open'));
    megaTrigger.setAttribute('aria-expanded', 'true');
  }
  function closeMega() {
    clearTimeout(megaOpenTimer);
    if (megaPanel.hidden) return;
    megaPanel.classList.remove('is-open');
    megaTrigger.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!megaPanel.classList.contains('is-open')) megaPanel.hidden = true; }, 200);
  }

  function wireMega() {
    const item = $('[data-mega]');
    megaTrigger.addEventListener('click', () => (megaPanel.hidden ? openMega() : closeMega()));
    if (canHover) {
      [item, megaPanel].forEach((el) => {
        el.addEventListener('pointerenter', () => {
          clearTimeout(megaCloseTimer);
          megaOpenTimer = setTimeout(openMega, 90);
        });
        el.addEventListener('pointerleave', () => {
          clearTimeout(megaOpenTimer);
          megaCloseTimer = setTimeout(closeMega, 220);
        });
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !megaPanel.hidden) { closeMega(); megaTrigger.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (!megaPanel.hidden && !e.target.closest('[data-mega], [data-mega-panel]')) closeMega();
    });
    megaPanel.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !megaPanel.contains(e.relatedTarget) && e.relatedTarget !== megaTrigger) closeMega();
    });
  }

  /* ---------- Drawers ---------- */

  let lastFocus = null;

  function openDrawer(name) {
    const drawer = $(`[data-drawer="${name}"]`);
    if (!$('[data-toast]').hidden) hideToast();
    closeMega();
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    $$(`[aria-controls="${drawer.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const focusable = $('button, a, input, select, textarea', $('.drawer__panel', drawer));
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }

  function closeDrawers() {
    let closed = false;
    $$('[data-drawer]').forEach((drawer) => {
      if (drawer.hidden) return;
      closed = true;
      drawer.classList.remove('is-open');
      $$(`[aria-controls="${drawer.id}"]`).forEach((b) => b.setAttribute('aria-expanded', 'false'));
      setTimeout(() => { drawer.hidden = true; }, 320);
    });
    if (!closed) return;
    document.body.classList.remove('is-locked');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function trapFocus(e) {
    const drawer = $$('[data-drawer]').find((d) => !d.hidden);
    if (!drawer || e.key !== 'Tab') return;
    const items = $$('button, a[href], input, select, textarea', $('.drawer__panel', drawer))
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0]; const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function wireDrawers() {
    $('[data-open-menu]').addEventListener('click', () => openDrawer('menu'));
    $('[data-open-bag]').addEventListener('click', () => { renderBag(); openDrawer('bag'); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-drawer]')) closeDrawers();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawers();
      trapFocus(e);
    });
    $$('[data-accordion]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ---------- Bag ---------- */

  let bag = store.get('pv-bag', []).filter((i) => byId(i.id));
  const saveBag = () => { store.set('pv-bag', bag); updateBagCount(); };
  const addonsFor = (ids) => ADDONS.filter((a) => (ids || []).includes(a.id));
  const unitPrice = (item) => item.price + addonsFor(item.addons).reduce((s, a) => s + a.price, 0);

  function updateBagCount() {
    const n = bag.reduce((sum, item) => sum + item.qty, 0);
    const badge = $('[data-bag-count]');
    badge.textContent = n;
    badge.hidden = n === 0;
    $('[data-open-bag]').setAttribute('aria-label', n ? `הסל שלי, ${n === 1 ? 'פריט אחד' : `${n} פריטים`}` : 'הסל שלי');
  }

  function itemLine(item) {
    const p = byId(item.id);
    const parts = [`${p.name}, ${item.size} (${price(item.price)})${item.qty > 1 ? `, כמות: ${item.qty}` : ''}`];
    const extras = addonsFor(item.addons);
    if (extras.length) parts.push(`תוספות: ${extras.map((a) => `${a.name} (${price(a.price)})`).join(', ')}`);
    parts.push(item.when.startsWith('מועד') ? item.when : `מועד: ${item.when}`, item.where);
    if (item.note) parts.push(`ברכה לכרטיס: "${item.note}"`);
    return parts.join('\n   ');
  }

  function bagMessage() {
    const total = bag.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
    return [
      'שלום, אשמח להזמין מהאתר:',
      ...bag.map((i, n) => `${n + 1}. ${itemLine(i)}`),
      `סה"כ לפי האתר: ${price(total)}, לפני משלוח.`,
      'אשמח לאישור ולתיאום התשלום. תודה!'
    ].join('\n');
  }

  function renderBag() {
    const root = $('[data-bag]');
    if (!bag.length) {
      root.innerHTML = `
        <div class="bag__empty">
          <p class="bag__empty-title">הסל עדיין ריק</p>
          <p>בחרו זר מהקטלוג או ספרו לנו על זר אישי.</p>
          <a class="btn btn--ghost" href="catalog.html">לקטלוג</a>
        </div>`;
      return;
    }
    const total = bag.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
    root.innerHTML = `
      <ul class="bag__list">
        ${bag.map((item, idx) => {
          const p = byId(item.id);
          const extras = addonsFor(item.addons);
          return `
          <li class="bag-item">
            <img src="${p.img}" alt="" width="600" height="630">
            <div class="bag-item__body">
              <p class="bag-item__name">${esc(p.name)}</p>
              <p class="bag-item__meta">${esc(item.size)}, ${esc(item.when)}<br>${esc(item.where)}</p>
              ${extras.length ? `<p class="bag-item__meta">+ ${extras.map((a) => a.name).join(', ')}</p>` : ''}
              ${item.note ? `<p class="bag-item__note">"${esc(item.note)}"</p>` : ''}
              <div class="bag-item__row">
                <div class="stepper" role="group" aria-label="כמות של ${esc(p.name)}">
                  <button type="button" aria-label="הוספת יחידה" data-qty="${idx}" data-delta="1"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-plus"/></svg></button>
                  <span>${item.qty}</span>
                  <button type="button" aria-label="הורדת יחידה" data-qty="${idx}" data-delta="-1"${item.qty === 1 ? ' disabled' : ''}><svg class="icon icon--sm" aria-hidden="true"><use href="#i-minus"/></svg></button>
                </div>
                <span class="bag-item__price">${price(unitPrice(item) * item.qty)}</span>
              </div>
            </div>
            <button class="icon-btn bag-item__remove" type="button" aria-label="הסרת ${esc(p.name)} מהסל" data-remove="${idx}">
              <svg class="icon icon--sm" aria-hidden="true"><use href="#i-trash"/></svg>
            </button>
          </li>`;
        }).join('')}
      </ul>
      <div class="bag__foot">
        <p class="bag__total"><span>סה"כ</span><strong>${price(total)}</strong></p>
        <p class="bag__fine">לפני דמי משלוח. אין תשלום באתר: ההזמנה נשלחת אלינו בוואטסאפ, ואנחנו חוזרים אליכם לאישור ולתיאום התשלום.</p>
        <a class="btn btn--primary btn--block" href="${waUrl(bagMessage())}" target="_blank" rel="noopener">
          <svg class="icon" aria-hidden="true"><use href="#i-whatsapp-logo"/></svg>
          שליחת ההזמנה בוואטסאפ
        </a>
      </div>`;
  }

  function wireBag() {
    $('[data-bag]').addEventListener('click', (e) => {
      const q = e.target.closest('[data-qty]');
      const r = e.target.closest('[data-remove]');
      if (q) {
        const item = bag[Number(q.dataset.qty)];
        item.qty = Math.max(1, Math.min(20, item.qty + Number(q.dataset.delta)));
      } else if (r) {
        const removed = bag.splice(Number(r.dataset.remove), 1)[0];
        toast(`הסרנו מהסל: ${byId(removed.id).name}`, {
          label: 'ביטול',
          run: () => { bag.push(removed); saveBag(); renderBag(); }
        });
      } else {
        return;
      }
      saveBag();
      renderBag();
    });
    updateBagCount();
  }

  /* ---------- Quick view ---------- */

  const qv = $('[data-quickview]');
  let qvProduct = null;
  let qvTrigger = null;

  function qvItem() {
    const form = $('[data-qv-form]', qv);
    const sizeIdx = Number(form.querySelector('input[name="size"]:checked').value);
    return {
      id: qvProduct.id,
      size: sizeLabel(qvProduct, sizeIdx),
      price: qvProduct.prices[sizeIdx],
      addons: $$('input[name="addon"]:checked', form).map((i) => i.value),
      when: form.when.value,
      where: form.where.value,
      note: form.note.value.trim(),
      qty: 1
    };
  }

  function updateQvTotal() {
    $('[data-qv-total]', qv).textContent = price(unitPrice(qvItem()));
  }

  function openQuickView(id, trigger) {
    const p = byId(id);
    qvProduct = p;
    qvTrigger = trigger;
    const img = $('[data-qv-img]', qv);
    img.src = p.img;
    img.alt = `${p.name}: ${p.flowers}`;
    $('[data-qv-title]', qv).textContent = p.name;
    $('[data-qv-desc]', qv).textContent = p.desc;
    $('[data-qv-sizes]', qv).innerHTML = p.prices.map((pr, i) => `
      <label class="size-option">
        <input type="radio" name="size" value="${i}"${i === 0 ? ' checked' : ''}>
        <span><strong>${sizeLabel(p, i)}</strong><em>${price(pr)}</em></span>
      </label>`).join('');
    const addonGroup = $('[data-qv-addons-group]', qv);
    addonGroup.hidden = !!p.quiet;
    $('[data-qv-addons]', qv).innerHTML = p.quiet ? '' : ADDONS.map((a) => `
      <label class="addon">
        <input type="checkbox" name="addon" value="${a.id}">
        <span><img src="${a.img}" alt="" width="600" height="630"><span class="addon__text"><strong>${a.name}</strong><em>+${price(a.price)}</em></span></span>
      </label>`).join('');
    const form = $('[data-qv-form]', qv);
    form.note.value = '';
    $('[data-count-for="qv-note"]').textContent = '0';
    qv.classList.toggle('quickview--quiet', !!p.quiet);
    updateQvTotal();
    qv.showModal();
    qv.classList.remove('is-closing');
    qv.scrollTop = 0;
    document.body.classList.add('is-locked');
  }

  function closeQuickView() {
    if (!qv.open) return;
    if (reduceMotion) { qv.close(); return; }
    qv.classList.add('is-closing');
    setTimeout(() => { qv.close(); qv.classList.remove('is-closing'); }, 200);
  }

  function wireQuickView() {
    qv.addEventListener('close', () => {
      document.body.classList.remove('is-locked');
      if (qvTrigger && document.contains(qvTrigger)) qvTrigger.focus({ preventScroll: true });
    });
    qv.addEventListener('cancel', (e) => { e.preventDefault(); closeQuickView(); });
    qv.addEventListener('click', (e) => { if (e.target === qv) closeQuickView(); });
    $('.quickview__close-form', qv).addEventListener('submit', (e) => { e.preventDefault(); closeQuickView(); });
    $('[data-qv-form]', qv).addEventListener('change', updateQvTotal);

    $('[data-qv-form]', qv).addEventListener('submit', (e) => {
      e.preventDefault();
      const item = qvItem();
      const key = (i) => [i.id, i.size, i.note, i.when, i.where, (i.addons || []).join()].join('|');
      const same = bag.find((b) => key(b) === key(item));
      if (same) same.qty += 1; else bag.push(item);
      saveBag();
      closeQuickView();
      toast(`הוספנו לסל: ${qvProduct.name}`, { label: 'לסל', run: () => { renderBag(); openDrawer('bag'); } });
    });

    $('[data-qv-wa]', qv).addEventListener('click', () => {
      const text = `שלום, אשמח להזמין מהאתר:\n${itemLine(qvItem())}\nאשמח לאישור ולתיאום התשלום. תודה!`;
      window.open(waUrl(text), '_blank', 'noopener');
    });
  }

  /* ---------- Personal bouquet builder ---------- */

  function wireBuilder() {
    const form = $('[data-builder]');
    if (!form) return;
    const preview = $('[data-note-preview]');
    const error = $('[data-builder-error]');

    const read = () => {
      const val = (n) => (form.querySelector(`input[name="${n}"]:checked`) || {}).value;
      return {
        who: val('who'),
        occasion: val('occasion'),
        colors: $$('input[name="colors"]:checked', form).map((i) => i.value),
        size: val('size'),
        when: form.when.value,
        where: form.where.value,
        note: form.note.value.trim(),
        name: form.name.value.trim()
      };
    };

    const message = (d) => {
      const lines = [d.name ? `שלום, כאן ${d.name}.` : 'שלום,'];
      let ask = 'אבקש זר אישי';
      if (d.occasion) ask += ` ${d.occasion}`;
      if (d.who) ask += `, ${d.who}`;
      lines.push(`${ask}.`);
      if (d.colors.length) lines.push(`צבעים: ${d.colors.join(', ')}.`);
      if (d.size) lines.push(`גודל: ${d.size}.`);
      lines.push(`${d.when.startsWith('מועד') ? d.when : `מועד: ${d.when}`}. ${d.where}.`);
      if (d.note) lines.push(`ברכה לכרטיס: "${d.note}"`);
      lines.push('אשמח שתחזרו אליי עם הצעה ומחיר. תודה!');
      return lines;
    };

    // Only lines whose text changed get a new node, so the note grows line by line.
    const render = () => {
      const lines = message(read());
      const existing = [...preview.children];
      lines.forEach((text, i) => {
        const node = existing[i];
        if (node && node.textContent === text) return;
        const span = document.createElement('span');
        span.className = 'note-line';
        span.textContent = text;
        if (node) preview.replaceChild(span, node); else preview.appendChild(span);
      });
      existing.slice(lines.length).forEach((n) => n.remove());
    };

    form.addEventListener('input', () => { render(); error.hidden = true; });
    form.addEventListener('change', render);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = read();
      if (!d.occasion) {
        error.hidden = false;
        $('[data-group="occasion"] input', form).focus();
        return;
      }
      window.open(waUrl(message(d).join('\n')), '_blank', 'noopener');
    });
    render();
  }

  /* ---------- Small wiring ---------- */

  function wireCounters() {
    $$('[data-count-for]').forEach((out) => {
      const field = document.getElementById(out.dataset.countFor);
      if (field) field.addEventListener('input', () => { out.textContent = field.value.length; });
    });
  }

  function wireScrollState() {
    const header = $('[data-header]');
    const fab = $('[data-fab]');
    if (!('IntersectionObserver' in window)) { fab.classList.add('is-visible'); return; }
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
    const hero = $('.hero');
    if (hero) {
      new IntersectionObserver(([entry]) => {
        fab.classList.toggle('is-visible', !entry.isIntersecting);
      }).observe(hero);
    } else {
      fab.classList.add('is-visible');
    }

    if (reduceMotion) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.section-head, .personal__media, .personal__body, .occasion-list, .about__media, .about__body, .reviews, .gift-row, .shop__main, .shop__delivery, .faq__inner')
      .forEach((el) => { el.setAttribute('data-reveal', ''); io.observe(el); });
  }

  /* ---------- Boot ---------- */

  renderStatus();
  setInterval(renderStatus, 60 * 1000);
  fillSelects();
  wireWhatsAppLinks();
  occasionLinks();
  renderGrid();
  renderOccasions();
  renderAbout();
  wireCatalog();
  wireMega();
  wireDrawers();
  wireBag();
  wireQuickView();
  wireBuilder();
  wireCounters();
  wireScrollState();
})();

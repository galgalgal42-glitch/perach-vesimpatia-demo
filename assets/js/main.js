(() => {
  'use strict';

  const { SHOP, OCCASIONS, PRODUCTS, SIZES, ADDONS, REVIEWS, COUPON } = window;
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
    $$('[data-towns]').forEach((list) => { list.innerHTML = SHOP.towns.map((t) => `<li>${t}</li>`).join(''); });
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
  const filter = { occasion: null, color: '', budget: '', sort: '', q: '' };
  const PICKS = { id: 'picks', label: 'מומלצים' };
  const picksList = () => PRODUCTS.filter((p) => p.pick).sort((a, b) => a.pick - b.pick);

  /* ---------- Search: Hebrew-aware matching ---------- */

  const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  const norm = (s) => String(s).replace(/[\u0591-\u05C7]/g, '').replace(/[ךםןףץ]/g, (c) => FINALS[c])
    .replace(/["'״׳־,.\-]/g, ' ').toLowerCase();
  const COLOR_WORDS = { white: 'לבן לבנים לבנה', pastel: 'פסטל ורוד ורודים עדין', warm: 'כתום צהוב חם חמים', red: 'אדום אדומים בורדו' };
  const indexOf = (p) => norm([
    p.name, p.flowers, p.desc,
    ...p.occasions.map((id) => (OCCASIONS.find((o) => o.id === id) || {}).label || ''),
    ...p.colors.map((c) => COLOR_WORDS[c] || ''),
    p.occasions.includes('plants') ? 'עציץ עציצים צמח' : 'זר זרים',
    p.pick ? 'מומלץ מומלצים' : ''
  ].join(' '));
  const SEARCH_INDEX = new Map(PRODUCTS.map((p) => [p.id, indexOf(p)]));
  const STOP = new Set(['עד', 'של', 'עם', 'או', 'זר', 'זרי', 'זרים', 'פרחים', 'פרחי', 'ל', 'ב']);

  function searchProducts(query) {
    const raw = norm(query).split(/\s+/).filter(Boolean);
    const max = (/עד\s*₪?\s*(\d+)/.exec(query) || [])[1];
    const words = raw.filter((w) => !STOP.has(w) && !/^\d+$/.test(w) && w !== '₪')
      .map((w) => (w.length >= 5 && /(ימ|ות)$/.test(w) ? w.slice(0, -2) : w));
    if (!words.length && !max) return [];
    return ordered(PRODUCTS.filter((p) => {
      if (max && p.prices[0] > Number(max)) return false;
      const hay = SEARCH_INDEX.get(p.id);
      return words.every((w) => hay.includes(w) || (w.length > 3 && /^[והבלמש]/.test(w) && hay.includes(w.slice(1))));
    }));
  }

  function readQuery() {
    const q = new URLSearchParams(location.search);
    filter.occasion = q.get('occasion') || null;
    filter.color = q.get('color') || '';
    filter.budget = q.get('budget') || '';
    filter.sort = q.get('sort') || '';
    filter.q = q.get('q') || '';
  }

  function writeQuery() {
    const q = new URLSearchParams();
    if (filter.occasion) q.set('occasion', filter.occasion);
    if (filter.color) q.set('color', filter.color);
    if (filter.budget) q.set('budget', filter.budget);
    if (filter.sort) q.set('sort', filter.sort);
    if (filter.q) q.set('q', filter.q);
    const qs = q.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function matches(p) {
    if (filter.occasion === 'picks') { if (!p.pick) return false; }
    else if (filter.occasion && !p.occasions.includes(filter.occasion)) return false;
    if (filter.q && !searchProducts(filter.q).includes(p)) return false;
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
            ${p.pick ? '<span class="product__badge"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-sparkle"/></svg>מומלץ</span>' : ''}
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
    if (count) {
      const n = list.length === 1 ? 'פריט אחד' : `${list.length} פריטים`;
      count.textContent = filter.q ? `${n} בחיפוש "${filter.q}"` : n;
    }
    const clear = $('.results-bar [data-clear-filter]');
    if (clear) clear.hidden = !(filter.occasion || filter.color || filter.budget || filter.q);
  }

  function renderChips() {
    const wrap = $('[data-chips]');
    if (!wrap) return;
    const items = [{ id: '', label: 'הכול' }, PICKS, ...OCCASIONS.filter((o) => countFor(o.id))];
    wrap.innerHTML = items.map((o) => {
      const active = (filter.occasion || '') === o.id;
      const spark = o.id === 'picks' ? '<svg class="icon icon--sm" aria-hidden="true"><use href="#i-sparkle"/></svg>' : '';
      return `<button type="button" class="filter-chip${o.quiet ? ' filter-chip--quiet' : ''}${spark ? ' filter-chip--pick' : ''}" aria-pressed="${active}" data-chip="${o.id}">${spark}${o.label}</button>`;
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
    document.addEventListener('click', (e) => {
      const hit = e.target.closest('[data-product]');
      if (!hit) return;
      if (hit.closest('[data-search]')) closeSearch(true);
      openQuickView(hit.dataset.product, hit);
    });
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
        Object.assign(filter, { occasion: null, color: '', budget: '', q: '' });
        applyFilter();
      }
    });
    // Menu links point at catalog.html?...; on this page, filter in place.
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-filter]');
      if (!link) return;
      e.preventDefault();
      const [kind, value] = link.dataset.filter.split(':');
      Object.assign(filter, { occasion: null, color: '', budget: '', q: '' });
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
    const links = [PICKS, ...OCCASIONS.filter((o) => countFor(o.id))]
      .map((o) => `<li><a href="catalog.html?occasion=${o.id}" data-filter="occasion:${o.id}"${o.id === 'picks' ? ' class="is-pick"' : ''}>${o.label}</a></li>`).join('');
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
            <img class="occasion__thumb" src="${rep(o)}" alt="" width="600" height="630">
            <span class="occasion__label">${o.label}</span>
            <svg class="icon occasion__arrow" aria-hidden="true"><use href="#i-arrow-left"/></svg>
          </a>
        </li>`).join('');

    const preview = $('[data-preview]');
    if (!preview) return;
    const imgA = $('[data-preview-a]', preview);
    const imgB = $('[data-preview-b]', preview);
    const caption = $('[data-preview-caption]', preview);
    // Two stacked images crossfade. Each hover gets a token, so a slow image that
    // finishes loading after the pointer has moved on can never hide the visible one.
    let front = imgA;
    let current = '';
    let token = 0;
    const show = (a) => {
      const src = a.dataset.peekSrc;
      caption.textContent = a.querySelector('.occasion__label').textContent;
      $$('.occasion a', list).forEach((x) => x.classList.toggle('is-active', x === a));
      if (src === current) return;
      current = src;
      const mine = ++token;
      if (front.getAttribute('src') === src) {
        front.classList.remove('is-hidden');
        (front === imgA ? imgB : imgA).classList.add('is-hidden');
        return;
      }
      const back = front === imgA ? imgB : imgA;
      back.src = src;
      const swap = () => {
        if (mine !== token) return;
        back.classList.remove('is-hidden');
        front.classList.add('is-hidden');
        front = back;
      };
      if (back.decode) back.decode().then(swap, swap); else if (back.complete) swap(); else back.onload = swap;
    };
    const links = $$('.occasion a', list);
    // Warm the cache so the first hover on every row is instant.
    links.forEach((a) => { const im = new Image(); im.src = a.dataset.peekSrc; });
    if (links[0]) {
      imgA.src = links[0].dataset.peekSrc;
      imgB.classList.add('is-hidden');
      imgA.classList.remove('is-hidden');
      current = links[0].dataset.peekSrc;
      show(links[0]);
    }
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

  /* ---------- Mega menus (desktop) ---------- */

  // One panel at a time. Moving between triggers swaps panels instantly;
  // leaving the header closes after a short grace period.
  const megas = $$('[data-mega]').map((item) => ({
    item, trigger: $('[data-mega-trigger]', item), panel: $('[data-mega-panel]', item), byHover: false
  }));
  let megaOpen = null;
  let megaOpenTimer; let megaCloseTimer;

  function openMega(m, byHover = false) {
    clearTimeout(megaCloseTimer);
    if (megaOpen === m) return;
    const switching = !!megaOpen;
    if (megaOpen) hideMega(megaOpen, true);
    megaOpen = m;
    m.byHover = byHover;
    m.panel.hidden = false;
    m.panel.classList.toggle('is-switch', switching);
    m.trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => m.panel.classList.add('is-open'));
  }
  function hideMega(m, instant) {
    m.panel.classList.remove('is-open');
    m.trigger.setAttribute('aria-expanded', 'false');
    if (instant) { m.panel.hidden = true; return; }
    setTimeout(() => { if (!m.panel.classList.contains('is-open')) m.panel.hidden = true; }, 200);
  }
  function closeMega() {
    clearTimeout(megaOpenTimer);
    if (!megaOpen) return;
    hideMega(megaOpen, false);
    megaOpen = null;
  }

  function wireMega() {
    megas.forEach((m) => {
      m.trigger.addEventListener('click', () => {
        if (megaOpen === m && !m.byHover) closeMega();
        else if (megaOpen === m) m.byHover = false;
        else openMega(m);
      });
      if (!canHover) return;
      m.item.addEventListener('pointerenter', () => {
        clearTimeout(megaCloseTimer);
        clearTimeout(megaOpenTimer);
        megaOpenTimer = setTimeout(() => openMega(m, true), megaOpen ? 40 : 110);
      });
      m.item.addEventListener('pointerleave', () => {
        clearTimeout(megaOpenTimer);
        megaCloseTimer = setTimeout(closeMega, 240);
      });
    });
    document.addEventListener('focusin', (e) => {
      if (megaOpen && !megaOpen.item.contains(e.target)) closeMega();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && megaOpen) { const tr = megaOpen.trigger; closeMega(); tr.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (megaOpen && !e.target.closest('[data-mega]')) closeMega();
      if (megaOpen && e.target.closest('[data-mega-panel] a')) closeMega();
    });
  }

  /* ---------- Search ---------- */

  const searchRoot = $('[data-search]');
  const searchInput = $('[data-search-input]');
  let searchReturn = null;

  function resultHTML(p) {
    return `
      <li>
        <button type="button" class="search-hit" data-product="${p.id}">
          <img src="${p.img}" alt="" width="600" height="630" loading="lazy">
          <span class="search-hit__text">
            <span class="search-hit__name">${esc(p.name)}</span>
            <span class="search-hit__meta">${esc(p.flowers)}</span>
            <span class="search-hit__price">החל מ־${price(p.prices[0])}</span>
          </span>
        </button>
      </li>`;
  }

  function runSearch() {
    const q = searchInput.value.trim();
    const results = q ? searchProducts(q) : [];
    const list = $('[data-search-results]');
    const count = $('[data-search-count]');
    const all = $('[data-search-all]');
    $('[data-search-suggest]').hidden = !!q;
    if (!q) { list.innerHTML = ''; count.textContent = ''; all.hidden = true; return; }
    if (!results.length) {
      list.innerHTML = '';
      count.innerHTML = `לא מצאנו זר שמתאים ל"${esc(q)}". <a href="index.html#personal" data-close-search-link>ספרו לנו מה אתם מחפשים</a>, והשוזר ירכיב זר בשבילכם.`;
      all.hidden = true;
      return;
    }
    count.textContent = results.length === 1 ? 'נמצא פריט אחד' : `נמצאו ${results.length} פריטים`;
    list.innerHTML = results.slice(0, 6).map(resultHTML).join('');
    all.hidden = false;
    all.href = `catalog.html?q=${encodeURIComponent(q)}`;
    all.innerHTML = `${results.length > 6 ? `לכל ${results.length} התוצאות` : 'לתוצאות בקטלוג'} <svg class="icon icon--sm" aria-hidden="true"><use href="#i-arrow-left"/></svg>`;
  }

  function openSearch() {
    closeMega();
    if (!$$('[data-drawer]').every((d) => d.hidden)) closeDrawers(true);
    searchReturn = document.activeElement;
    searchRoot.hidden = false;
    document.body.classList.add('is-locked');
    $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    requestAnimationFrame(() => searchRoot.classList.add('is-open'));
    setTimeout(() => { searchInput.focus(); searchInput.select(); }, 30);
  }

  function closeSearch(keepFocus) {
    if (searchRoot.hidden) return;
    searchRoot.classList.remove('is-open');
    $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('is-locked');
    setTimeout(() => { searchRoot.hidden = true; }, 220);
    if (!keepFocus && searchReturn && document.contains(searchReturn)) searchReturn.focus({ preventScroll: true });
  }

  function wireSearch() {
    $$('[data-open-search]').forEach((b) => b.addEventListener('click', openSearch));
    searchRoot.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-search]')) closeSearch();
      if (e.target.closest('[data-close-search-link]')) closeSearch(true);
      const term = e.target.closest('[data-search-term]');
      if (term) { searchInput.value = term.dataset.searchTerm; runSearch(); searchInput.focus(); }
    });
    searchInput.addEventListener('input', runSearch);
    $('[data-search-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) return;
      if (page === 'catalog') {
        Object.assign(filter, { occasion: null, color: '', budget: '', q });
        closeSearch(true);
        applyFilter();
        $('[data-toolbar]').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      } else {
        location.href = `catalog.html?q=${encodeURIComponent(q)}`;
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !searchRoot.hidden) { closeSearch(); return; }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if (e.key === '/' && !typing && searchRoot.hidden && !qv.open) { e.preventDefault(); openSearch(); }
      if (!searchRoot.hidden && e.key === 'Tab') {
        const items = $$('button, a[href], input', $('.search__panel', searchRoot)).filter((el) => el.offsetParent !== null);
        const first = items[0]; const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Promo strip + coupon ---------- */

  let coupon = store.get('pv-coupon', '');
  const couponValid = (code) => String(code).trim().toUpperCase() === COUPON.code;
  const discountFor = (subtotal) => (coupon && subtotal >= COUPON.min ? Math.round(subtotal * COUPON.percent / 100) : 0);

  function applyCoupon(code) {
    coupon = couponValid(code) ? COUPON.code : '';
    store.set('pv-coupon', coupon);
    return !!coupon;
  }

  function wirePromo() {
    const bar = $('[data-promo]');
    if (!bar) return;
    $('[data-promo-close]', bar).addEventListener('click', () => {
      bar.classList.add('is-closing');
      try { localStorage.setItem('pv-promo-closed', '1'); } catch (e) { /* private mode */ }
      setTimeout(() => { document.documentElement.classList.add('promo-closed'); }, 260);
    });
    $('[data-copy-code]', bar).addEventListener('click', async () => {
      applyCoupon(COUPON.code);
      let copied = false;
      try { await navigator.clipboard.writeText(COUPON.code); copied = true; } catch (e) { /* no clipboard */ }
      toast(copied ? `הקוד ${COUPON.code} הועתק והופעל בסל` : `הקוד ${COUPON.code} הופעל בסל`, { label: 'לסל', run: () => { renderBag(); openDrawer('bag'); } });
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

  const couponLine = (subtotal) => {
    const off = discountFor(subtotal);
    return off ? `קוד קופון: ${COUPON.code} (${COUPON.percent}% בהזמנה ראשונה מהאתר), הנחה של ${price(off)}.` : '';
  };

  function bagMessage() {
    const subtotal = bag.reduce((s, i) => s + unitPrice(i) * i.qty, 0);
    const off = discountFor(subtotal);
    return [
      'שלום, אשמח להזמין מהאתר:',
      ...bag.map((i, n) => `${n + 1}. ${itemLine(i)}`),
      couponLine(subtotal),
      `סה"כ לפי האתר: ${price(subtotal - off)}${off ? ' אחרי ההנחה' : ''}, לפני משלוח.`,
      'אשמח לאישור ולתיאום התשלום. תודה!'
    ].filter(Boolean).join('\n');
  }

  function couponHTML(subtotal) {
    const off = discountFor(subtotal);
    if (coupon) {
      const missing = COUPON.min - subtotal;
      return `
        <div class="coupon coupon--on">
          <p class="coupon__row"><span><svg class="icon icon--sm" aria-hidden="true"><use href="#i-tag"/></svg> קופון <bdi dir="ltr">${COUPON.code}</bdi></span>${off ? `<strong>הנחה של ${price(off)}</strong>` : ''}<button type="button" data-coupon-remove>הסרה</button></p>
          <p class="coupon__help">${off ? `${COUPON.percent}% הנחה בהזמנה הראשונה מהאתר. נאשר את ההנחה כשנחזור אליכם.` : `ההנחה חלה בהזמנה מעל ${price(COUPON.min)}. חסרים עוד ${price(missing)}.`}</p>
        </div>`;
    }
    return `
      <form class="coupon" data-coupon-form novalidate>
        <label class="visually-hidden" for="coupon-input">קוד קופון</label>
        <input id="coupon-input" name="code" type="text" placeholder="יש לכם קוד קופון?" autocomplete="off" autocapitalize="characters" dir="auto">
        <button class="btn btn--ghost" type="submit">הפעלה</button>
        <p class="coupon__error" data-coupon-error role="alert" hidden>הקוד לא מוכר. נסו שוב או כתבו לנו.</p>
      </form>`;
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
    const off = discountFor(total);
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
        ${couponHTML(total)}
        ${off ? `<p class="bag__sub"><span>לפני ההנחה</span><s>${price(total)}</s></p>` : ''}
        <p class="bag__total"><span>סה"כ</span><strong>${price(total - off)}</strong></p>
        <p class="bag__fine">לפני דמי משלוח. אין תשלום באתר: ההזמנה נשלחת אלינו בוואטסאפ, ואנחנו חוזרים אליכם לאישור ולתיאום התשלום.</p>
        <a class="btn btn--primary btn--block" href="${waUrl(bagMessage())}" target="_blank" rel="noopener">
          <svg class="icon" aria-hidden="true"><use href="#i-whatsapp-logo"/></svg>
          שליחת ההזמנה בוואטסאפ
        </a>
      </div>`;
  }

  function wireBag() {
    $('[data-bag]').addEventListener('submit', (e) => {
      const form = e.target.closest('[data-coupon-form]');
      if (!form) return;
      e.preventDefault();
      if (applyCoupon(form.code.value)) { renderBag(); $('[data-coupon-remove]').focus(); }
      else { $('[data-coupon-error]', form).hidden = false; form.code.focus(); }
    });
    $('[data-bag]').addEventListener('click', (e) => {
      if (e.target.closest('[data-coupon-remove]')) { applyCoupon(''); renderBag(); return; }
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
    const sum = unitPrice(qvItem());
    const off = discountFor(sum);
    $('[data-qv-total]', qv).innerHTML = off
      ? `<s>${price(sum)}</s> ${price(sum - off)} <small>עם הקופון</small>`
      : price(sum);
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
      const item = qvItem();
      const extra = couponLine(unitPrice(item));
      const text = `שלום, אשמח להזמין מהאתר:\n${itemLine(item)}${extra ? `\n${extra}` : ''}\nאשמח לאישור ולתיאום התשלום. תודה!`;
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

    const FOR = { birthday: 'ליום הולדת', love: 'ליום נישואין או כמחווה רומנטית', thanks: 'כתודה', baby: 'ללידה', wedding: 'לחתונה או לאירוסין' };
    const preselect = (key) => {
      const input = FOR[key] && form.querySelector(`input[name="occasion"][value="${FOR[key]}"]`);
      if (!input) return;
      input.checked = true;
      error.hidden = true;
      render();
      const chip = input.closest('.chip');
      chip.classList.remove('is-flash');
      void chip.offsetWidth;
      chip.classList.add('is-flash');
    };
    preselect(new URLSearchParams(location.search).get('for'));
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-builder-occasion]');
      if (!link) return;
      e.preventDefault();
      closeMega();
      closeDrawers();
      preselect(link.dataset.builderOccasion);
      history.replaceState(null, '', `?for=${link.dataset.builderOccasion}#personal`);
      setTimeout(() => $('#personal').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }), 60);
    });

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

  /* ---------- Recommended: three layouts (the home page uses one; sketches.html shows all) ---------- */

  const sparkle = '<svg class="icon icon--sm" aria-hidden="true"><use href="#i-sparkle"/></svg>';

  function picksEditorial(list) {
    const [lead, ...rest] = list;
    return `
      <div class="picks-ed">
        <button type="button" class="pick-lead" data-product="${lead.id}" aria-label="${esc(lead.name)}, החל מ־${price(lead.prices[0])}. לפרטים ולהזמנה">
          <span class="pick-lead__media"><img src="${lead.img}" alt="" loading="lazy" width="600" height="630"></span>
          <span class="pick-lead__body">
            <span class="pick-badge">${sparkle}הבחירה של השבוע</span>
            <span class="pick-lead__name">${esc(lead.name)}</span>
            <span class="pick-lead__note">${esc(lead.note)}</span>
            <span class="pick-lead__flowers">${esc(lead.flowers)}</span>
            <span class="pick-lead__foot"><span class="pick-lead__price">החל מ־${price(lead.prices[0])}</span><span class="pick-lead__cta">לפרטים ולהזמנה <svg class="icon icon--sm" aria-hidden="true"><use href="#i-arrow-left"/></svg></span></span>
          </span>
        </button>
        <ul class="pick-rows">
          ${rest.map((p) => `
          <li>
            <button type="button" class="pick-row" data-product="${p.id}" aria-label="${esc(p.name)}, החל מ־${price(p.prices[0])}. לפרטים ולהזמנה">
              <img src="${p.img}" alt="" loading="lazy" width="600" height="630">
              <span class="pick-row__text">
                <span class="pick-row__name">${esc(p.name)}</span>
                <span class="pick-row__note">${esc(p.note)}</span>
                <span class="pick-row__price">החל מ־${price(p.prices[0])}</span>
              </span>
              <svg class="icon pick-row__arrow" aria-hidden="true"><use href="#i-arrow-left"/></svg>
            </button>
          </li>`).join('')}
        </ul>
      </div>`;
  }

  function picksRow(list) {
    return `
      <ul class="picks-row">
        ${list.map((p, i) => `
        <li class="picks-row__item" style="--i:${i}">
          <button type="button" class="pick-card" data-product="${p.id}" aria-label="${esc(p.name)}, החל מ־${price(p.prices[0])}. לפרטים ולהזמנה">
            <span class="pick-card__media">
              <img src="${p.img}" alt="" loading="lazy" width="600" height="630">
              <span class="pick-card__num" aria-hidden="true">0${i + 1}</span>
            </span>
            <span class="pick-card__name">${esc(p.name)}</span>
            <span class="pick-card__note">${esc(p.note)}</span>
            <span class="pick-card__price">החל מ־${price(p.prices[0])}</span>
          </button>
        </li>`).join('')}
      </ul>`;
  }

  const TABS = [
    { id: 'picks', label: 'מומלצים', test: (p) => p.pick },
    { id: 'low', label: 'עד ₪200', test: (p) => p.prices[0] <= 200 && !p.quiet },
    { id: 'shabbat', label: 'לשבת ולחג', test: (p) => p.occasions.includes('shabbat') || p.colors.includes('white') && !p.quiet },
    { id: 'plants', label: 'עציצים', test: (p) => p.occasions.includes('plants') }
  ];

  function picksTabs(root) {
    const draw = (id) => {
      const tab = TABS.find((x) => x.id === id);
      $('[data-tab-grid]', root).innerHTML = ordered(PRODUCTS.filter(tab.test)).slice(0, 5).map(cardHTML).join('');
      $$('[role="tab"]', root).forEach((b) => {
        const on = b.dataset.tab === id;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
    };
    root.innerHTML = `
      <div class="picks-tabs">
        <div class="picks-tabs__bar" role="tablist" aria-label="בחירה מהירה">
          ${TABS.map((x) => `<button type="button" role="tab" class="picks-tabs__tab" data-tab="${x.id}">${x.id === 'picks' ? sparkle : ''}${x.label}</button>`).join('')}
        </div>
        <div role="tabpanel"><ul class="product-grid" data-tab-grid></ul></div>
      </div>`;
    const bar = $('[role="tablist"]', root);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[role="tab"]');
      if (!b) return;
      const run = () => draw(b.dataset.tab);
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(run); else run();
    });
    bar.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const tabs = $$('[role="tab"]', bar);
      const i = tabs.indexOf(document.activeElement);
      const next = tabs[(i + (e.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus(); next.click();
    });
    draw('picks');
  }

  function renderPicks() {
    const list = picksList();
    $$('[data-picks]').forEach((root) => {
      const kind = root.dataset.picks;
      if (kind === 'editorial') root.innerHTML = picksEditorial(list);
      else if (kind === 'row') root.innerHTML = picksRow(list);
      else if (kind === 'tabs') picksTabs(root);
    });
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
    $$('.section-head, .picks-ed, .picks-row, .picks-tabs, .personal__media, .personal__body, .occasion-list, .about__media, .about__body, .reviews, .gift-row, .shop__main, .shop__delivery, .faq__inner')
      .forEach((el) => { el.setAttribute('data-reveal', ''); io.observe(el); });
  }

  /* ---------- Boot ---------- */

  renderStatus();
  setInterval(renderStatus, 60 * 1000);
  fillSelects();
  wireWhatsAppLinks();
  occasionLinks();
  renderGrid();
  renderPicks();
  renderOccasions();
  renderAbout();
  wireCatalog();
  wireMega();
  wireSearch();
  wirePromo();
  wireDrawers();
  wireBag();
  wireQuickView();
  wireBuilder();
  wireCounters();
  wireScrollState();
})();

/* Stay Clean: comportamento da página (sem dependências) */
(() => {
  'use strict';

  const root = document.documentElement;

  /* ---------------------------------------------------------------------
     Horário de funcionamento (fuso de Curitiba), igual ao perfil no Google.
     Se mudar, altere aqui e na tabela .hours + rodapé do index.html.
     Minutos desde 00:00; null = fechado.
     ------------------------------------------------------------------- */
  const SCHEDULE = {
    0: null, // domingo
    1: [9 * 60, 18 * 60],
    2: [9 * 60, 18 * 60],
    3: [9 * 60, 18 * 60],
    4: [9 * 60, 18 * 60],
    5: [9 * 60, 18 * 60],
    6: [9 * 60, 13 * 60], // sábado
  };
  const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const CLOSING_SOON_MIN = 30;

  const clock = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });

  function nowInCuritiba() {
    const parts = {};
    for (const part of clock.formatToParts(new Date())) parts[part.type] = part.value;
    return {
      day: WEEKDAYS.indexOf(parts.weekday),
      minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
    };
  }

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  };

  function getStatus({ day, minutes }) {
    const today = SCHEDULE[day];
    if (today && minutes >= today[0] && minutes < today[1]) {
      const left = today[1] - minutes;
      if (left <= CLOSING_SOON_MIN) {
        return { state: 'closing', text: `Fecha em ${left} min · até ${formatTime(today[1])}` };
      }
      return { state: 'open', text: `Aberto agora · até ${formatTime(today[1])}` };
    }
    if (today && minutes < today[0]) {
      return { state: 'closed', text: `Fechado · abre hoje às ${formatTime(today[0])}` };
    }
    for (let i = 1; i <= 7; i++) {
      const next = (day + i) % 7;
      if (SCHEDULE[next]) {
        const when = i === 1 ? 'amanhã' : DAY_NAMES[next];
        return { state: 'closed', text: `Fechado · abre ${when} às ${formatTime(SCHEDULE[next][0])}` };
      }
    }
    return { state: 'closed', text: 'Fechado' };
  }

  function renderStatus() {
    const now = nowInCuritiba();
    const { state, text } = getStatus(now);
    document.querySelectorAll('[data-status]').forEach((el) => {
      el.dataset.state = state;
      const label = el.querySelector('[data-status-text]');
      if (label) label.textContent = text;
    });
    document.querySelectorAll('.hours tr[data-day]').forEach((row) => {
      if (Number(row.dataset.day) === now.day) row.setAttribute('aria-current', 'date');
      else row.removeAttribute('aria-current');
    });
  }

  renderStatus();
  (function scheduleTick() {
    setTimeout(() => {
      renderStatus();
      scheduleTick();
    }, 60000 - (Date.now() % 60000) + 50);
  })();

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Entrada do hero: só depois que a foto decodificou ------------------ */
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('[data-hero-img]');
  if (hero) {
    hero.querySelectorAll('.hero__text > *').forEach((el, i) => el.style.setProperty('--i', String(i)));
    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      hero.classList.add('is-ready');
    };
    const nextFrame = () => requestAnimationFrame(() => requestAnimationFrame(show));
    if (heroImg && typeof heroImg.decode === 'function') heroImg.decode().then(nextFrame, nextFrame);
    else nextFrame();
    // Nunca deixa o hero invisível se a rede travar
    setTimeout(show, 2500);
  }

  const hasIO = 'IntersectionObserver' in window;

  /* Header: sombra só quando há conteúdo rolando por baixo ------------- */
  const header = document.querySelector('[data-header]');
  if (header && hasIO) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none;';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      header.classList.toggle('is-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  /* Revelação ao rolar (uma vez só) ------------------------------------ */
  document.querySelectorAll('.cards').forEach((list) => {
    [...list.children].forEach((el, i) => el.style.setProperty('--d', String(i % 3)));
  });
  document.querySelectorAll('.gallery').forEach((list) => {
    [...list.children].forEach((el, i) => el.style.setProperty('--d', String(i % 4)));
  });
  const revealEls = document.querySelectorAll('.reveal');
  if (hasIO) {
    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          revealer.unobserve(el);
          el.classList.add('is-visible');
          // Depois da entrada, devolve as transições normais (hover, toque)
          const delay = (parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0) * 70;
          setTimeout(() => el.classList.remove('reveal', 'is-visible'), 800 + delay);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.remove('reveal'));
  }

  /* Link ativo do menu conforme a seção na tela ------------------------ */
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  if (navLinks.length && hasIO) {
    const targets = navLinks
      .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    // Seções sem link no menu limpam o destaque quando passam pelo meio da tela
    document.querySelectorAll('#inicio, #busca, #trabalhos').forEach((el) => targets.push(el));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => {
            if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    targets.forEach((t) => spy.observe(t));
  }

  /* Menu mobile (popover) ---------------------------------------------- */
  const menu = document.querySelector('[data-menu]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const supportsPopover = Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover');
  if (menu && menuBtn) {
    const isOpen = () => (supportsPopover ? menu.matches(':popover-open') : menu.classList.contains('is-open'));
    const sync = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      root.classList.toggle('is-locked', open);
    };
    const close = () => {
      if (!isOpen()) return;
      if (supportsPopover) menu.hidePopover();
      else {
        menu.classList.remove('is-open');
        sync(false);
      }
    };
    if (supportsPopover) {
      menu.addEventListener('toggle', (event) => sync(event.newState === 'open'));
    } else {
      menuBtn.addEventListener('click', () => {
        const open = !isOpen();
        menu.classList.toggle('is-open', open);
        sync(open);
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
    }
    // Toque no fundo escurecido ou num link fecha
    menu.addEventListener('click', (event) => {
      if (event.target === menu || event.target.closest('.menu__list a')) close();
    });
  }

  /* Botão do WhatsApp aparece quando os botões do hero saem da tela ---- */
  const fab = document.querySelector('[data-fab]');
  const heroActions = document.querySelector('.hero__actions');
  if (fab && heroActions && hasIO) {
    new IntersectionObserver(([entry]) => {
      fab.classList.toggle('is-visible', !entry.isIntersecting);
    }).observe(heroActions);
  } else if (fab) {
    fab.classList.add('is-visible');
  }

  /* Copiar endereço ---------------------------------------------------- */
  const copyStatus = document.querySelector('[data-copy-status]');
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    let timer;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;opacity:0;';
        document.body.append(area);
        area.select();
        ok = document.execCommand('copy');
        area.remove();
      }
      if (!ok) return;
      btn.classList.add('is-copied');
      if (copyStatus) copyStatus.textContent = 'Endereço copiado';
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove('is-copied');
        if (copyStatus) copyStatus.textContent = '';
      }, 2200);
    });
  });
})();

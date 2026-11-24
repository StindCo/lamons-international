(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Header : transparent sur le hero, solide ensuite, masqué en descendant */
  const hdr = $('#hdr');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('solid', y > 40);
    hdr.classList.toggle('hide', y > 600 && y > lastY && !$('#nav').classList.contains('open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const burger = $('#burger'), nav = $('#nav');
  const toggleNav = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', () => toggleNav(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => toggleNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleNav(false); });
  matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) toggleNav(false); });

  /* Lien actif selon la section visible */
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const t = $(l.getAttribute('href')); if (t) spy.observe(t); });

  /* Onglets métiers (clavier : flèches gauche/droite) */
  const tabs = $$('.tabs [role="tab"]');
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      select(n); n.focus();
    });
  });

  /* Apparition au défilement */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Compteurs animés */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n, sep) => sep ? n.toLocaleString('fr-FR').replace(/ | /g, ' ') : String(n);
  const counter = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, sep = el.hasAttribute('data-sep');
      counter.unobserve(el);
      if (reduce || end === 2014) return;
      const t0 = performance.now(), dur = 1400;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(end * e), sep);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => counter.observe(el));

  /* Formulaire : validation + ouverture de la messagerie pré-remplie */
  const form = $('#form'), note = $('#formNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad && ok) { f.focus(); ok = false; }
    });
    if (!ok) { note.textContent = 'Merci de compléter les champs requis.'; return; }
    const d = Object.fromEntries(new FormData(form));
    const body = `Nom : ${d.nom}\nSociété : ${d.societe || '-'}\nE-mail : ${d.email}\nTéléphone : ${d.tel || '-'}\nService : ${d.service}\n\n${d.message}`;
    location.href = `mailto:contact@lamonsint.com?subject=${encodeURIComponent('Demande d\'offre — ' + d.service)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Merci ! Votre messagerie s\'ouvre avec la demande pré-remplie.';
  });
  $$('[required]', form).forEach(f => f.addEventListener('input', () => f.classList.remove('invalid')));
})();

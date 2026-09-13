const navLinks = document.querySelectorAll('[data-nav]');
const panels = document.querySelectorAll('.panel');
const canvasImages = document.querySelectorAll('.canvas-image');
const canvasContexts = document.querySelectorAll('.canvas-context');
const aboutContext = document.querySelector('[data-context="about"]');
let currentPanel = 'about';
let currentSlide = -1;

function switchPanel(target) {
   if (target === currentPanel) return;
   currentPanel = target;
   currentSlide = -1;

   navLinks.forEach(link => {
      link.classList.toggle('nav-active', link.dataset.nav === target);
   });

   panels.forEach(panel => {
      panel.classList.toggle('panel-active', panel.id === 'panel-' + target);
   });

   canvasImages.forEach(img => img.classList.remove('visible'));
   canvasContexts.forEach(ctx => ctx.classList.remove('visible'));

   const contextImg = document.querySelector('[data-context="' + target + '"]');
   if (contextImg) {
      setTimeout(() => contextImg.classList.add('visible'), 80);
   }
}

navLinks.forEach(link => {
   link.addEventListener('click', (e) => {
      if (link.dataset.nav === currentPanel) {
         e.preventDefault();
         return;
      }
      e.preventDefault();
      switchPanel(link.dataset.nav);
   });
});

// ── Work: hover preview (lives on the About / home panel) ──
const projectItems = document.querySelectorAll('.project-item');
const projectList = document.getElementById('projectList');

function showSlide(idx) {
   if (aboutContext) aboutContext.classList.remove('visible');
   canvasImages.forEach(slide => {
      slide.classList.toggle('visible', parseInt(slide.dataset.slide, 10) === idx);
   });
}

function clearSlides() {
   currentSlide = -1;
   canvasImages.forEach(s => s.classList.remove('visible'));
   projectItems.forEach(i => i.classList.remove('active'));
   if (aboutContext) aboutContext.classList.add('visible');
}

projectItems.forEach(item => {
   item.addEventListener('mouseenter', () => {
      if (currentPanel !== 'about') return;
      const idx = parseInt(item.dataset.index, 10);
      if (idx === currentSlide) return;
      currentSlide = idx;
      showSlide(idx);
   });
});

projectList.addEventListener('mouseleave', () => {
   if (currentPanel !== 'about') return;
   clearSlides();
});

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
   projectItems.forEach(item => {
      item.addEventListener('click', (e) => {
         if (currentPanel !== 'about') return;
         const idx = parseInt(item.dataset.index, 10);
         if (item.classList.contains('active')) return; // already previewed — let the link through

         e.preventDefault();
         currentSlide = idx;
         projectItems.forEach(i => i.classList.remove('active'));
         item.classList.add('active');
         showSlide(idx);
      });
   });
}

// Set this to your Formspree endpoint: https://formspree.io/f/<your-form-id>
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeaqbgbo';

(function () {
   const form = document.getElementById('contactForm');
   if (!form) return;
   const status = document.getElementById('formStatus');
   const button = form.querySelector('.form-submit');
   const label = button.textContent;

   const setStatus = (msg, state) => {
      status.textContent = msg;
      status.className = 'form-status' + (state ? ' form-status-' + state : '');
   };

   form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
         setStatus('Please fill in every field with a valid email.', 'error');
         form.reportValidity();
         return;
      }

      if (FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
         setStatus('Form is not connected yet. Reach me on GitHub instead.', 'error');
         return;
      }

      button.disabled = true;
      button.textContent = 'Sending…';
      setStatus('', null);

      try {
         const res = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
         });

         if (res.ok) {
            form.reset();
            setStatus('Thanks, your message is on its way.', 'success');
         } else {
            const data = await res.json().catch(() => null);
            const detail = data && data.errors ? data.errors.map(x => x.message).join(', ') : null;
            setStatus(detail || 'Something went wrong. Please reach me on GitHub instead.', 'error');
         }
      } catch (err) {
         setStatus('Network error. Please reach me on GitHub instead.', 'error');
      } finally {
         button.disabled = false;
         button.textContent = label;
      }
   });
})();

// A k-nearest-neighbour proximity graph, with Prim's algorithm growing a
// minimum spanning forest across it. Ink on paper, no image assets.
(function () {
   const canvas = document.getElementById('netCanvas');
   if (!canvas || !canvas.getContext) return;

   const ctx = canvas.getContext('2d');
   const host = canvas.closest('.canvas-context');
   const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   const INK = '26, 26, 26';
   const ACCENT = '196, 85, 58';

   const STEP = 0.085;   // seconds between MST edge additions
   const GROW = 0.28;    // seconds an edge takes to draw itself in
   const HOLD = 4.5;     // seconds of packet flow once the forest is complete

   let W = 0, H = 0;
   let nodes = [], edges = [], adj = [];
   let inTree = [], treeEdges = [], frontier = new Set(), packets = [];
   let phase = 'grow', timer = 0, hold = 0, spawn = 0;
   let raf = null, last = 0;

   // Seeded PRNG so every reload composes the same way rather than looking noisy.
   let seed;
   const rnd = () => {
      seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
      return ((seed >>> 0) % 100000) / 100000;
   };

   function build() {
      seed = 0x2f6b4f;
      nodes = []; edges = []; adj = [];
      if (W < 40 || H < 40) return;

      const cell = Math.max(58, Math.min(96, Math.sqrt((W * H) / 42)));
      const cols = Math.max(3, Math.round(W / cell));
      const rows = Math.max(3, Math.round(H / cell));
      const mx = W / cols, my = H / rows;

      for (let r = 0; r < rows; r++) {
         for (let c = 0; c < cols; c++) {
            if (rnd() < 0.12) continue;            // a few gaps keep it organic
            nodes.push({
               x: mx * (c + 0.5) + (rnd() - 0.5) * mx * 0.5,
               y: my * (r + 0.5) + (rnd() - 0.5) * my * 0.5,
               r: 1.9 + rnd() * 1.5,
               phase: rnd() * Math.PI * 2,
               pulse: 0
            });
         }
      }

      // k-nearest-neighbour edges, deduped, with a length cap
      const seen = new Set();
      nodes.forEach((n, i) => {
         nodes
            .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
            .filter(o => o.j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, 3)
            .forEach(o => {
               if (o.d > cell * 1.55) return;
               const key = i < o.j ? i + ':' + o.j : o.j + ':' + i;
               if (seen.has(key)) return;
               seen.add(key);
               edges.push({ a: i, b: o.j, w: o.d });
            });
      });

      adj = nodes.map(() => []);
      edges.forEach((e, i) => { adj[e.a].push(i); adj[e.b].push(i); });

      restart();
   }

   function restart() {
      inTree = nodes.map(() => false);
      treeEdges = []; frontier = new Set(); packets = [];
      phase = 'grow'; timer = 0; hold = 0;
      nodes.forEach(n => { n.pulse = 0; });
      if (nodes.length) addRoot();
   }

   function addRoot() {
      // seed a new component: the first node not yet spanned
      const i = inTree.findIndex(v => !v);
      if (i < 0) return false;
      inTree[i] = true;
      nodes[i].pulse = 1;
      adj[i].forEach(ei => frontier.add(ei));
      return true;
   }

   // One Prim step: take the lightest edge crossing the cut.
   function primStep() {
      let best = -1, bestW = Infinity;
      for (const ei of frontier) {
         const e = edges[ei];
         if (inTree[e.a] === inTree[e.b]) { frontier.delete(ei); continue; }  // no longer crosses
         if (e.w < bestW) { bestW = e.w; best = ei; }
      }

      if (best < 0) return addRoot();          // component done → next component

      const e = edges[best];
      const fresh = inTree[e.a] ? e.b : e.a;
      inTree[fresh] = true;
      nodes[fresh].pulse = 1;
      frontier.delete(best);
      adj[fresh].forEach(ei => { if (inTree[edges[ei].a] !== inTree[edges[ei].b]) frontier.add(ei); });
      treeEdges.push({ a: e.a, b: e.b, from: inTree[e.a] ? e.a : e.b, t: 0 });
      return true;
   }

   function addPacket() {
      if (!treeEdges.length || packets.length > 16) return;
      const e = treeEdges[Math.floor(Math.random() * treeEdges.length)];
      const flip = Math.random() < 0.5;
      packets.push({ a: flip ? e.b : e.a, b: flip ? e.a : e.b, t: 0, speed: 0.18 + Math.random() * 0.22 });
   }

   function step(dt) {
      treeEdges.forEach(e => { if (e.t < 1) e.t = Math.min(1, e.t + dt / GROW); });
      nodes.forEach(n => { n.pulse = Math.max(0, n.pulse - dt * 1.6); });

      if (phase === 'grow') {
         timer += dt;
         while (timer >= STEP) {
            timer -= STEP;
            if (!primStep()) { phase = 'flow'; hold = 0; break; }
         }
      } else {
         hold += dt;
         spawn -= dt;
         if (spawn <= 0) { addPacket(); spawn = 0.25 + Math.random() * 0.5; }
         for (let i = packets.length - 1; i >= 0; i--) {
            const p = packets[i];
            p.t += p.speed * dt;
            if (p.t >= 1) { nodes[p.b].pulse = 1; packets.splice(i, 1); }
         }
         if (hold > HOLD && !packets.length) restart();
      }
   }

   function draw(time) {
      ctx.clearRect(0, 0, W, H);
      const t = time / 1000;
      const px = n => n.x + (reduced ? 0 : Math.cos(t * 0.22 + n.phase) * 2.2);
      const py = n => n.y + (reduced ? 0 : Math.sin(t * 0.19 + n.phase) * 2.2);

      // the underlying graph, barely there
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + INK + ', 0.09)';
      ctx.beginPath();
      edges.forEach(e => {
         ctx.moveTo(px(nodes[e.a]), py(nodes[e.a]));
         ctx.lineTo(px(nodes[e.b]), py(nodes[e.b]));
      });
      ctx.stroke();

      // edges currently crossing the cut — the algorithm's working set
      if (phase === 'grow' && frontier.size) {
         ctx.strokeStyle = 'rgba(' + ACCENT + ', 0.22)';
         ctx.beginPath();
         frontier.forEach(ei => {
            const e = edges[ei];
            ctx.moveTo(px(nodes[e.a]), py(nodes[e.a]));
            ctx.lineTo(px(nodes[e.b]), py(nodes[e.b]));
         });
         ctx.stroke();
      }

      // the spanning tree itself, each edge drawing in from the settled end
      ctx.strokeStyle = 'rgba(' + INK + ', 0.5)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      treeEdges.forEach(e => {
         const s = e.from, o = e.a === s ? e.b : e.a;
         const sx = px(nodes[s]), sy = py(nodes[s]);
         const ox = px(nodes[o]), oy = py(nodes[o]);
         const k = e.t < 1 ? e.t * e.t * (3 - 2 * e.t) : 1;     // smoothstep
         ctx.moveTo(sx, sy);
         ctx.lineTo(sx + (ox - sx) * k, sy + (oy - sy) * k);
      });
      ctx.stroke();
      ctx.lineWidth = 1;

      nodes.forEach((n, i) => {
         const x = px(n), y = py(n);
         if (n.pulse > 0) {
            ctx.beginPath();
            ctx.arc(x, y, n.r + (1 - n.pulse) * 12, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(' + ACCENT + ', ' + (n.pulse * 0.5).toFixed(3) + ')';
            ctx.stroke();
         }
         ctx.beginPath();
         ctx.arc(x, y, inTree[i] ? n.r : n.r * 0.72, 0, Math.PI * 2);
         ctx.fillStyle = 'rgba(' + INK + ', ' + (inTree[i] ? 0.62 : 0.2) + ')';
         ctx.fill();
      });

      packets.forEach(p => {
         const a = nodes[p.a], b = nodes[p.b];
         const ax = px(a), ay = py(a), bx = px(b), by = py(b);
         const x = ax + (bx - ax) * p.t, y = ay + (by - ay) * p.t;
         const fade = Math.min(1, Math.sin(p.t * Math.PI) * 2.2);
         ctx.beginPath();
         ctx.arc(x, y, 2.6, 0, Math.PI * 2);
         ctx.fillStyle = 'rgba(' + ACCENT + ', ' + fade.toFixed(3) + ')';
         ctx.fill();
      });
   }

   function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduced) { while (primStep()) {} treeEdges.forEach(e => { e.t = 1; }); }
      draw(0);
   }

   function loop(time) {
      const dt = Math.min(0.05, (time - last) / 1000 || 0);
      last = time;
      step(dt);
      draw(time);
      raf = requestAnimationFrame(loop);
   }

   function play() { if (!raf && !reduced) { last = performance.now(); raf = requestAnimationFrame(loop); } }
   function pause() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

   new MutationObserver(() => {
      host.classList.contains('visible') ? play() : pause();
   }).observe(host, { attributes: true, attributeFilter: ['class'] });

   document.addEventListener('visibilitychange', () => {
      document.hidden ? pause() : (host.classList.contains('visible') && play());
   });

   if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
   else window.addEventListener('resize', resize);

   resize();
   if (host.classList.contains('visible')) play();
})();

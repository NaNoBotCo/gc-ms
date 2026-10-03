/* GC-MS · จีซี-เอ็มเอส — the moving parts of motdang.net/sites/gc-ms/
   Hero column, five stage drawings, the aroma race, the Thailand map.
   Each canvas runs only while it is on screen; reduced motion gets still frames. */
(function () {
  "use strict";
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DATA = window.GCMS || {};
  var H = document.documentElement;
  function lang() { return H.classList.contains("lang-en") ? "en" : "th"; }
  function css(n) { return getComputedStyle(H).getPropertyValue(n).trim() || "#888"; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function bi(th, en) {
    var s = el("span", "tx");
    s.appendChild(el("span", "th", th)).lang = "th";
    s.appendChild(el("span", "en", en)).lang = "en";
    return s;
  }
  var PAL = ["#22d3ee", "#f472b6", "#facc15", "#a3e635", "#fb923c", "#c084fc", "#38bdf8", "#f87171"];

  /* ---- canvas helper: sized to its box, DPR-sharp, paused off screen ---- */
  function stage(canvas, draw, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d"), w = 0, h = 0, on = false, t0 = 0, raf = 0, last = 0;
    function size() {
      var r = canvas.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * d); canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function frame(ts) {
      if (!on) return;
      if (!t0) t0 = ts;
      var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
      draw(ctx, w, h, (ts - t0) / 1000, dt);
      raf = requestAnimationFrame(frame);
    }
    size();
    window.addEventListener("resize", function () { size(); if (RM || !on) draw(ctx, w, h, opts.still || 6, 0); });
    if (RM) { draw(ctx, w, h, opts.still || 6, 0); return { redraw: function () { draw(ctx, w, h, opts.still || 6, 0); } }; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !on) { on = true; last = 0; raf = requestAnimationFrame(frame); }
        else if (!e.isIntersecting && on) { on = false; cancelAnimationFrame(raf); }
      });
    }, { rootMargin: "80px" });
    io.observe(canvas);
    return { redraw: function () { if (!on) draw(ctx, w, h, opts.still || 6, 0); } };
  }

  /* ---- compounds: main EI ions (simplified) and a retention index on a 5%-phenyl column ---- */
  var C = DATA.compounds || {};
  var SAMPLES = DATA.samples || [];

  /* ================= HERO: a coiled column, molecules racing, peaks rising ================= */
  var hero = $("#hero-canvas");
  if (hero) {
    var hm = [], peaks = [], nextSpawn = 0, clock = 0;
    stage(hero, function (c, w, h, t, dt) {
      c.clearRect(0, 0, w, h);
      var cx = w * (w > 640 ? 0.27 : 0.5), cy = w > 640 ? h * 0.44 : h * 0.24, R = Math.min(w * 0.22, h * 0.32, 190), turns = 5, ry = R * 0.32;
      // the coil, back half first
      function coil(front) {
        c.beginPath();
        for (var i = 0; i <= 400; i++) {
          var a = (i / 400) * turns * Math.PI * 2, z = Math.sin(a);
          var x = cx + Math.cos(a) * R, y = cy - R * 0.55 + (i / 400) * R * 1.1 + z * ry;
          if ((z > 0) !== front) { c.moveTo(x, y); continue; }
          c.lineTo(x, y);
        }
        c.strokeStyle = front ? "rgba(125,211,252,.55)" : "rgba(125,211,252,.16)";
        c.lineWidth = front ? 2.2 : 1.4; c.stroke();
      }
      coil(false);
      // molecules
      if (RM) { hm = []; for (var k = 0; k < 14; k++) hm.push({ p: k / 14, v: 0, col: PAL[k % PAL.length] }); }
      else if (t > nextSpawn) {
        nextSpawn = t + 0.35 + Math.random() * 0.5;
        var idx = Math.floor(Math.random() * 6);
        hm.push({ p: 0, v: 0.05 + idx * 0.018, col: PAL[idx], id: idx });
      }
      clock += dt;
      for (var j = hm.length - 1; j >= 0; j--) {
        var m = hm[j]; m.p += m.v * dt;
        if (m.p >= 1) { peaks.push({ x: clock, col: m.col, a: 1 }); hm.splice(j, 1); continue; }
        var a = m.p * turns * Math.PI * 2, z = Math.sin(a);
        var x = cx + Math.cos(a) * R, y = cy - R * 0.55 + m.p * R * 1.1 + z * ry;
        c.beginPath(); c.arc(x, y, z > 0 ? 4.2 : 2.6, 0, 7);
        c.fillStyle = m.col; c.shadowColor = m.col; c.shadowBlur = z > 0 ? 14 : 4; c.fill(); c.shadowBlur = 0;
      }
      coil(true);
      // chromatogram strip
      var gx = 16, gw = w - 32, gy = h - 14, gh = 72;
      var span = 14;
      c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 1;
      c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx + gw, gy); c.stroke();
      c.beginPath();
      for (var px = 0; px <= gw; px += 2) {
        var tt = clock - span + (px / gw) * span, yv = 0;
        for (var q = 0; q < peaks.length; q++) {
          var d = (tt - peaks[q].x) / 0.16; if (d > -4 && d < 4) yv += Math.exp(-d * d / 2) * 0.55;
        }
        yv += Math.sin(tt * 37) * 0.004;
        var Y = gy - Math.min(1, yv) * gh;
        if (px === 0) c.moveTo(gx + px, Y); else c.lineTo(gx + px, Y);
      }
      c.strokeStyle = "#a5f3fc"; c.lineWidth = 1.8; c.shadowColor = "#22d3ee"; c.shadowBlur = 8; c.stroke(); c.shadowBlur = 0;
      peaks = peaks.filter(function (p) { return clock - p.x < span + 1; });
    }, { still: 30 });
  }

  /* ================= STAGE 1: injection ================= */
  var s1 = $("#st-inject");
  if (s1) stage(s1, function (c, w, h, t) {
    c.clearRect(0, 0, w, h);
    var cyc = (t % 4) / 4, ix = w * 0.62, iy = h * 0.5;
    // heated injector block
    var g = c.createLinearGradient(ix - 40, 0, ix + 40, 0);
    g.addColorStop(0, "#7c2d12"); g.addColorStop(0.5, "#f97316"); g.addColorStop(1, "#7c2d12");
    c.fillStyle = g; c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3); c.fillRect(ix - 40, iy - 34, 80, 68); c.globalAlpha = 1;
    c.strokeStyle = "#fdba74"; c.strokeRect(ix - 40, iy - 34, 80, 68);
    c.fillStyle = "#fdba74"; c.font = "600 12px system-ui"; c.textAlign = "center";
    c.fillText("250 °C", ix, iy + 52);
    // syringe
    var push = Math.min(1, cyc * 2.2), sx = w * 0.12;
    c.strokeStyle = "#e2e8f0"; c.lineWidth = 1.5;
    c.strokeRect(sx, iy - 9, w * 0.3, 18);
    c.fillStyle = "rgba(34,211,238,.5)"; c.fillRect(sx + w * 0.3 * push, iy - 7, w * 0.3 * (1 - push), 14);
    c.fillStyle = "#94a3b8"; c.fillRect(sx - 30 + w * 0.3 * push, iy - 3, 30, 6);
    c.fillRect(sx - 34 + w * 0.3 * push, iy - 14, 6, 28);
    c.beginPath(); c.moveTo(sx + w * 0.3, iy); c.lineTo(ix - 18, iy); c.strokeStyle = "#cbd5e1"; c.lineWidth = 1.2; c.stroke();
    // vapour puff
    if (cyc > 0.42) {
      var k = (cyc - 0.42) / 0.58;
      for (var i = 0; i < 46; i++) {
        var a = i * 2.39996, r = k * (10 + (i % 7) * 5);
        c.beginPath(); c.arc(ix - 10 + Math.cos(a) * r + k * 50, iy + Math.sin(a) * r * 0.7, 2.2, 0, 7);
        c.fillStyle = PAL[i % 5]; c.globalAlpha = 1 - k * 0.7; c.fill();
      }
      c.globalAlpha = 1;
    }
    // carrier gas arrows
    c.fillStyle = "#94a3b8"; c.font = "11px system-ui"; c.textAlign = "left";
    for (var j = 0; j < 3; j++) {
      var ax = ((t * 60 + j * 70) % (w * 0.3)) + ix + 46;
      c.fillText("He →", ax, iy - 44 + j * 4);
    }
  }, { still: 2.6 });

  /* ================= STAGE 2: the column, with an oven slider ================= */
  var s2 = $("#st-column"), oven = $("#oven"), ovenOut = $("#oven-out");
  if (s2) {
    var mols = [];
    for (var i = 0; i < 26; i++) mols.push({ x: Math.random(), k: i % 2, stuck: Math.random() < 0.5, tt: Math.random() });
    var temp = function () { return oven ? +oven.value : 150; };
    if (oven) oven.addEventListener("input", function () { if (ovenOut) ovenOut.textContent = oven.value + " °C"; });
    stage(s2, function (c, w, h, t, dt) {
      c.clearRect(0, 0, w, h);
      var top = h * 0.3, bot = h * 0.7, T = temp();
      // tube walls with the film inside
      c.fillStyle = "rgba(250,204,21,.18)";
      c.fillRect(0, top, w, 9); c.fillRect(0, bot - 9, w, 9);
      c.strokeStyle = "#cbd5e1"; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(0, top); c.lineTo(w, top); c.moveTo(0, bot); c.lineTo(w, bot); c.stroke();
      // oven glow follows the slider
      c.fillStyle = "rgba(249,115,22," + ((T - 40) / 900).toFixed(3) + ")"; c.fillRect(0, 0, w, h);
      var hot = (T - 40) / 260; // 0..1
      mols.forEach(function (m) {
        // k=0 lighter/less sticky (pink), k=1 heavier/stickier (amber)
        var release = m.k === 0 ? 0.6 + hot * 2.4 : 0.15 + hot * 1.8;
        var grab = m.k === 0 ? 1.0 : 2.4;
        if (dt) {
          if (m.stuck) { if (Math.random() < release * dt) m.stuck = false; }
          else { m.x += dt * 0.32; if (Math.random() < grab * dt * (1.2 - hot * 0.6)) { m.stuck = true; m.tt = Math.random(); } }
          if (m.x > 1.04) { m.x = -0.04; m.stuck = Math.random() < 0.5; }
        }
        var y = m.stuck ? (m.tt < 0.5 ? top + 5 : bot - 5) : top + 16 + ((m.x * 997 + m.k * 31) % 1) * (bot - top - 32);
        c.beginPath(); c.arc(m.x * w, y, m.k ? 5 : 4, 0, 7);
        c.fillStyle = m.k ? "#facc15" : "#f472b6"; c.shadowColor = c.fillStyle; c.shadowBlur = m.stuck ? 0 : 10; c.fill(); c.shadowBlur = 0;
      });
      c.fillStyle = "#94a3b8"; c.font = "11px system-ui"; c.textAlign = "left";
      c.fillText(lang() === "th" ? "ฟิล์มเคลือบผนัง · stationary phase" : "stationary phase (the film)", 8, top - 8);
      c.fillText(lang() === "th" ? "ก๊าซพาไป → · carrier gas" : "carrier gas →", 8, bot + 18);
    }, { still: 3 });
  }

  /* ================= STAGE 3: electron ionisation ================= */
  var s3 = $("#st-ion");
  if (s3) stage(s3, function (c, w, h, t) {
    c.clearRect(0, 0, w, h);
    var cyc = (t % 3.2) / 3.2, mx = w * 0.55, my = h * 0.5;
    // filament
    c.strokeStyle = "#fde68a"; c.lineWidth = 3; c.shadowColor = "#f59e0b"; c.shadowBlur = 16;
    c.beginPath(); for (var i = 0; i < 9; i++) c.lineTo(w * 0.1 + (i % 2) * 10, h * 0.25 + i * (h * 0.5 / 8)); c.stroke(); c.shadowBlur = 0;
    c.fillStyle = "#fde68a"; c.font = "600 11px system-ui"; c.textAlign = "left"; c.fillText("70 eV e⁻", w * 0.1 - 4, h * 0.2);
    // electrons streaming
    for (var e = 0; e < 14; e++) {
      var ex = w * 0.14 + ((t * 260 + e * 47) % (mx - w * 0.14));
      c.beginPath(); c.arc(ex, h * 0.3 + (e * 37 % (h * 0.4)), 1.8, 0, 7); c.fillStyle = "#fef08a"; c.fill();
    }
    // molecule: intact, struck, flying apart
    var parts = [[0, 0], [16, -8], [30, 2], [14, 14], [-14, 10], [-16, -10], [44, -6]];
    var blast = cyc < 0.45 ? 0 : (cyc - 0.45) / 0.55;
    parts.forEach(function (p, i) {
      var dir = Math.atan2(p[1] || 0.3, p[0] || -1), sp = blast * blast * (60 + i * 12);
      var x = mx + p[0] + Math.cos(dir) * sp, y = my + p[1] + Math.sin(dir) * sp;
      c.beginPath(); c.arc(x, y, i === 0 ? 8 : 6, 0, 7);
      c.fillStyle = PAL[i]; c.globalAlpha = 1 - blast * 0.4; c.fill(); c.globalAlpha = 1;
      if (blast > 0 && i % 2 === 0) { c.fillStyle = "#fff"; c.font = "700 11px system-ui"; c.fillText("+", x + 7, y - 6); }
      if (i > 0 && blast < 0.05) { c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(x, y); c.stroke(); }
    });
    if (cyc > 0.42 && cyc < 0.55) { c.beginPath(); c.arc(mx, my, (cyc - 0.42) * 600, 0, 7); c.strokeStyle = "rgba(254,240,138," + (0.55 - cyc) * 6 + ")"; c.lineWidth = 2; c.stroke(); }
  }, { still: 2.2 });

  /* ================= STAGE 4: the quadrupole ================= */
  var s4 = $("#st-quad"), mzOut = $("#mz-out");
  if (s4) {
    var ions = [];
    stage(s4, function (c, w, h, t, dt) {
      c.clearRect(0, 0, w, h);
      var cy = h * 0.5, x0 = w * 0.08, x1 = w * 0.86, gap = h * 0.17;
      var scanMz = Math.round(40 + ((Math.sin(t * 0.5) + 1) / 2) * 160);
      if (mzOut) mzOut.textContent = "m/z " + scanMz;
      // rods (side view: two pairs in perspective)
      [[-gap, "#64748b"], [gap, "#64748b"], [-gap * 0.45, "#94a3b8"], [gap * 0.45, "#94a3b8"]].forEach(function (r, i) {
        var g = c.createLinearGradient(0, cy + r[0] - 6, 0, cy + r[0] + 6);
        g.addColorStop(0, "#1e293b"); g.addColorStop(0.5, r[1]); g.addColorStop(1, "#1e293b");
        c.fillStyle = g; c.globalAlpha = i < 2 ? 1 : 0.55;
        c.fillRect(x0, cy + r[0] - 6, x1 - x0, 12); c.globalAlpha = 1;
      });
      // detector
      c.fillStyle = "#22d3ee"; c.shadowColor = "#22d3ee"; c.shadowBlur = 14; c.fillRect(x1 + 14, cy - 18, 8, 36); c.shadowBlur = 0;
      if (dt && Math.random() < dt * 9) ions.push({ x: x0 - 8, mz: [43, 57, 71, 85, 93, 136, 152, 194][Math.floor(Math.random() * 8)], ph: Math.random() * 6, dead: 0 });
      ions.forEach(function (n) {
        var ok = Math.abs(n.mz - scanMz) < 9;
        n.x += (dt || 0) * (90 + 400 / n.mz * 20);
        var grow = ok ? 1 : 1 + Math.max(0, (n.x - x0) / (x1 - x0)) * 6;
        var amp = Math.min(gap + 10, 5 * grow);
        var y = cy + Math.sin(n.x * 0.09 + n.ph) * amp;
        if (!ok && amp >= gap) n.dead = 1;
        c.beginPath(); c.arc(n.x, y, 3.2, 0, 7);
        c.fillStyle = ok ? "#a3e635" : "#f472b6"; c.globalAlpha = n.dead ? 0.25 : 1; c.fill(); c.globalAlpha = 1;
      });
      ions = ions.filter(function (n) { return n.x < x1 + 14 && !(n.dead && Math.random() < 0.08); });
    }, { still: 4 });
  }

  /* ================= THE RACE: pick a smell, run the oven, click a peak ================= */
  var raceCv = $("#race-cv"), specCv = $("#spec"), pick = $("#sample-pick"), runBtn = $("#run"), peakInfo = $("#peak-info");
  if (raceCv && SAMPLES.length) {
    var cur = SAMPLES[0], runT = 0, running = false, sel = null, RUN = 30; // minutes
    function rtOf(ri) { return Math.max(1.2, (ri - 400) / 100 * 1.25); }
    SAMPLES.forEach(function (s, i) {
      var b = el("button", "chip");
      b.type = "button"; b.appendChild(bi(s.th, s.en)); b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        cur = s; sel = null; runT = 0; running = !RM; if (RM) runT = RUN;
        $$(".chip", pick).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        drawSpec(null); setInfo(null);
      });
      pick.appendChild(b);
    });
    if (runBtn) runBtn.addEventListener("click", function () { runT = 0; running = true; sel = null; drawSpec(null); setInfo(null); if (RM) { running = false; runT = RUN; race.redraw(); } });
    var race = stage(raceCv, function (c, w, h, t, dt) {
      if (running && dt) { runT += dt * 6; if (runT >= RUN) { runT = RUN; running = false; } }
      if (RM && !running) runT = RUN;
      c.clearRect(0, 0, w, h);
      var L = 34, Rr = w - 12, T = 14, B = h - 30;
      c.strokeStyle = "rgba(148,163,184,.35)"; c.lineWidth = 1; c.fillStyle = "#94a3b8"; c.font = "10px system-ui"; c.textAlign = "center";
      for (var m = 0; m <= RUN; m += 5) { var gx = L + (m / RUN) * (Rr - L); c.beginPath(); c.moveTo(gx, B); c.lineTo(gx, B + 4); c.stroke(); c.fillText(m + (m === RUN ? (lang() === "th" ? " นาที" : " min") : ""), gx, B + 16); }
      c.beginPath(); c.moveTo(L, B); c.lineTo(Rr, B); c.stroke();
      // oven programme line
      var tempNow = Math.min(300, 50 + runT * 10);
      c.fillStyle = "#fdba74"; c.textAlign = "left"; c.fillText((lang() === "th" ? "เตาอบ " : "oven ") + Math.round(tempNow) + " °C", L, T);
      var pk = cur.peaks.map(function (p, i) { var cp = C[p.c] || {}; return { c: p.c, h: p.h, rt: rtOf(cp.ri || 1000), col: PAL[i % PAL.length] }; });
      c.beginPath();
      for (var px = L; px <= Rr; px++) {
        var tm = ((px - L) / (Rr - L)) * RUN; if (tm > runT) break;
        var y = 0; pk.forEach(function (p) { var d = (tm - p.rt) / 0.09; if (d > -5 && d < 5) y += p.h * Math.exp(-d * d / 2); });
        y += 0.012 + Math.sin(tm * 41) * 0.003;
        var Y = B - Math.min(1, y) * (B - T - 16);
        if (px === L) c.moveTo(px, Y); else c.lineTo(px, Y);
      }
      c.strokeStyle = "#67e8f9"; c.lineWidth = 1.8; c.shadowColor = "#22d3ee"; c.shadowBlur = 6; c.stroke(); c.shadowBlur = 0;
      raceCv._pk = pk.filter(function (p) { return p.rt <= runT; }).map(function (p) {
        return { c: p.c, x: L + (p.rt / RUN) * (Rr - L), y: B - Math.min(1, p.h) * (B - T - 16), col: p.col };
      });
      raceCv._pk.forEach(function (p) {
        c.beginPath(); c.arc(p.x, p.y - 7, sel === p.c ? 6 : 4, 0, 7);
        c.fillStyle = p.col; c.fill();
        if (sel === p.c) { c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.stroke(); }
      });
      if (running) { var sx = L + (runT / RUN) * (Rr - L); c.strokeStyle = "rgba(250,204,21,.6)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(sx, T); c.lineTo(sx, B); c.stroke(); c.setLineDash([]); }
    }, { still: 1 });
    function hit(ev) {
      // nearest peak by time; peaks sit close, so height would only get in the way
      var r = raceCv.getBoundingClientRect(), x = ev.clientX - r.left, best = null, bd = 28;
      (raceCv._pk || []).forEach(function (p) { if (Math.abs(p.x - x) < bd) { bd = Math.abs(p.x - x); best = p; } });
      return best;
    }
    raceCv.addEventListener("click", function (ev) { var p = hit(ev); if (!p) return; sel = p.c; drawSpec(p.c, p.col); setInfo(p.c); race.redraw(); });
    raceCv.addEventListener("mousemove", function (ev) { raceCv.style.cursor = hit(ev) ? "pointer" : "default"; });
    function setInfo(id) {
      if (!peakInfo) return;
      peakInfo.textContent = "";
      if (!id) { peakInfo.appendChild(bi("แตะยอดกราฟเพื่อดูแมสสเปกตรัมของมัน", "Tap a peak to see its mass spectrum")); return; }
      var cp = C[id];
      var nm = el("strong"); nm.appendChild(bi(cp.th, cp.en)); peakInfo.appendChild(nm);
      peakInfo.appendChild(document.createTextNode(" · M = " + cp.mw + " · "));
      peakInfo.appendChild(bi("พบใน: " + cp.in_th, "found in: " + cp.in_en));
    }
    function drawSpec(id, col) {
      if (!specCv) return;
      var c = specCv.getContext("2d"), r = specCv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      specCv.width = r.width * d; specCv.height = r.height * d; c.setTransform(d, 0, 0, d, 0, 0);
      var w = r.width, h = r.height, L = 30, B = h - 22, T = 10;
      c.clearRect(0, 0, w, h);
      c.strokeStyle = "rgba(148,163,184,.35)"; c.beginPath(); c.moveTo(L, B); c.lineTo(w - 8, B); c.stroke();
      c.fillStyle = "#94a3b8"; c.font = "10px system-ui"; c.textAlign = "center";
      var max = id ? Math.max(60, Math.ceil(((C[id] || {}).mw + 15) / 20) * 20) : 200;
      for (var m = 0; m <= max; m += max > 200 ? 50 : 20) c.fillText(m, L + (m / max) * (w - L - 8), B + 14);
      c.textAlign = "left"; c.fillText("m/z", w - 30, B - 4);
      if (!id) return;
      var ions = (C[id] || {}).ions || {}, keys = Object.keys(ions), k0 = performance.now();
      (function grow() {
        var p = RM ? 1 : Math.min(1, (performance.now() - k0) / 600);
        c.clearRect(L + 1, T - 2, w, B - T + 1);
        keys.forEach(function (k) {
          var x = L + (k / max) * (w - L - 8), hh = (ions[k] / 100) * (B - T - 12) * p;
          c.fillStyle = col || "#22d3ee"; c.fillRect(x - 1.5, B - hh, 3, hh);
          if (ions[k] >= 30 && p === 1) { c.fillStyle = "#e2e8f0"; c.textAlign = "center"; c.fillText(k, x, B - hh - 3); }
        });
        if (p < 1) requestAnimationFrame(grow);
      })();
    }
    drawSpec(null); setInfo(null);
    if (!RM) running = true;
  }

  /* ================= THE MAP ================= */
  var mapBox = $("#map"), PV = DATA.provinces, LABS = DATA.labs || [];
  if (mapBox && PV) {
    var NS = "http://www.w3.org/2000/svg", vb = PV.viewBox.slice(), home = vb.slice();
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", vb.join(" ")); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "แผนที่ห้องปฏิบัติการ GC-MS ในประเทศไทย · Map of GC-MS labs in Thailand");
    var gP = document.createElementNS(NS, "g"), gL = document.createElementNS(NS, "g");
    PV.provinces.forEach(function (p) {
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", p.d); path.setAttribute("class", "prov");
      var tt = document.createElementNS(NS, "title"); tt.textContent = (p.th || "") + " · " + p.en; path.appendChild(tt);
      gP.appendChild(path);
    });
    svg.appendChild(gP); svg.appendChild(gL); mapBox.appendChild(svg);
    var pr = PV.proj;
    function xy(lat, lng) { return [(lng - pr.lon0) * pr.k * pr.scale, (pr.lat0 - lat) * pr.scale]; }
    var pop = $("#map-pop"), filt = { kind: "all", conf: false, price: false };
    var pins = LABS.filter(function (l) { return l.lat && l.lng; }).map(function (l) {
      var p = xy(l.lat, l.lng), g = document.createElementNS(NS, "g");
      g.setAttribute("class", "pin k-" + l.kind + (l.gcms_confirmed ? " ok" : " maybe"));
      g.setAttribute("transform", "translate(" + p[0].toFixed(1) + " " + p[1].toFixed(1) + ")");
      g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
      g.setAttribute("aria-label", (l.name_th || l.name_en) + (l.name_en ? " · " + l.name_en : ""));
      var halo = document.createElementNS(NS, "circle"); halo.setAttribute("r", "7"); halo.setAttribute("class", "halo");
      halo.style.animationDelay = (Math.random() * 2.4).toFixed(2) + "s";
      var dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", "3.4"); dot.setAttribute("class", "dot");
      g.appendChild(halo); g.appendChild(dot); gL.appendChild(g);
      function open(ev) { show(l, ev); }
      g.addEventListener("click", open);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
      return { l: l, g: g };
    });
    function show(l) {
      pop.hidden = false; pop.textContent = "";
      var h = el("h4"); h.appendChild(bi(l.name_th || l.name_en, l.name_en || l.name_th)); pop.appendChild(h);
      var o = el("p", "org"); o.appendChild(bi((l.org_th || l.org_en || "") + " · " + (l.province_th || ""), (l.org_en || l.org_th || "") + " · " + (l.province_en || ""))); pop.appendChild(o);
      if (l.gcms_min) { var pp = el("p", "price"); var bt = "฿" + l.gcms_min.toLocaleString("en-US"); pp.appendChild(bi("GC-MS " + bt + " ต่อตัวอย่าง", "GC-MS " + bt + " per sample")); pop.appendChild(pp); if (l.gcms_item) pop.appendChild(el("p", "org", l.gcms_item)); }
      if (!l.gcms_confirmed) { var u = el("p", "maybe"); u.appendChild(bi("ยังไม่เห็น GC-MS ในหน้าของเขาเอง โทรถามก่อน", "GC-MS not seen on their own pages yet; call first")); pop.appendChild(u); }
      if (l.phone) { var a = el("a", "call", l.phone); a.href = "tel:" + l.phone.split(/[,;/]/)[0].replace(/[^\d+]/g, ""); pop.appendChild(a); }
      var more = el("a", "more"); more.href = "#lab-" + l.id; more.appendChild(bi("รายละเอียดทั้งหมด ↓", "Everything we have ↓")); pop.appendChild(more);
      var x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "ปิด · Close"); x.addEventListener("click", function () { pop.hidden = true; }); pop.appendChild(x);
    }
    function apply() {
      var n = 0;
      pins.forEach(function (p) {
        var l = p.l, on = (filt.kind === "all" || l.kind === filt.kind || (filt.kind === "government" && l.kind === "state-enterprise"))
          && (!filt.conf || l.gcms_confirmed) && (!filt.price || l.has_price);
        p.g.style.display = on ? "" : "none"; if (on) n++;
      });
      var cnt = $("#map-count"); if (cnt) cnt.textContent = n;
      $$("#lab-list .lab").forEach(function (li) {
        var on = (filt.kind === "all" || li.dataset.kind === filt.kind || (filt.kind === "government" && li.dataset.kind === "state-enterprise"))
          && (!filt.conf || li.dataset.ok === "1") && (!filt.price || li.dataset.price === "1");
        li.hidden = !on;
      });
    }
    $$("[data-kind]", $("#map-filters")).forEach(function (b) {
      b.addEventListener("click", function () {
        filt.kind = b.dataset.kind;
        $$("[data-kind]", $("#map-filters")).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
      });
    });
    var cb = $("#f-conf"), cp = $("#f-price");
    if (cb) cb.addEventListener("change", function () { filt.conf = cb.checked; apply(); });
    if (cp) cp.addEventListener("change", function () { filt.price = cp.checked; apply(); });
    // zoom to a region, tweening the viewBox
    var ZONES = { all: home, north: [0, 0, 300, 360], bkk: [150, 385, 110, 100], ne: [270, 100, 260, 330], south: [20, 580, 300, 390] };
    function zoomTo(t) {
      var from = vb.slice(), k0 = performance.now(), dur = RM ? 0 : 650;
      (function step() {
        var p = dur ? Math.min(1, (performance.now() - k0) / dur) : 1, e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        vb = from.map(function (v, i) { return v + (t[i] - v) * e; });
        svg.setAttribute("viewBox", vb.join(" "));
        var s = vb[2] / home[2]; svg.style.setProperty("--s", s.toFixed(3));
        if (p < 1) requestAnimationFrame(step);
      })();
    }
    $$("[data-zone]").forEach(function (b) {
      b.addEventListener("click", function () {
        zoomTo(ZONES[b.dataset.zone]);
        $$("[data-zone]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      });
    });
    apply();
  }

  /* ---- price bars grow when they arrive ---- */
  var bars = $$(".bar i[data-w]");
  if (bars.length) {
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.style.width = e.target.dataset.w; bio.unobserve(e.target); } });
    });
    bars.forEach(function (b) { if (RM) b.style.width = b.dataset.w; else bio.observe(b); });
  }
})();

/* Snake animation — canvas, chain-follow, no dependencies */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.querySelector('.snake-canvas');
  if (!canvas) return;

  var dpr   = window.devicePixelRatio || 1;
  var CSS_W = 460, CSS_H = 220;
  canvas.width  = CSS_W * dpr;
  canvas.height = CSS_H * dpr;
  canvas.style.width  = CSS_W + 'px';
  canvas.style.height = CSS_H + 'px';

  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  var CX = CSS_W / 2;   // 230 — canvas centre → logo centre
  var CY = CSS_H / 2;   // 110

  // ── Config ──────────────────────────────────────────────
  var SEG_COUNT   = 20;
  var SEG_GAP     = 7;
  var SPEED       = 0.93;
  var TURN_MAX    = 0.11;
  var BOUNDS_Y    = 88;    // ±88 px vertical
  var MOLT_FRAMES = 300;   // frames per stage (~5 s @ 60 fps)
  var DEAD_PAUSE  = 110;   // frames before respawn after kill-zone death

  // Stage colours L1→L5
  var COLORS  = ['#2E5090', '#3a8ecf', '#4a9e5c', '#c88c30', '#c05040'];
  var SEG_VIS = [8, 11, 14, 17, 20];

  // ── Kill zone: top-right corner of logo ─────────────────
  var KILL_X = 57, KILL_Y = -43;
  (function () {
    var logo = document.querySelector('.logo-img');
    if (logo && logo.offsetWidth > 0) {
      KILL_X =  logo.offsetWidth  * 0.25;
      KILL_Y = -logo.offsetHeight * 0.25;
    }
  }());

  // ── Roam bounds — symmetric ellipse, sized to keep snakes clear of album icon
  var BOUNDS_X = 140;  // fallback

  (function () {
    var logo  = document.querySelector('.logo-img');
    var album = document.querySelector('.album-panel-link');
    if (!logo || logo.offsetWidth === 0 || !album) return;
    var logoRect  = logo.getBoundingClientRect();
    var logoCX    = logoRect.left + logoRect.width / 2;
    var albumRect = album.getBoundingClientRect();
    BOUNDS_X = Math.min(albumRect.left - logoCX - 20, CX - 15);
  }());

  // ── Effect pools ────────────────────────────────────────
  var bursts    = [];
  var particles = [];

  function fireMoltRing(x, y, color) {
    bursts.push({ x: x, y: y, color: color, r: 3, alpha: 1.0 });
  }

  function fireFirework(x, y) {
    for (var ci = 0; ci < COLORS.length; ci++) {
      for (var j = 0; j < 3; j++) {
        var angle = rand(0, Math.PI * 2);
        var spd   = rand(1.8, 4.2);
        particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color: COLORS[ci],
          r: rand(1.4, 2.8),
          alpha: 1.0,
          decay: rand(0.022, 0.038)
        });
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

  function spawnX() { return rand(-BOUNDS_X * 0.6, BOUNDS_X * 0.6); }

  function makeSnake(delayFrames) {
    var sx = spawnX(), sy = rand(-50, 50);
    var segs = [];
    for (var i = 0; i < SEG_COUNT; i++) segs.push({ x: sx, y: sy });
    return {
      segs: segs, x: sx, y: sy,
      angle: rand(0, Math.PI * 2),
      stage: 0, stageFrames: 0,
      alive: true, deadFrames: 0,
      delay: delayFrames
    };
  }

  var snakes = [
    makeSnake(0),
    makeSnake(MOLT_FRAMES),
    makeSnake(Math.round(MOLT_FRAMES * 2.3))
  ];

  // ── Main loop ────────────────────────────────────────────
  function tick() {
    ctx.clearRect(0, 0, CSS_W, CSS_H);

    // ─ Molt rings ─
    for (var bi = bursts.length - 1; bi >= 0; bi--) {
      var b = bursts[bi];
      ctx.beginPath();
      ctx.arc(CX + b.x, CY + b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = b.color;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = b.alpha;
      ctx.stroke();
      b.r     += 1.8;
      b.alpha -= 0.055;
      if (b.alpha <= 0) bursts.splice(bi, 1);
    }

    // ─ Firework particles ─
    for (var pi = particles.length - 1; pi >= 0; pi--) {
      var p = particles[pi];
      ctx.beginPath();
      ctx.arc(CX + p.x, CY + p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.06;
      p.r  *= 0.97;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(pi, 1);
    }

    ctx.globalAlpha = 1;

    // ─ Snakes ─
    for (var si = 0; si < snakes.length; si++) {
      var s = snakes[si];

      if (s.delay > 0) { s.delay--; continue; }

      if (!s.alive) {
        s.deadFrames++;
        if (s.deadFrames >= DEAD_PAUSE) {
          s.x = spawnX();
          s.y = rand(-50, 50);
          s.angle = rand(0, Math.PI * 2);
          s.stage = 0; s.stageFrames = 0;
          s.alive = true; s.deadFrames = 0;
          for (var i = 0; i < SEG_COUNT; i++) {
            s.segs[i].x = s.x;
            s.segs[i].y = s.y;
          }
        }
        continue;
      }

      // Steering — symmetric ellipse
      s.angle += rand(-TURN_MAX, TURN_MAX);
      var ex = s.x / BOUNDS_X, ey = s.y / BOUNDS_Y;
      if (ex * ex + ey * ey > 1) {
        var toC  = Math.atan2(-s.y, -s.x);
        var diff = ((toC - s.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        s.angle += diff * 0.08;
      }

      // Move head
      s.x += Math.cos(s.angle) * SPEED;
      s.y += Math.sin(s.angle) * SPEED;

      // Chain-follow body
      s.segs[0].x = s.x;
      s.segs[0].y = s.y;
      for (var i = 1; i < SEG_COUNT; i++) {
        var prev = s.segs[i - 1], cur = s.segs[i];
        var dx = cur.x - prev.x, dy = cur.y - prev.y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d > SEG_GAP) {
          var inv = SEG_GAP / d;
          cur.x = prev.x + dx * inv;
          cur.y = prev.y + dy * inv;
        }
      }

      // Draw
      var color = COLORS[s.stage];
      var vis   = SEG_VIS[s.stage];
      for (var i = vis - 1; i >= 0; i--) {
        var seg = s.segs[i];
        var r   = Math.max(0.97, 3.64 - i * (2.67 / (SEG_COUNT - 1)));
        ctx.beginPath();
        ctx.arc(CX + seg.x, CY + seg.y, r, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.globalAlpha = 1 - i * 0.020;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Kill-zone check — only L5 snakes die here
      if (s.stage === COLORS.length - 1 &&
          s.x > KILL_X && s.y < KILL_Y) {
        fireFirework(s.x, s.y);
        s.alive = false;
        s.deadFrames = 0;
        continue;
      }

      // Molt timer
      s.stageFrames++;
      if (s.stageFrames >= MOLT_FRAMES && s.stage < COLORS.length - 1) {
        fireMoltRing(s.x, s.y, color);
        s.stage++;
        s.stageFrames = 0;
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}());

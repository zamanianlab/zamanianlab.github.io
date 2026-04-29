(function () {
  function init() {
    var wrap   = document.querySelector('.logo-worm-wrap');
    var canvas = document.getElementById('worm-canvas');
    if (!canvas || !wrap) return;

    var W = canvas.offsetWidth;
    var H = wrap.offsetHeight;
    if (W === 0 || H === 0) return;

    canvas.width  = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    // ── Drug cursor ──────────────────────────────────────────────────────────
    var drug = { x: -300, y: -300, r: 13, active: false };

    canvas.addEventListener('mousemove', function (e) {
      var rect   = canvas.getBoundingClientRect();
      var scaleX = canvas.width  / rect.width;
      var scaleY = canvas.height / rect.height;
      drug.x = (e.clientX - rect.left) * scaleX;
      drug.y = (e.clientY - rect.top)  * scaleY;
      drug.active = true;
    });
    canvas.addEventListener('mouseleave', function () {
      drug.active = false;
      drug.x = drug.y = -300;
    });

    function drawDrug() {
      if (!drug.active) return;
      var r  = 3.5;
      var hw = r * 1.5;
      ctx.save();
      ctx.translate(drug.x, drug.y);

      // fill
      drawPillPath(ctx, hw, r);
      ctx.fillStyle = 'rgba(210,210,210,0.85)';
      ctx.fill();

      // centre seam
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(0, r);
      ctx.strokeStyle = 'rgba(150,150,150,0.6)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // outline
      drawPillPath(ctx, hw, r);
      ctx.strokeStyle = 'rgba(120,120,120,0.9)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.restore();
    }

    function drawPillPath(ctx, hw, r) {
      ctx.beginPath();
      ctx.moveTo(-hw, -r);
      ctx.lineTo( hw, -r);
      ctx.arc(  hw,  0, r, -Math.PI / 2,  Math.PI / 2);
      ctx.lineTo(-hw,  r);
      ctx.arc( -hw,  0, r,  Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
    }

    // ── Particles ─────────────────────────────────────────────────────────────
    var particles = [];
    var BURST_COLORS = [
      '#e74c3c','#e67e22','#f1c40f',
      '#2ecc71','#1abc9c','#3498db',
      '#9b59b6','#e91e63','#ff5722'
    ];

    function spawnBurst(x, y) {
      for (var i = 0; i < 8; i++) {
        var ang   = Math.random() * Math.PI * 2;
        var spd   = 0.5 + Math.random() * 1.5;
        particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life:  1.0,
          decay: 0.045 + Math.random() * 0.03,
          size:  0.9 + Math.random() * 1.5,
          color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
        });
      }
    }

    // ── Worm ──────────────────────────────────────────────────────────────────
    function Worm(personality) {
      this.personality = personality;
      this._init();
    }

    Worm.prototype._init = function () {
      this.x         = Math.random() * W;
      this.y         = Math.random() * H;
      this.angle     = Math.random() * Math.PI * 2;
      this.speed     = 0.35 + Math.random() * 0.4;
      this.segs      = [];
      for (var i = 0; i < 106; i++) this.segs.push({ x: this.x, y: this.y });
      this.turn      = (Math.random() - 0.5) * 0.05;
      this.timer     = Math.floor(Math.random() * 60);
      this.thick     = 1.6 + Math.random() * 1.2;
      this.alpha     = 0.22 + Math.random() * 0.32;
      this.phase     = Math.random() * Math.PI * 2;
      this.freq      = 0.04  + Math.random() * 0.03;
      this.amplitude = 0.03  + Math.random() * 0.04;
      this.dead      = false;
      this.respawnIn = 0;
    };

    Worm.prototype.kill = function () {
      if (this.dead) return;
      this.dead = true;
      // staggered bursts along the body
      for (var i = 0; i < this.segs.length; i += 18) {
        (function (x, y, delay) {
          setTimeout(function () { spawnBurst(x, y); }, delay);
        })(this.segs[i].x, this.segs[i].y, i * 6);
      }
      this.respawnIn = 260;
    };

    Worm.prototype.update = function () {
      if (this.dead) {
        if (--this.respawnIn <= 0) this._init();
        return;
      }
      this.timer++;

      if (this.personality === 0) {
        if (this.timer % 60 === 0)
          this.turn = (Math.random() - 0.5) * 0.04;
      } else if (this.personality === 1) {
        this.phase += this.freq;
        this.angle += Math.sin(this.phase) * this.amplitude;
        if (this.timer % 80 === 0)
          this.turn = (Math.random() - 0.5) * 0.03;
      } else {
        if (this.timer % (30 + Math.floor(Math.random() * 25)) === 0)
          this.turn = (Math.random() - 0.5) * 0.10;
      }

      this.angle += this.turn;
      var m = 14;
      if (this.x < m)     this.angle += 0.05;
      if (this.x > W - m) this.angle -= 0.05;
      if (this.y < m)     this.angle += 0.05;
      if (this.y > H - m) this.angle -= 0.05;

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.segs.unshift({ x: this.x, y: this.y });
      this.segs.pop();

      // collision check every 4th segment for performance
      if (drug.active) {
        var killR2 = (5 * 2.2) * (5 * 2.2);
        for (var i = 0; i < this.segs.length; i += 4) {
          var dx = this.segs[i].x - drug.x;
          var dy = this.segs[i].y - drug.y;
          if (dx * dx + dy * dy < killR2) { this.kill(); break; }
        }
      }
    };

    Worm.prototype.draw = function () {
      if (this.dead) return;
      var n = this.segs.length;
      ctx.shadowColor = 'rgba(46,80,144,0.18)';
      ctx.shadowBlur  = 3;
      for (var i = 0; i < n - 1; i++) {
        var t = 0.3 + 0.7 * (1 - i / n);
        ctx.beginPath();
        ctx.moveTo(this.segs[i].x,     this.segs[i].y);
        ctx.lineTo(this.segs[i + 1].x, this.segs[i + 1].y);
        ctx.strokeStyle = 'rgba(46,80,144,' + (this.alpha * t).toFixed(2) + ')';
        ctx.lineWidth   = this.thick * t;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    };

    var personalities = [0, 0, 1, 1, 1, 2, 2, 2];
    var worms = [];
    for (var i = 0; i < 8; i++) worms.push(new Worm(personalities[i]));

    // ── Main loop ─────────────────────────────────────────────────────────────
    function loop() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < worms.length; i++) {
        worms[i].update();
        worms[i].draw();
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.07;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle    = p.color;
        ctx.globalAlpha  = p.life;
        ctx.shadowColor  = p.color;
        ctx.shadowBlur   = 4;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      drawDrug();
      requestAnimationFrame(loop);
    }
    loop();
  }

  window.addEventListener('load', init);
})();

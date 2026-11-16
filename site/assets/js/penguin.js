/* 企鵝寶寶：跟著游標走、留下腳印；順便負責飄雪與冰山視差 */
(function () {
  "use strict";
  var el = document.getElementById("penguin");
  var flip = el.querySelector(".peng-flip");
  var say = el.querySelector(".peng-say");
  var cv = document.getElementById("snow");
  var ctx = cv.getContext("2d");
  var layers = document.querySelectorAll(".scene .layer");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  /* 企鵝的位置（腳底中心點）與目標 */
  var x = W * 0.72, y = H - 70, tx = x, ty = y, dir = -1;
  var walked = 0, foot = 1, idle = 0, prints = [];
  var STOP = 62;                      // 走到離游標這麼近就停下，避免擋住要點的東西

  function place() { el.style.transform = "translate(" + (x - 32) + "px," + (y - 70) + "px)"; }
  place();

  if (calm) {                         // 使用者設定「減少動態」：企鵝乖乖站在角落
    window.addEventListener("resize", function () { x = W * 0.72; y = H - 70; place(); });
  } else {
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; idle = 0; }, { passive: true });
    window.addEventListener("pointerdown", function (e) { tx = e.clientX; ty = e.clientY; idle = 0; }, { passive: true });
    window.addEventListener("pointermove", function (e) {
      var k = (e.clientX / W - 0.5);
      layers.forEach(function (l) { l.style.transform = "translateX(" + (-k * +l.dataset.depth) + "px)"; });
    }, { passive: true });
  }

  /* 點企鵝：跳一下、叫一聲 */
  var words = ["啾！", "嗨～", "冷冷的", "要看作品嗎？", "啾啾"];
  var sayTimer;
  el.addEventListener("click", function () {
    el.classList.remove("hop"); void el.offsetWidth; el.classList.add("hop");
    say.textContent = words[Math.floor(Math.random() * words.length)];
    say.classList.add("on");
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say.classList.remove("on"); }, 1400);
    idle = 0;
  });

  /* 雪花 */
  var flakes = [];
  if (!calm) for (var i = 0; i < 46; i++) flakes.push({
    x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.2,
    v: 12 + Math.random() * 22, p: Math.random() * 6.28
  });

  var last = performance.now();
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;

    var dx = tx - x, dy = ty - y, d = Math.sqrt(dx * dx + dy * dy);
    var moving = d > STOP;
    if (moving) {
      var sp = Math.min(60 + (d - STOP) * 2.4, 420) * dt;
      var mx = dx / d * sp, my = dy / d * sp;
      x += mx; y += my;
      x = Math.max(24, Math.min(W - 24, x)); y = Math.max(74, Math.min(H - 6, y));
      if (Math.abs(dx) > 6) dir = dx > 0 ? 1 : -1;
      walked += Math.sqrt(mx * mx + my * my);
      if (walked > 22) {              // 每走一小段留一個腳印，左右腳交替
        walked = 0; foot = -foot;
        var a = Math.atan2(dy, dx);
        prints.push({ x: x + Math.cos(a + 1.57) * 7 * foot, y: y + Math.sin(a + 1.57) * 7 * foot - 2, a: a, t: now });
      }
      idle = 0;
    } else idle += dt;

    el.classList.toggle("walk", moving);
    el.classList.toggle("sleep", !moving && idle > 6);
    flip.style.transform = "scaleX(" + dir + ")";
    place();

    ctx.clearRect(0, 0, W, H);
    for (var j = prints.length - 1; j >= 0; j--) {
      var p = prints[j], age = (now - p.t) / 5200;
      if (age >= 1) { prints.splice(j, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = "rgba(46,140,138," + (0.26 * (1 - age)) + ")";
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.strokeStyle = "rgba(160,196,196,.55)";
    ctx.lineWidth = 0.6;
    for (var f = 0; f < flakes.length; f++) {
      var s = flakes[f];
      s.y += s.v * dt; s.p += dt;
      s.x += Math.sin(s.p) * 8 * dt;
      if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill(); ctx.stroke();
    }
    requestAnimationFrame(frame);
  }
  if (!calm) requestAnimationFrame(frame);
})();

/* Halftone plates and the section marker. Without this script the photos and all content still show. */
(function () {
  var INK = [21, 18, 14];
  var PAPER = [236, 228, 208];
  var TAN = "#b89f78";
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hash(a, b) {
    var x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  var press = document.documentElement.classList.contains("js-press") && document.querySelector(".collage")
    ? buildPress()
    : null;

  /* The moving press. The collage's blocks stay on screen and slide along their seams, x then y or
     y then x, to become each next section. Text is printed on its block and is clipped to it,
     so a block's moving edge is what reveals the words. */
  function buildPress() {
    var main = document.querySelector("main");
    var work = document.getElementById("work");
    var record = document.getElementById("record");
    var sailing = document.querySelector(".sailing");
    var contact = document.getElementById("contact");
    var masthead = document.querySelector(".masthead");
    var marker = document.querySelector(".marker");
    var phone = false;
    var H = 0;
    var unit = 0;

    function div(cls) {
      var el = document.createElement("div");
      el.className = cls;
      return el;
    }
    function makeTrack(before) {
      var track = div("press-track");
      var stage = div("press-stage");
      track.appendChild(stage);
      main.insertBefore(track, before);
      return { el: track, stage: stage, blocks: {}, copies: [], keys: [] };
    }
    function add(track, key, el) {
      el.classList.add("press-block");
      track.blocks[key] = { el: el, key: key, i: track.keys.length, plate: null, last: "" };
      track.keys.push(key);
    }
    function copy(track, el, host, scene, cls) {
      el.classList.add("press-copy");
      if (cls) el.classList.add(cls);
      track.copies.push({ el: el, host: host, scene: scene, track: track, last: "" });
    }
    function anchor(track, id) {
      var span = document.createElement("span");
      span.className = "press-anchor";
      span.id = id;
      track.el.appendChild(span);
      return span;
    }

    /* First stage: collage, the work headline, Reddit, Duolingo. */
    var layerA = main.querySelector(".collage");
    var a = makeTrack(layerA);
    a.stage.appendChild(layerA);
    Array.prototype.forEach.call(main.querySelectorAll(".pitch-plate"), function (el) { el.parentNode.removeChild(el); });
    /* The sail goes first so it lies under every other block on the opening page. */
    ["colonia", "finish", "black", "tan", "coronet", "sky", "trials", "black2"].forEach(function (key) {
      var el = layerA.querySelector(".c-" + key);
      layerA.appendChild(el);
      add(a, key, el);
    });
    var paper = div("press-paper");
    layerA.appendChild(paper);
    add(a, "paper", paper);
    work.removeAttribute("id");
    work.classList.remove("section");
    work.classList.add("press-flat");
    a.stage.appendChild(work);
    copy(a, work.querySelector("h2"), "paper", 1, "h-copy");
    copy(a, work.querySelector(".pitch.a .pitch-body"), "black", 2);
    copy(a, work.querySelector(".pitch.b .pitch-body"), "tan", 3, "duo");
    var hero = main.querySelector(".hero");
    a.stage.insertBefore(hero, work);
    copy(a, hero.querySelector(".hero-name"), "black", 0);
    copy(a, hero.querySelector(".hero-line"), "tan", 0);
    copy(a, work.querySelector(".work-intro"), "black", 1);
    a.holds = [0.1, 0.3, 0.7, 0.7];
    a.heroes = [null, null, "trials", "finish"];
    a.lead = 0;
    a.anchors = [{ el: anchor(a, "work"), scene: 1 }];

    record.classList.add("press-over");

    /* Second stage, uncovered as the record sheet leaves: sailing, then contact. */
    var b = makeTrack(sailing);
    var layerB = div("collage");
    var hoist = sailing.querySelector(".plate");
    var hoistImg = hoist.querySelector("img");
    layerB.setAttribute("role", "img");
    var pair = main.querySelector(".contact-plate");
    var pairImg = pair.querySelector("img");
    layerB.setAttribute("aria-label", hoistImg.alt + " " + pairImg.alt);
    [hoistImg, pairImg].forEach(function (img) {
      img.removeAttribute("loading");
      img.alt = "";
    });
    b.stage.appendChild(layerB);
    var sky = div("block-sky");
    var black = div("block-black");
    var tan = div("block-tan");
    [sky, hoist, pair, tan, black].forEach(function (el) { layerB.appendChild(el); });
    add(b, "sky", sky);
    add(b, "hoist", hoist);
    add(b, "pair", pair);
    add(b, "tan", tan);
    add(b, "black", black);
    sailing.classList.add("press-flat");
    contact.removeAttribute("id");
    b.stage.appendChild(sailing);
    b.stage.appendChild(contact);
    copy(b, sailing.querySelector(".slab"), "black", 0);
    copy(b, contact, "tan", 1);
    b.holds = [0.5, 0.9];
    b.heroes = ["hoist", "pair"];
    b.anchors = [{ el: anchor(b, "contact"), scene: 1 }];
    var tracks = [a, b];

    function measure(c, width, max, fixed) {
      var el = c.el;
      var fit = 1;
      el.style.width = width + "px";
      el.style.height = "auto";
      el.style.overflowY = "";
      el.style.setProperty("--fit", 1);
      var h = el.offsetHeight;
      while (h > max && fit > 0.76) {
        fit -= 0.04;
        el.style.setProperty("--fit", fit);
        h = el.offsetHeight;
      }
      if (h > max) el.style.overflowY = "auto";
      el.style.height = (fixed ? fixed : Math.min(h, max)) + "px";
      return Math.min(h, max);
    }

    /* Rects are [x, y, w, h] in px. Off-press rects sit past the stage's clipped edge. */
    function desktopScenes(W, H0) {
      var top = Math.max(16, Math.min(36, H0 * 0.03));
      var bottom = Math.max(28, Math.min(72, H0 * 0.06));
      var cw = W / 12;
      var rh = (H0 - top - bottom) / 12;
      function g(c, r, cs, rs) { return [c * cw, top + r * rh, cs * cw, rs * rh]; }
      a.scenes = [
        { colonia: g(4, 0, 8, 12), black: g(0, 1, 8, 3), tan: g(0, 7.4, 5.8, 4.6), sky: g(10, 0, 2, 1), black2: g(5.8, 11, 1, 1), finish: g(5, 14, 3, 3), coronet: g(3, 14, 2, 3), trials: g(14, 3, 3, 5), paper: g(0, 0, 0, 8.5) },
        { paper: g(0, 0, 8, 8.5), colonia: g(8, 0, 4, 12), black: g(0, 8.5, 5, 3.5), tan: g(5, 8.5, 1, 1.2), coronet: g(5, 9.7, 1, 2.3), finish: g(6, 8.5, 2, 3.5), sky: g(14, 1, 2, 2), trials: g(14, 3, 3, 5), black2: g(14, 9, 1, 2) },
        { trials: g(0, 0, 5, 10.5), black: g(5, 0.6, 7, 11.4), tan: g(0, 10.5, 2, 1.5), sky: g(2, 10.5, 2, 0.8), colonia: g(14, 0, 4, 12), coronet: g(3, 14, 2, 3), finish: g(5, 14, 3, 3), black2: g(14, 9, 1, 2), paper: g(0, 0, 0, 8.5) },
        { finish: g(5, 0, 7, 11), tan: g(0, 1, 5, 11), black: g(0, 0, 1.4, 1), sky: g(1.4, 0, 2, 0.6), trials: g(-7, 0, 5, 10), coronet: g(5, 11, 2, 1), colonia: g(14, 0, 4, 12), black2: g(14, 9, 1, 2), paper: g(0, 0, 0, 8.5) }
      ];
      b.scenes = [
        { hoist: g(0, 0, 7, 10.8), black: g(7, 1, 5, 11), tan: g(0, 10.8, 2, 1.2), sky: g(2, 10.8, 1.5, 0.7), pair: g(3.5, 14, 8.5, 5.4) },
        { tan: g(0, 0, 12, 6.6), pair: g(3.5, 6.6, 8.5, 5.4), black: g(0, 6.6, 2, 3), sky: g(2, 6.6, 1.5, 1.4), hoist: g(-8, 0, 7, 10.8) }
      ];
    }

    function phoneScenes(W, H0) {
      var slab = masthead.offsetHeight;
      var nav = masthead.querySelector(".index");
      var bar = slab - nav.offsetTop + 2;
      a.slab = slab - bar;
      var top = bar + 10;
      var end = H0 - 12;
      var field = end - top;
      var cw = W / 12;
      var rh0 = (end - slab - 10) / 12;
      function g(c, r, cs, rs) { return [c * cw, slab + 10 + r * rh0, cs * cw, rs * rh0]; }
      var min = 72;
      var hh = measure(a.copies[0], W, field * 0.5);
      var hr = measure(a.copies[1], W, field - min);
      var hd = measure(a.copies[2], W, field - min);
      var hs = measure(b.copies[0], W - cw, field - min);
      var hc = measure(b.copies[1], W, field - min);
      var off = W + 40;
      var ry = end - hr;
      var dy = top + hd;
      var sy = end - hs;
      var rest = end - top - hh;
      var hl = measure(a.copies[4], W - cw * 2, (end - slab - 10) * 0.6);
      var hi = measure(a.copies[5], W, rest * 0.5);
      var iy = top + hh + hi;
      var left = end - iy;
      a.scenes = [
        { colonia: g(0, 0, 12, 12), tan: [cw * 2, end - hl, W - cw * 2, hl], black: g(0, 0.7, 2, 1.3), sky: g(9, 1, 3, 1), finish: [off, top, cw * 4, rest], coronet: [-off, top, cw * 5, rest], trials: [off, top, cw * 3, rest], black2: [off, top, cw, 60], paper: [0, top, 0, hh] },
        { paper: [0, top, W, hh], black: [0, top + hh, W, hi], colonia: [cw * 5, iy, cw * 7, left], tan: [cw * 3, iy, cw * 2, left * 0.25], coronet: [0, iy + left * 0.25, cw * 5, left * 0.75], finish: [off, top, cw * 4, rest], sky: [off, top, cw * 2, 60], trials: [off, top, cw * 3, rest], black2: [off, top, cw, 60] },
        { trials: [cw * 2, top, cw * 10, ry - top], black: [0, ry, W, hr], tan: [0, top + (ry - top) * 0.5, cw * 2, (ry - top) * 0.5], sky: [0, top, cw * 2, (ry - top) * 0.5], colonia: [off, top, cw * 7, rest], coronet: [-off, top, cw * 5, rest], finish: [off, ry, cw * 8, 200], black2: [off, top, cw, 60], paper: [0, top, 0, hh] },
        { tan: [0, top, W, hd], finish: [0, dy, cw * 10, end - dy], black: [cw * 10, dy, cw * 2, (end - dy) * 0.5], sky: [cw * 10, dy + (end - dy) * 0.5, cw * 2, (end - dy) * 0.25], trials: [-off, top, cw * 10, 200], colonia: [off, top, cw * 7, rest], coronet: [-off, top, cw * 5, rest], black2: [off, top, cw, 60], paper: [0, top, 0, hh] }
      ];
      b.scenes = [
        { hoist: [0, top, W, sy - top], black: [cw, sy, W - cw, hs], tan: [0, sy, cw, Math.min(hs, 90)], sky: [0, sy + Math.min(hs, 90), cw, 40], pair: [cw * 2, end + 40, cw * 10, end - top - hc] },
        { tan: [0, top, W, hc], pair: [cw * 2, top + hc, cw * 10, end - top - hc], black: [0, top + hc, cw * 2, (end - top - hc) * 0.5], sky: [0, top + hc + (end - top - hc) * 0.5, cw * 2, (end - top - hc) * 0.25], hoist: [-off, top, W, sy - top] }
      ];
    }

    function layout() {
      phone = window.innerWidth <= 820;
      H = a.stage.clientHeight;
      unit = H * 0.85;
      var W = a.stage.clientWidth;
      if (!phone) W -= parseFloat(getComputedStyle(record).paddingRight) || 0;
      if (phone) { phoneScenes(W, H); }
      else {
        a.slab = 0;
        desktopScenes(W, H);
      }
      tracks.forEach(function (t) {
        t.copies.forEach(function (c) {
          var r = t.scenes[c.scene][c.host];
          c.rect = r;
          if (!phone) measure(c, r[2], r[3], r[3]);
          else c.el.style.height = r[3] + "px";
          c.el.style.width = r[2] + "px";
          c.el.style.left = Math.round(r[0]) + "px";
          c.el.style.top = Math.round(r[1]) + "px";
          c.last = "";
        });
        var at = 0;
        t.segs = [];
        t.holdAt = [];
        t.holds.forEach(function (hold, i) {
          t.holdAt[i] = at;
          t.segs.push({ scene: i, from: at, to: at + hold * unit });
          at += hold * unit;
          if (i < t.holds.length - 1) {
            t.segs.push({ scene: i, next: i + 1, from: at, to: at + unit });
            at += unit;
          }
        });
        t.length = at;
      });
      a.lead = 0;
      b.lead = H;
      a.el.style.height = a.length + 2 * H + "px";
      record.style.marginTop = -H + "px";
      b.el.style.marginTop = -H + "px";
      b.el.style.height = H + b.length + H + "px";
      tracks.forEach(function (t) {
        t.top = t.el.getBoundingClientRect().top + window.scrollY;
        t.anchors.forEach(function (x) {
          x.top = t.lead + t.holdAt[x.scene] + 2;
          x.el.style.top = x.top + "px";
        });
      });
      recordTop = record.getBoundingClientRect().top + window.scrollY;
      contactTop = b.top + b.anchors[0].top;
      maxY = document.documentElement.scrollHeight - window.innerHeight;
      /* Where the page may come to rest: each section's hold, anywhere in the record, the very end. */
      rests = [];
      tracks.forEach(function (t, n) {
        t.segs.forEach(function (s) {
          if (s.next === undefined) rests.push([t.top + t.lead + s.from, t.top + t.lead + s.to]);
        });
        if (n === 0) rests.push([recordTop, recordTop + record.offsetHeight - H]);
      });
      rests.push([maxY, maxY]);
      tracks.forEach(function (t) {
        t.keys.forEach(function (k) { t.blocks[k].last = ""; });
      });
    }

    function ease(u) { return u * u * u * (u * (u * 6 - 15) + 10); }
    function clamp(u) { return u < 0 ? 0 : u > 1 ? 1 : u; }

    function locate(t, y) {
      var off = y - t.top - t.lead;
      for (var i = 0; i < t.segs.length; i++) {
        var s = t.segs[i];
        if (off <= s.to) return { a: s.scene, b: s.next === undefined ? s.scene : s.next, t: s.next === undefined ? 0 : clamp((off - s.from) / (s.to - s.from)) };
      }
      var last = t.holds.length - 1;
      return { a: last, b: last, t: 0 };
    }

    function renderTrack(t, y) {
      if (y < t.top - H || y > t.top + t.el.offsetHeight) return;
      var at = locate(t, y);
      var from = t.scenes[at.a];
      var to = t.scenes[at.b];
      t.at = at;
      var now = {};
      t.keys.forEach(function (key) {
        var bl = t.blocks[key];
        var A = from[key];
        var B = to[key];
        /* Staggered, and each block moves on one axis and then the other, like type in a forme. */
        var u = clamp((at.t - bl.i * 0.03) / (1 - t.keys.length * 0.03));
        var first = ease(clamp(u / 0.62));
        var second = ease(clamp((u - 0.38) / 0.62));
        var ux = bl.i % 2 ? second : first;
        var uy = bl.i % 2 ? first : second;
        var x = Math.round(A[0] + (B[0] - A[0]) * ux);
        var w = Math.round(A[2] + (B[2] - A[2]) * ux);
        var yy = Math.round(A[1] + (B[1] - A[1]) * uy);
        var h = Math.round(A[3] + (B[3] - A[3]) * uy);
        now[key] = [x, yy, w, h];
        var sig = x + "," + yy + "," + w + "," + h;
        if (sig === bl.last) return;
        bl.last = sig;
        bl.el.style.transform = "translate3d(" + x + "px," + yy + "px,0)";
        bl.el.style.width = w + "px";
        bl.el.style.height = h + "px";
        if (bl.plate) bl.plate.fit(w, h);
      });
      t.now = now;
      t.copies.forEach(function (c) {
        var host = now[c.host];
        var r = [Math.round(c.rect[0]), Math.round(c.rect[1]), Math.round(c.rect[2]), Math.round(c.rect[3])];
        var inset = [
          Math.max(0, host[1] - r[1]),
          Math.max(0, r[0] + r[2] - host[0] - host[2]),
          Math.max(0, r[1] + r[3] - host[1] - host[3]),
          Math.max(0, host[0] - r[0])
        ];
        /* Only the block's own scene shows its words, so a passing overlap prints nothing. */
        var own = at.a === c.scene || (at.b === c.scene && at.t > 0);
        if (!own || inset[0] + inset[2] >= r[3] || inset[1] + inset[3] >= r[2]) inset = [r[3], 0, 0, 0];
        var sig = inset.join("px ") + "px";
        if (sig === c.last) return;
        c.last = sig;
        c.el.style.clipPath = "inset(" + sig + ")";
      });
    }

    var cur = window.scrollY;
    var raf = 0;
    var moving = false;
    var settleTimer = 0;
    var recordTop = 0;
    var contactTop = 0;
    var maxY = 1;
    var mark = "";
    var rests = [];
    var snapTimer = 0;
    var touching = false;
    var lastY = cur;
    var goingDown = true;
    var api = { onMark: null };
    var railName = document.querySelector(".name");
    var railLine = document.querySelector(".line");

    /* A pause between sections carries on to the next one, unless it was only a nudge away. */
    function snap() {
      if (touching) return;
      var y = window.scrollY;
      for (var i = 0; i < rests.length; i++) {
        if (y >= rests[i][0] - 2 && y <= rests[i][1] + 2) return;
        if (y < rests[i][0]) break;
      }
      if (i === 0 || i === rests.length) return;
      var prev = rests[i - 1][1];
      var next = rests[i][0];
      var nudge = 60;
      var to;
      if (goingDown) to = y - prev >= nudge ? next : prev;
      else to = next - y >= nudge ? prev : next;
      window.scrollTo({ top: to, behavior: "smooth" });
    }

    /* The opening sail moves only while its page is the one at rest on screen. */
    api.windCheck = function () {
      var sail = a.blocks.colonia.plate;
      if (!sail) return;
      if (a.at && a.at.a === 0 && a.at.t === 0) sail.startWind();
      else sail.stopWind();
    };

    function paint(y) {
      tracks.forEach(function (t) { renderTrack(t, y); });
      if (a.slab) {
        var u = a.at ? (a.at.a > 0 ? 1 : ease(a.at.t)) : 1;
        masthead.style.setProperty("--slab", Math.round(-a.slab * u) + "px");
      } else masthead.style.removeProperty("--slab");
      /* On desktop the big name hands over to the column as the first move plays. */
      if (!phone && a.at) {
        var shown = a.at.a > 0 ? 1 : ease(clamp(a.at.t * 1.6));
        railName.style.clipPath = "inset(0 0 " + (1 - shown) * 100 + "% 0)";
        railLine.style.transform = "translateY(" + Math.round(-(1 - shown) * railName.offsetHeight) + "px)";
      } else {
        railName.style.clipPath = "";
        railLine.style.transform = "";
      }
      api.windCheck();
      if (phone && marker) marker.style.setProperty("--m", Math.round(70 + clamp(y / maxY) * (H - 100)) + "px");
      var mid = y + H / 2;
      var id = mid >= contactTop ? "contact" : mid >= recordTop ? "record" : "work";
      if (id !== mark && api.onMark) { mark = id; api.onMark(id); }
    }

    function eachPlate(fn) {
      tracks.forEach(function (t) {
        t.keys.forEach(function (key) {
          if (t.blocks[key].plate) fn(t.blocks[key].plate, t, key);
        });
      });
    }

    /* Dots come back up while the press moves. When it stops, each plate is reprinted at its
       real size and the section's lead plate opens. */
    function settle() {
      moving = false;
      tracks.forEach(function (t) {
        if (!t.at || t.at.t !== 0 && t.at.t !== 1) return;
        var scene = t.at.t === 1 ? t.at.b : t.at.a;
        var pinned = cur >= t.top - H && cur <= t.top + t.el.offsetHeight;
        t.keys.forEach(function (key) {
          var p = t.blocks[key].plate;
          if (!p) return;
          var r = t.now && t.now[key];
          var visible = pinned && r && r[2] > 8 && r[3] > 8 && r[0] < t.stage.clientWidth && r[0] + r[2] > 0 && r[1] < H;
          if (visible && p.img.naturalWidth && (p.scale > 1.1 || p.scale < 0.9 || !p.tone)) p.ready();
          p.base = visible && t.heroes[scene] === key ? 0.2 : p.rest;
          p.go(p.base);
        });
      });
    }

    function tick() {
      raf = 0;
      var target = window.scrollY;
      var gap = target - cur;
      cur = Math.abs(gap) < 0.4 ? target : cur + gap * 0.18;
      paint(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
      else {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(settle, 170);
      }
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(tick);
      if (!moving) {
        moving = true;
        eachPlate(function (p) {
          if (p.base !== p.rest) { p.base = p.rest; p.go(p.rest); }
        });
      }
      clearTimeout(settleTimer);
      var y = window.scrollY;
      if (y !== lastY) goingDown = y > lastY;
      lastY = y;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 180);
    }

    function relayout() {
      layout();
      cur = window.scrollY;
      paint(cur);
    }

    api.start = function () {
      tracks.forEach(function (t) {
        t.keys.forEach(function (key) {
          var el = t.blocks[key].el;
          if (el._plate) t.blocks[key].plate = el._plate;
        });
      });
      relayout();
      eachPlate(function (p, t, key) {
        var r = t.now && t.now[key];
        if (r) p.fit(r[2], r[3]);
      });
      settle();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("touchstart", function () { touching = true; clearTimeout(snapTimer); }, { passive: true });
      window.addEventListener("touchend", function () {
        touching = false;
        clearTimeout(snapTimer);
        snapTimer = setTimeout(snap, 180);
      }, { passive: true });

      var sail = a.blocks.colonia.plate;
      if (sail) {
        a.stage.addEventListener("pointermove", function (e) {
          var box = sail.canvas.getBoundingClientRect();
          sail.mx = (e.clientX - box.left) / box.width * sail.w;
          sail.my = (e.clientY - box.top) / box.height * sail.h;
          sail.pull = 1;
        }, { passive: true });
        a.stage.addEventListener("pointerleave", function () { sail.pull = 0; });
        window.addEventListener("deviceorientation", function (e) { sail.tilt = (e.gamma || 0) / 45; }, { passive: true });
      }

      var w = window.innerWidth;
      var h = window.innerHeight;
      var timer;
      window.addEventListener("resize", function () {
        var nw = window.innerWidth;
        var nh = window.innerHeight;
        /* A rotated phone may no longer fit the press, and a small change is only the browser bar. */
        if ((nw > 820 ? 600 : 560) > nh) { location.reload(); return; }
        if (nw === w && Math.abs(nh - h) < 120) return;
        w = nw;
        h = nh;
        clearTimeout(timer);
        timer = setTimeout(function () {
          relayout();
          settle();
        }, 160);
      });
      /* A link from a case page lands on its section, and again once fonts have changed the heights. */
      function toHash() {
        var hit = location.hash && document.getElementById(location.hash.slice(1));
        if (hit) window.scrollTo({ top: hit.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          relayout();
          if (window.scrollY > 0 || location.hash) toHash();
        });
      }

      /* Keyboard users reach links on any block: bring that block's scene to them. */
      tracks.forEach(function (t) {
        t.copies.forEach(function (c) {
          c.el.addEventListener("focusin", function () {
            window.scrollTo(0, t.top + t.lead + t.holdAt[c.scene] + 2);
          });
        });
      });

      toHash();
    };
    /* Blocks need a size before plates print. */
    layout();
    tracks.forEach(function (t) { renderTrack(t, window.scrollY); t.keys.forEach(function (k) {
      var s = t.scenes[0][k];
      if (!t.now) {
        t.blocks[k].el.style.width = Math.round(s[2]) + "px";
        t.blocks[k].el.style.height = Math.round(s[3]) + "px";
      }
    }); });
    return api;
  }

  function Plate(el) {
    this.el = el;
    this.img = el.querySelector("img");
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("aria-hidden", "true");
    this.ctx = this.canvas.getContext("2d");
    this.pitch = parseFloat(el.dataset.pitch) || 11;
    /* "screen" stays all dots at rest, "tone" rests with dots only at the seams. */
    this.rest = el.dataset.rest === "tone" ? 0.16 : 1;
    this.open = 0.12;
    this.seams = el.dataset.seams || "ltrb";
    this.base = this.rest;
    this.amount = reduceMotion ? Math.min(this.rest, 0.3) : this.rest;
    this.target = this.amount;
    var small = el.dataset.cropSm && matchMedia("(max-width: 820px)").matches;
    this.crop = ((small ? el.dataset.cropSm : el.dataset.crop) || "0 0 1 1").split(" ").map(Number);
    el.appendChild(this.canvas);
  }

  /* Tone buffer: the cropped photo mapped from ink to paper, kept for dot sampling. */
  Plate.prototype.prepare = function () {
    var rect = this.el.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, press && rect.width < 500 ? 1.5 : 2);
    var w = Math.round(rect.width * dpr);
    var h = Math.round(rect.height * dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this.dpr = dpr;
    if (press) {
      this.rw = rect.width;
      this.rh = rect.height;
      this.canvas.style.width = rect.width + "px";
      this.canvas.style.height = rect.height + "px";
      this.fit(rect.width, rect.height);
    }

    var iw = this.img.naturalWidth;
    var ih = this.img.naturalHeight;
    var c = this.crop;
    var cw = iw * c[2];
    var ch = ih * c[3];
    var scale = Math.max(w / cw, h / ch);
    var sw = w / scale;
    var sh = h / scale;
    var sx = iw * c[0] + (cw - sw) / 2;
    var sy = ih * c[1] + (ch - sh) / 2;

    var tone = document.createElement("canvas");
    tone.width = w;
    tone.height = h;
    var t = tone.getContext("2d", { willReadFrequently: true });
    t.drawImage(this.img, sx, sy, sw, sh, 0, 0, w, h);
    var data = t.getImageData(0, 0, w, h);
    var d = data.data;
    var lum = new Float32Array(w * h);
    for (var i = 0, n = 0; i < d.length; i += 4, n++) {
      var v = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
      v = Math.min(1, Math.max(0, (v - 0.06) * 1.14));
      lum[n] = v;
      d[i] = INK[0] + (PAPER[0] - INK[0]) * v;
      d[i + 1] = INK[1] + (PAPER[1] - INK[1]) * v;
      d[i + 2] = INK[2] + (PAPER[2] - INK[2]) * v;
    }
    t.putImageData(data, 0, 0);
    this.tone = tone;
    this.lum = lum;
    this.w = w;
    this.h = h;
    return true;
  };

  /* Draws the photo, then prints dot cells over it. A cell prints when its distance
     to the nearest seam, roughened by noise, falls inside the current amount. */
  Plate.prototype.draw = function () {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var amount = this.amount;
    var pitch = this.pitch * this.dpr * Math.max(0.45, Math.min(1, w / this.dpr / 420));
    var off = 2.2 * this.dpr;
    var reach = Math.hypot(w, h);
    var paper = "rgb(" + PAPER.join(",") + ")";
    var ink = "rgb(" + INK.join(",") + ")";
    var cos = Math.SQRT1_2;
    var limit = Math.min(w, h) * 0.5;
    var seams = this.seams;
    var cells = [];

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.tone, 0, 0);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);

    var half = Math.ceil(reach / 2 / pitch) + 1;
    ctx.fillStyle = paper;
    for (var a = -half; a <= half; a++) {
      for (var b = -half; b <= half; b++) {
        var px = a * pitch;
        var py = b * pitch;
        var x = w / 2 + (px - py) * cos;
        var y = h / 2 + (px + py) * cos;
        if (x < -pitch || y < -pitch || x > w + pitch || y > h + pitch) continue;
        var edge = Math.min(
          seams.indexOf("l") > -1 ? x : reach,
          seams.indexOf("t") > -1 ? y : reach,
          seams.indexOf("r") > -1 ? w - x : reach,
          seams.indexOf("b") > -1 ? h - y : reach
        ) / limit;
        /* Mostly coarse noise, so dots break away in clusters instead of stray cells. */
        var score = edge + (hash(a >> 2, b >> 2) * 0.7 + hash(a, b) * 0.3 - 0.5) * 0.3;
        if (score > amount * 1.2 && amount < 1) continue;
        ctx.fillRect(px - pitch / 2 - 0.5, py - pitch / 2 - 0.5, pitch + 1, pitch + 1);
        var dark = 1 - this.sample(x, y, pitch * 0.35);
        if (dark > 0.03) cells.push(px, py, Math.sqrt(dark) * pitch * 0.66);
      }
    }
    /* Tan plate first, slightly out of register, then black. */
    var i;
    ctx.fillStyle = TAN;
    ctx.beginPath();
    for (i = 0; i < cells.length; i += 3) {
      ctx.moveTo(cells[i] + off + cells[i + 2], cells[i + 1]);
      ctx.arc(cells[i] + off, cells[i + 1], cells[i + 2], 0, 6.2832);
    }
    ctx.fill();
    ctx.fillStyle = ink;
    ctx.beginPath();
    for (i = 0; i < cells.length; i += 3) {
      ctx.moveTo(cells[i] + cells[i + 2], cells[i + 1]);
      ctx.arc(cells[i], cells[i + 1], cells[i + 2], 0, 6.2832);
    }
    ctx.fill();
  };

  /* Average tone across the cell, so one stray pixel can't set a dot's size. */
  Plate.prototype.sample = function (x, y, r) {
    var w = this.w;
    var h = this.h;
    var total = 0;
    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        var sx = Math.min(w - 1, Math.max(0, (x + i * r) | 0));
        var sy = Math.min(h - 1, Math.max(0, (y + j * r) | 0));
        total += this.lum[sy * w + sx];
      }
    }
    return total / 9;
  };

  /* Moves in visible steps, like a screen changing, rather than a smooth fade. */
  Plate.prototype.go = function (target) {
    if (reduceMotion || !this.tone || this.windOn) return;
    this.target = target;
    if (this.timer) return;
    var self = this;
    this.timer = setInterval(function () {
      var gap = self.target - self.amount;
      if (Math.abs(gap) < 0.02) {
        self.amount = self.target;
        clearInterval(self.timer);
        self.timer = null;
      } else {
        self.amount += gap * 0.32;
      }
      self.draw();
    }, 60);
  };

  Plate.prototype.ready = function () {
    if (!this.prepare()) return;
    this.grid = null;
    this.draw();
    this.el.classList.add("is-printed");
    if (press) press.windCheck();
  };

  /* The opening sail: a wave runs through the dot grid, shifting which part of the photo each
     dot reads and swelling its size, so the sail itself ripples. Dots grow near the pointer. */
  Plate.prototype.startWind = function () {
    if (this.windOn || !this.tone) return;
    this.windOn = true;
    clearInterval(this.timer);
    this.timer = null;
    this.swell = 0;
    var self = this;
    var last = 0;
    function frame(now) {
      if (!self.windOn) return;
      self.windFrame = requestAnimationFrame(frame);
      if (now - last < 32) return;
      last = now;
      self.drawWind(now);
    }
    this.windFrame = requestAnimationFrame(frame);
  };

  Plate.prototype.stopWind = function () {
    if (!this.windOn) return;
    this.windOn = false;
    cancelAnimationFrame(this.windFrame);
    this.amount = this.target = this.base;
    this.draw();
  };

  Plate.prototype.drawWind = function (now) {
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    var dpr = this.dpr;
    var pitch = this.pitch * dpr * Math.max(0.45, Math.min(1, w / dpr / 420));
    var cos = Math.SQRT1_2;
    var a, b, i;
    if (!this.grid) {
      this.grid = [];
      var half = Math.ceil(Math.hypot(w, h) / 2 / pitch) + 1;
      for (a = -half; a <= half; a++) {
        for (b = -half; b <= half; b++) {
          var gx = w / 2 + (a - b) * pitch * cos;
          var gy = h / 2 + (a + b) * pitch * cos;
          if (gx < -pitch || gy < -pitch || gx > w + pitch || gy > h + pitch) continue;
          this.grid.push(a * pitch, b * pitch, gx, gy);
        }
      }
    }
    this.swell += ((this.pull || 0) - this.swell) * 0.12;
    var off = 2.2 * dpr;
    var tilt = (this.tilt || 0) * 40 * dpr;
    var reachMouse = 170 * dpr;
    var mx = this.mx || 0;
    var my = this.my || 0;
    var scale = 1 / dpr;
    var cells = [];
    for (i = 0; i < this.grid.length; i += 4) {
      var x = this.grid[i + 2];
      var y = this.grid[i + 3];
      var w1 = Math.sin(x * scale * 0.009 + y * scale * 0.004 - now * 0.0013);
      var w2 = Math.sin(y * scale * 0.012 - x * scale * 0.003 + now * 0.0009);
      var dark = 1 - this.sample(x + (w1 * 13 * dpr) + tilt, y + (w2 * 9 * dpr), pitch * 0.35);
      var r = Math.sqrt(Math.max(0, dark)) * pitch * 0.66 * (1 + w1 * 0.16 + w2 * 0.08);
      if (this.swell > 0.01) {
        var near = 1 - Math.hypot(x - mx, y - my) / reachMouse;
        if (near > 0) r += near * this.swell * pitch * 0.34;
      }
      if (r > 0.3) cells.push(this.grid[i], this.grid[i + 1], r);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "rgb(" + PAPER.join(",") + ")";
    ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = TAN;
    ctx.beginPath();
    for (i = 0; i < cells.length; i += 3) {
      ctx.moveTo(cells[i] + off + cells[i + 2], cells[i + 1]);
      ctx.arc(cells[i] + off, cells[i + 1], cells[i + 2], 0, 6.2832);
    }
    ctx.fill();
    ctx.fillStyle = "rgb(" + INK.join(",") + ")";
    ctx.beginPath();
    for (i = 0; i < cells.length; i += 3) {
      ctx.moveTo(cells[i] + cells[i + 2], cells[i + 1]);
      ctx.arc(cells[i], cells[i + 1], cells[i + 2], 0, 6.2832);
    }
    ctx.fill();
  };

  /* While a block is moving, its last print scales to cover it. It is reprinted when it settles. */
  Plate.prototype.fit = function (w, h) {
    if (!this.rw) return;
    this.scale = Math.max(w / this.rw, h / this.rh);
    this.canvas.style.transform = "translate(-50%,-50%) scale(" + this.scale + ")";
  };

  var plates = [];
  var nodes = document.querySelectorAll(".plate");
  var touch = matchMedia("(hover: none)").matches;
  var watcher = "IntersectionObserver" in window && touch && !reduceMotion && !press
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var p = entry.target._plate;
          if (p) p.go(entry.intersectionRatio > 0.55 ? p.open : p.rest);
        });
      }, { threshold: [0, 0.55, 1] })
    : null;

  Array.prototype.forEach.call(nodes, function (el) {
    var plate = new Plate(el);
    el._plate = plate;
    plates.push(plate);
    if (plate.img.complete && plate.img.naturalWidth) plate.ready();
    else plate.img.addEventListener("load", function () { plate.ready(); });
    if (watcher) watcher.observe(el);
    else {
      el.addEventListener("mouseenter", function () { plate.go(plate.open); });
      el.addEventListener("mouseleave", function () { plate.go(plate.base); });
    }
  });

  var resizeTimer;
  var lastWidth = window.innerWidth;
  window.addEventListener("resize", function () {
    if (press || window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      plates.forEach(function (p) { if (p.img.naturalWidth) p.ready(); });
    }, 160);
  });

  /* One triangle marks the current section in the column. */
  var marker = document.querySelector(".marker");
  var links = Array.prototype.slice.call(document.querySelectorAll(".index a[data-section]"));
  var here = document.querySelector(".index a[data-here]");
  if (marker && here) {
    marker.style.transform = "translate(0," + (here.offsetTop + here.offsetHeight / 2 - 6) + "px)";
    marker.classList.add("is-placed");
  }
  if (marker && links.length && "IntersectionObserver" in window) {
    var place = function (link) {
      var box = link.getBoundingClientRect();
      var parent = marker.parentElement.getBoundingClientRect();
      marker.style.transform = "translate(0," + (box.top - parent.top + box.height / 2 - 6) + "px)";
      marker.classList.add("is-placed");
      links.forEach(function (l) {
        if (l === link) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
    };
    var current = links[0];
    place(current);
    if (press) {
      press.onMark = function (id) {
        var hit = links.filter(function (l) { return l.dataset.section === id; })[0];
        if (hit) { current = hit; place(hit); }
      };
    } else {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var hit = links.filter(function (l) { return l.dataset.section === entry.target.id; })[0];
          if (hit) { current = hit; place(hit); }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach(function (l) {
        var section = document.getElementById(l.dataset.section);
        if (section) seen.observe(section);
      });
    }
    window.addEventListener("resize", function () { place(current); });
  }
  if (press) press.start();
})();

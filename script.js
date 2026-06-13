/* פוזיטיב · גדרה — interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer:coarse)").matches;

  /* ---------- build aperture blades (iris) ---------- */
  function aperture(group, cx, cy, R, n, open) {
    if (!group) return;
    var ns = "http://www.w3.org/2000/svg";
    for (var i = 0; i < n; i++) {
      var a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
      var a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      var p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
      var p2 = [cx + R * Math.cos(a2), cy + R * Math.sin(a2)];
      // inner point: pulled in and rotated for the spiral-blade look
      var ai = a1 + (Math.PI / n) * 1.7;
      var r = R * open;
      var pin = [cx + r * Math.cos(ai), cy + r * Math.sin(ai)];
      var d = "M" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) +
              "L" + p2[0].toFixed(1) + " " + p2[1].toFixed(1) +
              "L" + pin[0].toFixed(1) + " " + pin[1].toFixed(1) + "Z";
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", d);
      group.appendChild(path);
    }
  }
  document.querySelectorAll(".ap-blades").forEach(function (g) {
    aperture(g, 22, 22, 13, 6, 0.52);
  });
  document.querySelectorAll(".cursor .blades").forEach(function (g) {
    aperture(g, 20, 20, 17, 6, 0.5);
  });

  /* ---------- custom aperture cursor ---------- */
  if (!coarse && !reduce) {
    var cur = document.getElementById("cursor");
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)" +
        (cur.classList.contains("is-hot") ? " scale(1.7) rotate(40deg)" : "");
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, .btn, .card, .frame, .magnetic").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("is-hot"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-hot"); });
    });
  } else if (cur = document.getElementById("cursor")) {
    document.getElementById("cursor").style.display = "none";
  }

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 30); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- count-up numbers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = el.dataset.dec ? parseInt(el.dataset.dec, 10) :
              (el.classList.contains("score-num") || String(target).indexOf(".") > -1 ? 1 : 0);
    var start = performance.now(), dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---------- magnetic buttons ---------- */
  if (!coarse && !reduce) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + mx * 0.28 + "px," + my * 0.4 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- subtle parallax on the hero shop sign ---------- */
  if (!coarse && !reduce) {
    var sign = document.querySelector(".sign-frame");
    if (sign) {
      window.addEventListener("mousemove", function (e) {
        var rx = (e.clientX / window.innerWidth - 0.5);
        var ry = (e.clientY / window.innerHeight - 0.5);
        sign.style.transform = "translateY(-2px) perspective(900px) rotateX(" + (-ry * 5) + "deg) rotateY(" + (rx * 7) + "deg)";
      });
    }
  }

  /* ---------- year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

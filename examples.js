/* פוזיטיב · live product visualizer with contextual scenes + 3D wood board */
(function () {
  "use strict";

  var DEFAULT_IMG = "img/family.jpg"; // local placeholder until upload

  var PRODUCTS = {
    canvas: { name: "הדפסה על קנבס", desc: "קנבס מתוח על הקיר — ככה זה נראה בסלון מרחוק." },
    wood:   { name: "הדפסה על עץ",   desc: "לוח עץ אמיתי עם עומק. גררו את הלוח כדי לסובב אותו 360°." },
    frame:  { name: "תמונה במסגרת",  desc: "פספרטו לבן ומסגרת — תלוי על הקיר, נקי ומכובד." },
    print:  { name: "הדפסה קלאסית",  desc: "הדפסה על נייר צילום, מוכנה תוך דקות." },
    magnet: { name: "מגנט למקרר",    desc: "ככה התמונה שלכם נראית על המקרר בבית." }
  };

  var SIZE_SCALE = { "10×15":0.7, "13×18":0.8, "20×30":0.92, "30×40":1.04, "40×60":1.16, "50×70":1.28 };

  var state = { product: "canvas", size: "20×30", ar: 1, uploaded: false };

  var stage     = document.getElementById("stage");
  var stageCap  = document.getElementById("stageCap");
  var fileInput = document.getElementById("fileInput");
  var dropzone  = document.getElementById("dropzone");
  var productDesc = document.getElementById("productDesc");
  var orderText = document.getElementById("orderText");
  var waBtn     = document.getElementById("waBtn");
  var woodScene = document.getElementById("woodScene");
  var woodBox   = document.getElementById("woodBox");
  var acrossImgs = [].slice.call(document.querySelectorAll(".across-grid .ac-mock img"));

  /* ---- 3D wood state ---- */
  var rotX = -16, rotY = -28, dragging = false, userMoved = false, sx = 0, sy = 0, srx = 0, sry = 0;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function scaleNow() { return SIZE_SCALE[state.size] || 1; }
  function applyWood() {
    woodBox.style.transform = "scale(" + scaleNow() + ") rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
  }
  function woodDims() {
    var ar = state.ar || 1, W, H, D = 24;
    if (ar >= 1) { W = 300; H = Math.round(W / ar); }
    else { H = 260; W = Math.round(H * ar); }
    W = clamp(W, 150, 380); H = clamp(H, 140, 300);
    stage.style.setProperty("--w", W + "px");
    stage.style.setProperty("--h", H + "px");
    stage.style.setProperty("--d", D + "px");
  }

  /* ---- image ---- */
  function applyImage(src) {
    stage.style.setProperty("--img", 'url("' + src + '")');
    acrossImgs.forEach(function (im) { im.src = src; });
    var probe = new Image();
    probe.onload = function () {
      if (probe.naturalWidth && probe.naturalHeight) {
        state.ar = probe.naturalWidth / probe.naturalHeight;
        stage.style.setProperty("--ar", probe.naturalWidth + "/" + probe.naturalHeight);
        woodDims(); applyWood();
      }
    };
    probe.src = src;
  }

  function setProduct(p) {
    state.product = p;
    stage.dataset.product = p;
    productDesc.textContent = PRODUCTS[p].desc;
    document.querySelectorAll(".seg-btn").forEach(function (b) { b.classList.toggle("is-on", b.dataset.product === p); });
    updateOrder();
  }

  function setSize(s) {
    state.size = s;
    stage.style.setProperty("--scale", SIZE_SCALE[s] || 1);
    applyWood();
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("is-on", c.dataset.size === s); });
    updateOrder();
  }

  function updateOrder() {
    var name = PRODUCTS[state.product].name;
    orderText.textContent = name + " · " + state.size + " ס״מ";
    var msg = "היי פוזיטיב! אהבתי את ההדמיה באתר ואשמח להזמין: " +
      name + " בגודל " + state.size + " ס\"מ. הנה התמונה 👇";
    waBtn.href = "https://wa.me/972545888917?text=" + encodeURIComponent(msg);
  }

  /* ---- upload ---- */
  function handleFile(file) {
    if (!file || !/^image\//.test(file.type)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      state.uploaded = true;
      applyImage(e.target.result);
      stageCap.textContent = "התצוגה עם התמונה שלכם · החליפו מוצר וגודל כדי לראות עוד";
    };
    reader.readAsDataURL(file);
  }
  fileInput.addEventListener("change", function (e) { handleFile(e.target.files[0]); });
  ["dragenter", "dragover"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add("drag"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove("drag"); });
  });
  dropzone.addEventListener("drop", function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  /* ---- controls ---- */
  document.getElementById("products").addEventListener("click", function (e) {
    var b = e.target.closest(".seg-btn"); if (b) setProduct(b.dataset.product);
  });
  document.getElementById("sizes").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (c) setSize(c.dataset.size);
  });

  /* ---- drag to spin the wood board ---- */
  woodScene.addEventListener("pointerdown", function (e) {
    dragging = true; userMoved = true;
    sx = e.clientX; sy = e.clientY; srx = rotX; sry = rotY;
    woodScene.classList.add("grabbing");
    if (woodScene.setPointerCapture) { try { woodScene.setPointerCapture(e.pointerId); } catch (x) {} }
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    rotY = sry + (e.clientX - sx) * 0.5;
    rotX = clamp(srx - (e.clientY - sy) * 0.5, -85, 85);
    applyWood();
  });
  window.addEventListener("pointerup", function () { dragging = false; woodScene.classList.remove("grabbing"); });

  /* gentle idle spin until the user grabs it */
  (function spin() {
    if (state.product === "wood" && !dragging && !userMoved) { rotY += 0.35; applyWood(); }
    requestAnimationFrame(spin);
  })();

  /* ---- init ---- */
  woodDims();
  applyImage(DEFAULT_IMG);
  setProduct("canvas");
  setSize("20×30");
  applyWood();
})();

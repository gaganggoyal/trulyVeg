/* TrulyVeg — shared interactions */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  /* Scroll-reveal animation */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Product category filter (products.html) */
  var chips = document.querySelectorAll(".filter-chip");
  var products = document.querySelectorAll("[data-cat]");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var cat = chip.getAttribute("data-filter");
      products.forEach(function (p) {
        p.style.display =
          cat === "all" || p.getAttribute("data-cat") === cat ? "" : "none";
      });
    });
  });

  /* Waitlist / newsletter forms — stores locally until a backend is wired up.
     Replace the localStorage block with a fetch() to your email service
     (e.g. Mailchimp, ConvertKit, or your own API) before going live. */
  document.querySelectorAll("form[data-waitlist]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var input = form.querySelector("input[type=email]");
      var msg = form.parentElement.querySelector(".form-msg");
      if (!input || !input.value || input.value.indexOf("@") < 1) {
        if (msg) msg.textContent = "Please enter a valid email address.";
        return;
      }
      try {
        var list = JSON.parse(localStorage.getItem("vv-waitlist") || "[]");
        if (list.indexOf(input.value) === -1) list.push(input.value);
        localStorage.setItem("vv-waitlist", JSON.stringify(list));
      } catch (e) { /* storage unavailable — still show success */ }
      if (msg) msg.textContent = "🌿 You are on the list! We will write to you before launch.";
      input.value = "";
    });
  });

  /* Video placeholders — replace data-video-id with real YouTube IDs to go live.
     A thumb with an ID becomes an embedded player on click. */
  document.querySelectorAll(".video-thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var id = thumb.getAttribute("data-video-id");
      if (id) {
        var iframe = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1";
        iframe.width = "100%";
        iframe.style.aspectRatio = "16/9";
        iframe.style.border = "0";
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;
        thumb.replaceWith(iframe);
      } else {
        var play = thumb.querySelector(".play");
        if (play) {
          play.textContent = "🎬";
          var d = thumb.querySelector(".duration");
          if (d) d.textContent = "Video coming soon";
        }
      }
    });
  });
})();

/* ============================================================
   PWA — service-worker registration + "Install app" button.
   Runs on every page (this file is included site-wide).
   ============================================================ */
(function () {
  "use strict";

  /* Register the service worker for offline + installability. */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function (e) {
        /* Non-fatal: the site works fine without it. */
        console.warn("SW registration failed:", e);
      });
    });
  }

  /* Already installed / running as an app? Then no button. */
  var standalone = window.matchMedia("(display-mode: standalone)").matches ||
                   window.navigator.standalone === true;
  if (standalone) return;

  /* Respect a previous dismissal for ~30 days. */
  try {
    var until = parseInt(localStorage.getItem("tv-install-dismissed") || "0", 10);
    if (until && Date.now() < until) return;
  } catch (e) { /* storage blocked — carry on */ }

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
              !window.MSStream;
  var deferredPrompt = null;
  var ui = null;

  function buildUI() {
    if (ui) return ui;
    ui = document.createElement("div");
    ui.className = "pwa-install";
    ui.innerHTML =
      '<button class="pwa-install-btn" type="button">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>' +
      '<span>Install app</span></button>' +
      '<button class="pwa-install-close" type="button" aria-label="Dismiss">&times;</button>';
    document.body.appendChild(ui);

    ui.querySelector(".pwa-install-close").addEventListener("click", function () {
      hide();
      try {
        localStorage.setItem("tv-install-dismissed",
          String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      } catch (e) {}
    });

    ui.querySelector(".pwa-install-btn").addEventListener("click", onInstallClick);
    return ui;
  }

  function show() { buildUI().classList.add("show"); }
  function hide() { if (ui) ui.classList.remove("show"); }

  function onInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        hide();
      });
    } else if (isIOS) {
      showIOSHint();
    }
  }

  /* iOS Safari has no beforeinstallprompt — guide the user instead. */
  function showIOSHint() {
    var hint = document.createElement("div");
    hint.className = "pwa-ios-hint";
    hint.innerHTML =
      '<p>Install TrulyVeg on your iPhone:</p>' +
      '<p>Tap <strong>Share</strong> ' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>' +
      ' then <strong>Add to Home Screen</strong>.</p>' +
      '<button type="button" class="pwa-ios-close">Got it</button>';
    document.body.appendChild(hint);
    requestAnimationFrame(function () { hint.classList.add("show"); });
    hint.querySelector(".pwa-ios-close").addEventListener("click", function () {
      hint.remove();
    });
  }

  /* Chromium / Android / desktop path. */
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    show();
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    hide();
  });

  /* iOS never fires beforeinstallprompt — offer the button anyway. */
  if (isIOS) {
    window.addEventListener("load", function () { show(); });
  }
})();

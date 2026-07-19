/* VegVikalp — shared interactions */
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

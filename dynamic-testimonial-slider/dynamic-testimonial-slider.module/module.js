(function () {
  var SELECTOR = ".dts";

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function parseBool(value, fallback) {
    if (value === "true") return true;
    if (value === "false") return false;
    return fallback;
  }

  function clampIndex(i, len) {
    if (len < 1) return 0;
    var m = ((i % len) + len) % len;
    return m;
  }

  function initSlider(root) {
    var viewport = root.querySelector(".dts__viewport");
    var track = root.querySelector(".dts__track");
    var slides = root.querySelectorAll(".dts__slide");
    var prevBtn = root.querySelector("[data-dts-prev]");
    var nextBtn = root.querySelector("[data-dts-next]");
    var dots = root.querySelectorAll("[data-dts-dot]");

    if (!track || slides.length === 0) return;

    var len = slides.length;
    var index = 0;
    var timer = null;
    var touchStartX = null;

    var autoplay = parseBool(root.getAttribute("data-dts-autoplay"), true);
    var interval = parseInt(root.getAttribute("data-dts-interval"), 10) || 6000;
    var pauseHover = parseBool(root.getAttribute("data-dts-pause-hover"), true);
    var reduced = prefersReducedMotion();

    function setTrackPosition(i) {
      var offset = -i * 100;
      track.style.transform = "translate3d(" + offset + "%,0,0)";
    }

    function updateA11y(i) {
      for (var s = 0; s < slides.length; s++) {
        slides[s].setAttribute("aria-hidden", s === i ? "false" : "true");
      }
      for (var d = 0; d < dots.length; d++) {
        var dot = dots[d];
        var dotIdx = parseInt(dot.getAttribute("data-dts-dot"), 10);
        var active = dotIdx === i;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      }
    }

    function goTo(nextIndex) {
      index = clampIndex(nextIndex, len);
      setTrackPosition(index);
      updateA11y(index);
    }

    function next() {
      goTo(index + 1);
    }

    function prev() {
      goTo(index - 1);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startTimer() {
      stopTimer();
      if (reduced || !autoplay || len < 2) return;
      timer = window.setInterval(next, interval);
    }

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    for (var di = 0; di < dots.length; di++) {
      dots[di].addEventListener("click", function (e) {
        var t = e.currentTarget;
        var targetIndex = parseInt(t.getAttribute("data-dts-dot"), 10);
        if (!isNaN(targetIndex)) goTo(targetIndex);
      });
    }

    root.addEventListener("keydown", function (e) {
      if (len < 2) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    });

    if (viewport && pauseHover && len > 1) {
      viewport.addEventListener("mouseenter", stopTimer);
      viewport.addEventListener("mouseleave", startTimer);
    }

    if (viewport && len > 1) {
      viewport.addEventListener(
        "touchstart",
        function (e) {
          if (!e.touches || !e.touches[0]) return;
          touchStartX = e.touches[0].clientX;
        },
        { passive: true }
      );
      viewport.addEventListener(
        "touchend",
        function (e) {
          if (touchStartX === null || !e.changedTouches || !e.changedTouches[0]) return;
          var dx = e.changedTouches[0].clientX - touchStartX;
          touchStartX = null;
          if (Math.abs(dx) < 48) return;
          if (dx < 0) next();
          else prev();
        },
        { passive: true }
      );
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopTimer();
      else startTimer();
    });

    goTo(0);
    startTimer();
  }

  function initAll() {
    var nodes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < nodes.length; i++) initSlider(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();

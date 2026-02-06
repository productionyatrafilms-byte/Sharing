document.addEventListener("DOMContentLoaded", () => {
  // pick title elements flexibly (works on index, sharing, pranam pages)
  const titleSpan =
    document.querySelector(".home-title span") ||
    document.querySelector(".sharing-title span");
  const titleP =
    document.querySelector(".home-title p") ||
    document.querySelector(".sharing-title p");

  const englishButton = document.getElementById("englishButton");
  const hindiButton = document.getElementById("hindiButton");
  const gujaratiButton = document.getElementById("gujaratiButton");

  const titles = {
    en: "Sharing",
    hi: "बाँटना",
    gu: "વહેંચવું",
  };

  const subtitle = {
    en: "Sharing is Caring",
    hi: "बाँटना मतलब दूसरों की परवाह करना ",
    gu: "શેરિંગ એટલે કૅરિંગ",
  };

  function clearActive() {
    if (englishButton) englishButton.classList.remove("lang-active");
    if (hindiButton) hindiButton.classList.remove("lang-active");
    if (gujaratiButton) gujaratiButton.classList.remove("lang-active");
  }

  function setLang(lang) {
    if (titleSpan) titleSpan.textContent = titles[lang];
    if (titleP) titleP.textContent = subtitle[lang];

    clearActive();

    if (lang === "en" && englishButton)
      englishButton.classList.add("lang-active");
    if (lang === "hi" && hindiButton) hindiButton.classList.add("lang-active");
    if (lang === "gu" && gujaratiButton)
      gujaratiButton.classList.add("lang-active");
  }

  // attach click events only if buttons exist on page
  if (englishButton)
    englishButton.addEventListener("click", () => setLang("en"));
  if (hindiButton) hindiButton.addEventListener("click", () => setLang("hi"));
  if (gujaratiButton)
    gujaratiButton.addEventListener("click", () => setLang("gu"));

  // ✅ default active
  setLang("en");

  // --- Swiper initialization and manual navigation (only on pages that include .mySwiper) ---
  if (typeof Swiper !== "undefined" && document.querySelector(".mySwiper")) {
    const swiper = new Swiper(".mySwiper", {
      loop: false,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      speed: 500,
    });

    const prevBtn = document.querySelector(".swiper-button-prev");
    const nextBtn = document.querySelector(".swiper-button-next");
    const pageEl = document.querySelector("main");

    // helper to show/hide prev button on first slide
    function updateNavVisibility() {
      if (prevBtn)
        prevBtn.style.visibility = swiper.isBeginning ? "hidden" : "visible";
    }

    // Video helpers: pause all videos, play only the active slide's video (if any)
    function pauseAllVideos() {
      document.querySelectorAll(".mySwiper .slide-media").forEach((v) => {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
      });
    }

    function playActiveVideo() {
      // use the active slide element
      const activeVideo = document.querySelector(
        ".mySwiper .swiper-slide-active .slide-media",
      );
      if (activeVideo && activeVideo.tagName === "VIDEO") {
        try {
          activeVideo.muted = true; // ensure muted for autoplay
          activeVideo.loop = true; // ensure loop
          // ensure playback starts from 0
          try {
            activeVideo.currentTime = 0;
          } catch (e) {}
          activeVideo.play().catch(() => {});
        } catch (e) {}
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        swiper.slidePrev();
      });
    }

    // update visibility initially and on slide changes
    updateNavVisibility();
    swiper.on("slideChange", updateNavVisibility);

    // start/stop videos appropriately
    // pause everything first, then play the active slide video once transition ends
    pauseAllVideos();
    playActiveVideo();
    swiper.on("slideChangeTransitionEnd", () => {
      pauseAllVideos();
      playActiveVideo();
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.preventDefault();

        // if not on last slide, advance and let user see it
        if (!swiper.isEnd) {
          swiper.slideNext();
          return;
        }

        // already on last slide: perform exit animation then navigate
        nextBtn.style.pointerEvents = "none";
        if (pageEl) pageEl.getBoundingClientRect();
        if (pageEl) pageEl.classList.add("page-exit");
        if (pageEl) {
          pageEl.addEventListener(
            "transitionend",
            () => {
              window.location.href = "pranam.html";
            },
            { once: true },
          );
        }
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "en";

  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

  const englishButton = document.getElementById("englishButton");
  const hindiButton = document.getElementById("hindiButton");
  const gujaratiButton = document.getElementById("gujaratiButton");

  const bubbleImg = document.getElementById("dialogueOverlay");
  const overlayText1 = document.getElementById("dialogueText1");
  const overlayText2 = document.getElementById("dialogueText2");
  const dialogueBox = document.querySelector(".dialogue-box");

  let translations = null;
  let swiper = null;

  async function loadTranslations() {
    if (translations) return translations;

    try {
      const res = await fetch("/data.json");
      if (!res.ok) throw new Error("JSON not found");
      translations = await res.json();
    } catch (err) {
      console.error("Translation load failed:", err);
      translations = {};
    }

    return translations;
  }

  function clearActive() {
    englishButton?.classList.remove("lang-active");
    hindiButton?.classList.remove("lang-active");
    gujaratiButton?.classList.remove("lang-active");
  }

  function setActiveUI(lang) {
    clearActive();

    if (lang === "en") englishButton?.classList.add("lang-active");
    if (lang === "hi") hindiButton?.classList.add("lang-active");
    if (lang === "gu") gujaratiButton?.classList.add("lang-active");
  }

  async function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    const data = await loadTranslations();

    document.documentElement.lang = lang;
    document.body.setAttribute("data-lang", lang);

    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");

      if (data?.[lang] && key && data[lang][key] != null) {
        el.textContent = data[lang][key];
      }
    });

    setActiveUI(lang);
  }

  async function updateDialogueFromSlide() {
    if (!swiper || !bubbleImg || !overlayText1 || !overlayText2) return;

    const data = await loadTranslations();
    const activeSlide = swiper.slides[swiper.activeIndex];

    const imgSrc =
      activeSlide?.getAttribute("data-dialogue-img") || "./assets/2.png";

    const key1 = activeSlide?.getAttribute("data-dialogue-key1") || "";
    const key2 = activeSlide?.getAttribute("data-dialogue-key2") || "";

    bubbleImg.src = imgSrc;

    overlayText1.textContent =
      data?.[currentLang] && key1 && data[currentLang][key1] != null
        ? data[currentLang][key1]
        : "";

    overlayText2.textContent =
      data?.[currentLang] && key2 && data[currentLang][key2] != null
        ? data[currentLang][key2]
        : "";
  }

  englishButton?.addEventListener("click", async () => {
    await applyLanguage("en");
    await updateDialogueFromSlide();
  });

  hindiButton?.addEventListener("click", async () => {
    await applyLanguage("hi");
    await updateDialogueFromSlide();
  });

  gujaratiButton?.addEventListener("click", async () => {
    await applyLanguage("gu");
    await updateDialogueFromSlide();
  });

  applyLanguage(currentLang);

  if (typeof Swiper !== "undefined" && document.querySelector(".mySwiper")) {
    swiper = new Swiper(".mySwiper", {
      loop: false,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      speed: 500,

      on: {
        slideChangeTransitionStart() {
          dialogueBox?.classList.add("hide");
        },
        async slideChangeTransitionEnd() {
          await updateDialogueFromSlide();
          dialogueBox?.classList.remove("hide");
        },
      },
    });

    updateDialogueFromSlide();

    const prevBtn = document.querySelector(".swiper-button-prev");
    const nextBtn = document.querySelector(".swiper-button-next");
    const pageEl = document.querySelector("main");

    function updateNavVisibility() {
      if (prevBtn) {
        prevBtn.style.visibility = swiper.isBeginning ? "hidden" : "visible";
      }
    }

    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      swiper.slidePrev();
    });

    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();

      if (!swiper.isEnd) {
        swiper.slideNext();
        return;
      }

      nextBtn.style.pointerEvents = "none";
      pageEl?.classList.add("page-exit");

      pageEl?.addEventListener(
        "transitionend",
        () => {
          window.location.href = "pranam.html";
        },
        { once: true }
      );
    });

    updateNavVisibility();
    swiper.on("slideChange", updateNavVisibility);

    function pauseAllVideos() {
      document.querySelectorAll(".mySwiper .slide-media").forEach((v) => {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {}
      });
    }

    function playActiveVideo() {
      const activeVideo = document.querySelector(
        ".mySwiper .swiper-slide-active .slide-media"
      );

      if (activeVideo && activeVideo.tagName === "VIDEO") {
        try {
          activeVideo.muted = true;
          activeVideo.loop = true;
          activeVideo.currentTime = 0;
          activeVideo.play().catch(() => {});
        } catch (e) {}
      }
    }

    pauseAllVideos();
    playActiveVideo();

    swiper.on("slideChangeTransitionEnd", () => {
      pauseAllVideos();
      playActiveVideo();
    });
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const LANG_KEY = "selectedLanguage";
  const DEFAULT_LANG = "en";
  const VALID_LANGS = ["en", "hi", "gu"];

  let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

  if (!VALID_LANGS.includes(currentLang)) {
    currentLang = DEFAULT_LANG;
    localStorage.setItem(LANG_KEY, DEFAULT_LANG);
  }

  const englishButton = document.getElementById("englishButton");
  const hindiButton = document.getElementById("hindiButton");
  const gujaratiButton = document.getElementById("gujaratiButton");

  const bubbleImg = document.getElementById("dialogueOverlay");
  const overlayText1 = document.getElementById("dialogueText1");
  const overlayText2 = document.getElementById("dialogueText2");
  const dialogueBox = document.querySelector(".dialogue-box");

  const prevBtn = document.querySelector(".swiper-button-prev");
  const nextBtn = document.querySelector(".swiper-button-next");
  const pranamLink = document.querySelector(".pranam-link");

  let translations = {};
  let swiper = null;

  const languageAudios = {
    en: new Audio("./assets/audio/Eng.mpeg"),
    hi: new Audio("./assets/audio/Hin.mpeg"),
    gu: new Audio("./assets/audio/Guj.mpeg"),
  };

  Object.values(languageAudios).forEach((audio) => {
    audio.preload = "auto";
  });

  function playLanguageAudio(lang) {
    Object.values(languageAudios).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    const audio = languageAudios[lang];

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  }

  async function loadTranslations() {
    try {
      const res = await fetch("./data.json");

      if (!res.ok) {
        throw new Error("data.json not found");
      }

      translations = await res.json();
    } catch (err) {
      console.error("Translation load failed:", err);
      translations = {};
    }
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

  function updateStaticText() {
    document.querySelectorAll("[data-lang-key]").forEach((el) => {
      const key = el.getAttribute("data-lang-key");

      if (translations?.[currentLang]?.[key] != null) {
        el.textContent = translations[currentLang][key];
      }
    });
  }

  function updateDialogueFromSlide() {
    if (!swiper) return;

    const activeSlide = swiper.slides[swiper.activeIndex];

    if (!activeSlide) return;

    const imgSrc =
      activeSlide.getAttribute("data-dialogue-img") || "./assets/2.png";
    const key1 = activeSlide.getAttribute("data-dialogue-key1") || "";
    const key2 = activeSlide.getAttribute("data-dialogue-key2") || "";

    if (bubbleImg) {
      bubbleImg.src = imgSrc;
    }

    if (overlayText1) {
      overlayText1.textContent = translations?.[currentLang]?.[key1] || "";
    }

    if (overlayText2) {
      overlayText2.textContent = translations?.[currentLang]?.[key2] || "";
    }
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    document.documentElement.lang = lang;
    document.body.setAttribute("data-lang", lang);

    updateStaticText();
    updateDialogueFromSlide();
    setActiveUI(lang);
  }

  function updateNavVisibility() {
    if (!swiper) return;

    if (prevBtn) {
      prevBtn.style.visibility = swiper.isBeginning ? "hidden" : "visible";
    }

    if (nextBtn) {
      nextBtn.style.visibility = swiper.isEnd ? "hidden" : "visible";
    }

    if (pranamLink) {
      if (swiper.isEnd) {
        pranamLink.classList.remove("hidden");
        pranamLink.style.display = "flex";
        pranamLink.style.visibility = "visible";
        pranamLink.style.opacity = "1";
        pranamLink.style.pointerEvents = "auto";
      } else {
        pranamLink.classList.add("hidden");
        pranamLink.style.display = "none";
        pranamLink.style.visibility = "hidden";
        pranamLink.style.opacity = "0";
        pranamLink.style.pointerEvents = "none";
      }
    }
  }

  function pauseAllVideos() {
    document.querySelectorAll(".mySwiper .slide-media").forEach((video) => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (err) {}
    });
  }

  function playActiveVideo() {
    const activeVideo = document.querySelector(
      ".mySwiper .swiper-slide-active .slide-media",
    );

    if (activeVideo && activeVideo.tagName === "VIDEO") {
      try {
        activeVideo.muted = true;
        activeVideo.loop = true;
        activeVideo.currentTime = 0;
        activeVideo.play().catch(() => {});
      } catch (err) {}
    }
  }

  englishButton?.addEventListener("click", () => {
    playLanguageAudio("en");
    applyLanguage("en");
  });

  hindiButton?.addEventListener("click", () => {
    playLanguageAudio("hi");
    applyLanguage("hi");
  });

  gujaratiButton?.addEventListener("click", () => {
    playLanguageAudio("gu");
    applyLanguage("gu");
  });

  await loadTranslations();

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

        slideChangeTransitionEnd() {
          updateDialogueFromSlide();
          dialogueBox?.classList.remove("hide");

          pauseAllVideos();
          playActiveVideo();
        },

        slideChange() {
          updateNavVisibility();
        },
      },
    });

    updateDialogueFromSlide();
    updateNavVisibility();

    pauseAllVideos();
    playActiveVideo();
  }

  applyLanguage(currentLang);
});

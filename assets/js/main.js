document.addEventListener("DOMContentLoaded", () => {

  // Preloader
  function progressBar() {
    $(".progress").each(function () {
      var ctrl = new ScrollMagic.Controller();
      new ScrollMagic.Scene({ triggerElement: ".progress", triggerHook: "onEnter", duration: 300, })
      .addTo(ctrl)
      .on("enter", function () {
        var progressBar = $(".progress-bar");
        progressBar.each(function () {
          $(this).css({ width: $(this).attr("aria-valuenow") + "%", "z-index": "2", });
        });
      });
    });
  }

  // Preloader animation
  function preloader() {
    var tl = anime.timeline({});
    tl.add({ targets: ".loader", duration: 300, opacity: 1, easing: "easeInOutQuart", })
    .add({ targets: ".preloader__progress span", duration: 500, width: "100%", easing: "easeInOutQuart", }, "-=200")
    .add({ targets: ".preloader", duration: 500, opacity: 0, zIndex: -1, easing: "easeInOutQuart",
      complete: function () {
        document.getElementById("loader").classList.add("hide");
        document.getElementById("home").style.display = "block";
        if (typeof initAnimations === "function") {
          initAnimations();
        }
      },
    });
  }

  preloader();

  anime({ targets: "body", opacity: 1, delay: 400,
    complete: function () {
      progressBar();
    },
  });

  function initAnimations() {
    // 1. Counter animation (Count Up)
    function countUp(element, duration = 2000) {
      const target = parseInt(element.textContent);
      if (isNaN(target)) return;
      let start = 0;
      const increment = target / (duration / 16);
      element.textContent = "0";
      const updateCounter = () => {
        start += increment;
        if (start < target) {
          element.textContent = Math.ceil(start);
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target;
        }
      };
      updateCounter();
    }

    function initCountUp(containerSelector, numberSelector = ".counter") {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              document.querySelectorAll(numberSelector).forEach((el) => {
                countUp(el, 2500);
              });
              observer.disconnect();
            }
          });
        }, { threshold: 0.5 });

      const container = document.querySelector(containerSelector);
      if (container) observer.observe(container);
    }
    initCountUp(".profile__info");

    // 2. Skills animation
    const initSkills = () => {
      const skillsSection = document.getElementById("skills");
      const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const progressBars = entry.target.querySelectorAll(".progress-bar");
              progressBars.forEach((progressBar) => {
                progressBar.style.animation = "progressAnimation 3s ease-in-out forwards";
              });
              observer.disconnect();
            }
          });
        }, { threshold: 0.5 });
      skillsSection && observer.observe(skillsSection);
    };
    initSkills();
  }

  // Bottom Navigation Menu
  const bottomMenu = document.querySelector(".nav__menu");
  const menuHideBtn = document.querySelector(".menu-hide-btn");
  const menuShowBtn = document.querySelector(".menu-show-btn");
  let menuTimeout;
  let isHoveringMenu = false;
  checkScrollPosition();
  window.addEventListener("scroll", handleScroll);
  menuHideBtn.addEventListener("click", hideMenuManual);
  menuShowBtn.addEventListener("click", showMenuManual);

  bottomMenu.addEventListener("mouseenter", () => {
    isHoveringMenu = true;
    clearTimeout(menuTimeout);
    if (window.scrollY > 10) {
      menuHideBtn.classList.add("show");
    }
  });

  bottomMenu.addEventListener("mouseleave", () => {
    isHoveringMenu = false;
    if (window.scrollY > 10 && !menuHideBtn.matches(":hover")) {
      menuTimeout = setTimeout(hideMenuAuto, 2500);
    }
  });

  menuHideBtn.addEventListener("mouseenter", () => {
    isHoveringMenu = true;
    clearTimeout(menuTimeout);
  });

  menuHideBtn.addEventListener("mouseleave", () => {
    isHoveringMenu = false;
    if (window.scrollY > 10) {
      menuTimeout = setTimeout(hideMenuAuto, 2500);
    }
  });

  function checkScrollPosition() {
    if (window.scrollY < 10) {
      menuHideBtn.classList.remove("show");
    } else {
      menuHideBtn.classList.add("show");
    }
  }

  function handleScroll() {
    showMenu();
    if (!isHoveringMenu) {
      clearTimeout(menuTimeout);
      menuTimeout = setTimeout(hideMenuAuto, 2500);
    }
  }

  function showMenu() {
    bottomMenu.classList.remove("hide");
    if (window.scrollY > 10) {
      menuHideBtn.classList.add("show");
    }
    menuShowBtn.classList.remove("active");
    checkScrollPosition();
  }

  function hideMenuAuto() {
    if (window.scrollY > 10 && !isHoveringMenu) {
      bottomMenu.classList.add("hide");
      menuHideBtn.classList.remove("show");
      menuShowBtn.classList.add("active");
    }
  }

  function hideMenuManual() {
    bottomMenu.classList.add("hide");
    menuHideBtn.classList.remove("show");
    menuShowBtn.classList.add("active");
    isHoveringMenu = false;
  }

  function showMenuManual() {
    bottomMenu.classList.remove("hide");
    menuShowBtn.classList.remove("active");
    if (window.scrollY > 10) {
      menuHideBtn.classList.add("show");
    }
    if (!isHoveringMenu) {
      clearTimeout(menuTimeout);
      menuTimeout = setTimeout(hideMenuAuto, 2500);
    }
  }

  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 50;
      const sectionId = current.getAttribute("id");
      const link = document.querySelector(`.nav__menu a[href*="${sectionId}"]`);
      link?.classList.toggle( "active-link", scrollY > sectionTop && scrollY <= sectionTop + sectionHeight);
    });
  });

// ==========================================
// THEME TOGGLE - DARK/LIGHT MODE
// ==========================================
(function() {
  const body = document.querySelector("body");
  const themeToggle = document.getElementById("themeToggle");

  // Exit if toggle not found
  if (!themeToggle) return;

  // Load saved theme from localStorage (default: dark)
  const savedTheme = localStorage.getItem("theme") || "dark";

  // Apply theme on page load
  if (savedTheme === "dark") {
    body.classList.add("dark");
    body.classList.remove("light");
    themeToggle.checked = false; // Unchecked = Dark mode (moon + stars)
  } else {
    body.classList.add("light");
    body.classList.remove("dark");
    themeToggle.checked = true; // Checked = Light mode (sun + clouds)
  }

  // Handle toggle change
  themeToggle.addEventListener("change", function() {
    if (this.checked) {
      // Switch to Light mode
      body.classList.add("light");
      body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // Switch to Dark mode
      body.classList.add("dark");
      body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  });
})();



  // Show header when scrolling up
  window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Year display
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Custom cursor
  const elements = document.querySelectorAll("*");
  elements.forEach((element) => {
    const style = window.getComputedStyle(element);
    if (style.cursor === "pointer") {
      element.style.cursor = 'url("./assets/img/mouse/mouse-f2.png"), auto';
    }
  });

// ==========================================
// SCROLLREVEAL ANIMATIONS
// ==========================================
const sr = ScrollReveal({
  origin: 'top',
  distance: '60px',
  duration: 2000,
  delay: 200,
  opacity: 0,
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  reset: true, // ← QUAN TRỌNG: true = biến mất khi scroll ra
  mobile: true,
});

// Profile section
sr.reveal('.profile__border, .profile__name');

sr.reveal('.profile__social, .profile_profession, .profile__info-group, .profile__buttons, .projects__card, .skills__area, .resume__area', { 
  origin: 'bottom' 
});

// Projects note
sr.reveal('.note', { 
  origin: 'left' 
});

// Resume time
sr.reveal('.resume__step__time', { 
  origin: 'right' 
});

// About icons (old style - nếu còn)
sr.reveal('.about__box .icon img', { 
  origin: 'bottom', 
  scale: 0.9, 
  rotate: { z: 45 }, 
  reset: false 
});

// ⬇️⬇️⬇️ THÊM CODE MỚI CHO ABOUT CARDS ⬇️⬇️⬇️

// About Cards - Slide from LEFT
sr.reveal('.card.about-card[data-reveal="left"]', { 
  origin: 'left',
  distance: '100px',
  duration: 1200,
  delay: 200,
  interval: 200, // Cards xuất hiện lần lượt
  reset: true,   // Biến mất khi scroll ra ngoài
  opacity: 0,
  scale: 0.95,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

// About Cards - Slide from RIGHT
sr.reveal('.card.about-card[data-reveal="right"]', { 
  origin: 'right',
  distance: '100px',
  duration: 1200,
  delay: 200,
  interval: 200, // Cards xuất hiện lần lượt
  reset: true,   // Biến mất khi scroll ra ngoài
  opacity: 0,
  scale: 0.95,
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
});

  // Typed.js for typing animation in header
  new Typed(".typing-text", {
    strings: ["<b>Duc Tien</b>", "Programmer", "Developer", "Designer"],
    typeSpeed: 150,
    backSpeed: 100,
    loop: true,
    showCursor: true,
    cursorChar: "|",
    smartBackspace: true,
  });

  // Random Color for .projects__tag
  const colorClasses = [
    'projects__tag--blue', 'projects__tag--green', 'projects__tag--yellow',
    'projects__tag--purple', 'projects__tag--gray', 'projects__tag--red'
  ];
  document.querySelectorAll(".projects__tags").forEach((container) => {
    const tags = container.querySelectorAll(".projects__tag");
    let remainingColors = [...colorClasses];
    tags.forEach((tag) => {
      if (remainingColors.length === 0) remainingColors = [...colorClasses];
      const randomIndex = Math.floor(Math.random() * remainingColors.length);
      const selectedColor = remainingColors[randomIndex];
      tag.classList.add(selectedColor);
      remainingColors.splice(randomIndex, 1);
    });
  });

  // Language switching functionality
  const languageBtn = document.getElementById("languageBtn");
  const elementsToTranslate = document.querySelectorAll("[data-vi]");
  let currentLanguage = localStorage.getItem("language") || "en";
  const languageSound = new Audio("./assets/sounds/language.mp3");
  languageSound.volume = 1.0;

  elementsToTranslate.forEach((element) => {
    if (!element.dataset.original) {
      if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA") && element.hasAttribute("placeholder")) {
        element.dataset.original = element.placeholder;
      } else {
        element.dataset.original = element.innerHTML;
      }
    }
  });

  function applyLanguage(lang, skipSound = false) {
    document.body.classList.remove("language-en", "language-vi");
    document.body.classList.add(`language-${lang}`);
    elementsToTranslate.forEach((element) => {
      if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA") && element.hasAttribute("placeholder")) {
        if (lang === "vi") {
          element.placeholder = element.getAttribute("data-vi");
        } else {
          element.placeholder = element.dataset.original;
        }
        return;
      }

      if (lang === "vi") {
        const viText = element.getAttribute("data-vi");
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = element.dataset.original;
        const icon = tempDiv.querySelector("i");
        const link = tempDiv.querySelector("a");
        let iconHTML = icon?.outerHTML || "";
        let finalHTML = viText.trim();
        if (link) {
          const linkText = link.textContent.trim();
          const newLink = link.cloneNode(true);
          newLink.innerHTML = linkText;
          finalHTML = viText.replace(linkText, newLink.outerHTML);
        }
        if (icon) {
          const textOnly = tempDiv.textContent.replace(icon.textContent, "").trim();
          const originalHTML = tempDiv.innerHTML.trim();
          const iconIndex = originalHTML.indexOf(icon.outerHTML);
          const textIndex = originalHTML.indexOf(textOnly);
          if (iconIndex < textIndex) {
            finalHTML = `${iconHTML} ${finalHTML}`;
          } else {
            finalHTML = `${finalHTML} ${iconHTML}`;
          }
        }
        element.innerHTML = finalHTML.trim();
      } else {
        element.innerHTML = element.dataset.original;
      }
    });

    languageBtn.classList.toggle("vi", lang === "vi");
    localStorage.setItem("language", lang);
    currentLanguage = lang;
    if (!skipSound) {
      languageSound.currentTime = 0;
      languageSound.play().catch(() => {});
    }
  }

  languageBtn.addEventListener("click", () => {
    const newLanguage = currentLanguage === "en" ? "vi" : "en";
    applyLanguage(newLanguage);
  });

  applyLanguage(currentLanguage, true);

  // Functionality for shared popup (for both carousel and certificates)
  const popupOverlay = document.querySelector(".popup__overlay");
  const popupImage = document.querySelector(".popup__image");
  const popupTitle = document.querySelector(".popup__info .popup__title");
  const popupTime = document.querySelector(".popup__info .popup__time");
  const popupIssuer = document.querySelector(".popup__info .popup__issuer");
  const popupDate = document.querySelector(".popup__info .popup__date");
  const popupCaption = document.querySelector(".popup__info .popup__caption");
  const popupClose = document.querySelector(".popup__close");
  const popupPrev = document.querySelector(".popup__prev");
  const popupNext = document.querySelector(".popup__next");
  const popupNavigation = document.querySelector(".popup__navigation");

  // Variables to track current certificate
  let currentCertificateIndex = 0;
  let certificateItems = [];
  let isPhotoMode = false;

  // Handle carousel items (photos)
  const carouselItems = document.querySelectorAll(".carousel__item");
  carouselItems.forEach((item) => {
    item.addEventListener("click", function () {
      const imgElement = this.querySelector("img");
      const titleElement = this.querySelector(".popup__title");
      const timeElement = this.querySelector(".popup__time");
      const captionElement = this.querySelector(".popup__caption");

      // Setup popup for photos
      popupImage.src = imgElement.src;
      popupImage.alt = imgElement.alt;
      popupTitle.textContent = titleElement.textContent;

      // Show photo specific elements, hide certificate elements
      popupTime.textContent = timeElement.textContent;
      popupTime.style.display = "inline-block";
      popupCaption.textContent = captionElement.textContent;
      popupCaption.style.display = "block";
      popupIssuer.style.display = "none";
      popupDate.style.display = "none";

      // Hide navigation for photos
      popupNavigation.classList.add("photo-mode");
      isPhotoMode = true;

      popupOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Handle certificate items
  certificateItems = document.querySelectorAll(".certificate__item");
  certificateItems.forEach((item, index) => {
    item.addEventListener("click", function () {
      const imgElement = this.querySelector("img");
      const titleElement = this.querySelector(".certificate__title");
      const issuerElement = this.querySelector(".certificate__issuer");
      const dateElement = this.querySelector(".certificate__date");

      // Save current certificate index
      currentCertificateIndex = index;

      // Setup popup for certificates
      updateCertificatePopup( imgElement, titleElement, issuerElement, dateElement );

      // Show navigation for certificates
      popupNavigation.classList.remove("photo-mode");
      isPhotoMode = false;

      popupOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Function to update certificate popup content
  function updateCertificatePopup( imgElement, titleElement, issuerElement, dateElement ) {
    popupImage.src = imgElement.src;
    popupImage.alt = imgElement.alt;
    popupTitle.textContent = titleElement.textContent;

    // Show certificate specific elements, hide photo elements
    popupIssuer.textContent = issuerElement.textContent;
    popupDate.textContent = dateElement.textContent;
    popupIssuer.style.display = "inline-block";
    popupDate.style.display = "inline-block";
    popupTime.style.display = "none";
    popupCaption.style.display = "none";
  }

  // Navigate to previous certificate
  popupPrev.addEventListener("click", function () {
    if (isPhotoMode) return;

    currentCertificateIndex = (currentCertificateIndex - 1 + certificateItems.length) % certificateItems.length;
    const item = certificateItems[currentCertificateIndex];

    const imgElement = item.querySelector("img");
    const titleElement = item.querySelector(".certificate__title");
    const issuerElement = item.querySelector(".certificate__issuer");
    const dateElement = item.querySelector(".certificate__date");

    updateCertificatePopup( imgElement, titleElement, issuerElement, dateElement );
  });

  // Navigate to next certificate
  popupNext.addEventListener("click", function () {
    if (isPhotoMode) return;

    currentCertificateIndex = (currentCertificateIndex + 1) % certificateItems.length;
    const item = certificateItems[currentCertificateIndex];

    const imgElement = item.querySelector("img");
    const titleElement = item.querySelector(".certificate__title");
    const issuerElement = item.querySelector(".certificate__issuer");
    const dateElement = item.querySelector(".certificate__date");

    updateCertificatePopup( imgElement, titleElement, issuerElement, dateElement );
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (popupOverlay.classList.contains("active") && !isPhotoMode) {
      if (e.key === "ArrowLeft") {
        popupPrev.click();
      } else if (e.key === "ArrowRight") {
        popupNext.click();
      }
    }

    // Close popup with Escape key
    if (e.key === "Escape" && popupOverlay.classList.contains("active")) {
      popupOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Close popup
  popupClose.addEventListener("click", function () {
    popupOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  popupOverlay.addEventListener("click", function (e) {
    if (e.target === popupOverlay) {
      popupOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });


  // ==========================================
// CAROUSEL & CERTIFICATES ANIMATIONS (SMOOTH & COOL)
// ==========================================

// 1. ScrollReveal cho carousel items (3 ảnh blog)
sr.reveal('.carousel__item', { 
  origin: 'bottom',
  distance: '50px',
  duration: 1000,
  delay: 300,
  interval: 200, // Xuất hiện lần lượt
  reset: true,   // Biến mất khi scroll ra, xuất hiện lại khi vào
  opacity: 0,
  scale: 0.9,
  easing: 'easeOutExpo'
});

// 2. ScrollReveal cho certificate items (4 ảnh chứng chỉ)
sr.reveal('.certificate__item', { 
  origin: 'bottom',
  distance: '50px',
  duration: 1000,
  delay: 300,
  interval: 150, // Xuất hiện lần lượt
  reset: true,   // Biến mất khi scroll ra, xuất hiện lại khi vào
  opacity: 0,
  scale: 0.9,
  easing: 'easeOutExpo'
});

// 3. Auto-slide cho blog carousel (3 ảnh) - Smooth transition
(function() {
  const carouselItems = document.querySelectorAll('.carousel__item');
  const totalItems = carouselItems.length;
  let currentIndex = 0;
  let autoSlideInterval;

  // Tạo indicator dots
  const carouselWrapper = document.querySelector('.carousel__wrapper');
  const indicators = document.createElement('div');
  indicators.className = 'carousel-indicators';
  indicators.style.cssText = `
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 10px; z-index: 10;
  `;
  carouselWrapper.appendChild(indicators);

  for (let i = 0; i < totalItems; i++) {
    const dot = document.createElement('div');
    dot.className = 'indicator-dot';
    dot.style.cssText = `
      width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.5);
      cursor: pointer; transition: background 0.3s ease;
    `;
    dot.addEventListener('click', () => goToSlide(i));
    indicators.appendChild(dot);
  }

  const dots = document.querySelectorAll('.indicator-dot');

  function updateIndicators() {
    dots.forEach((dot, index) => {
      dot.style.background = index === currentIndex ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)';
    });
  }

  function goToSlide(index) {
    // Fade out current
    carouselItems[currentIndex].style.opacity = '0';
    // Fade in new
    setTimeout(() => {
      carouselItems.forEach(item => item.style.display = 'none');
      carouselItems[index].style.display = 'block';
      carouselItems[index].style.opacity = '1';
      currentIndex = index;
      updateIndicators();
    }, 300); // Transition time
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % totalItems;
    goToSlide(nextIndex);
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 5000); // 5 giây
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  // Init
  carouselItems.forEach(item => {
    item.style.transition = 'opacity 0.3s ease';
    item.style.display = 'none';
  });
  carouselItems[0].style.display = 'block';
  carouselItems[0].style.opacity = '1';
  updateIndicators();
  startAutoSlide();

  // Pause on hover
  carouselWrapper.addEventListener('mouseenter', stopAutoSlide);
  carouselWrapper.addEventListener('mouseleave', startAutoSlide);
})();

// 4. Hover effect cho carousel items (zoom nhẹ)
document.querySelectorAll('.carousel__item img').forEach(img => {
  img.style.transition = 'transform 0.3s ease';
  img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
  img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
});

// 5. Hover effect cho certificate items (scale up)
document.querySelectorAll('.certificate__item img').forEach(img => {
  img.style.transition = 'transform 0.3s ease';
  img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.1)');
  img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
});

// 6. Animate popup open/close (fade in/out cho cả carousel và certificates)
const originalPopupClose = popupClose.onclick; // Backup original
popupClose.onclick = function() {
  // Fade out popup
  popupOverlay.style.transition = 'opacity 0.3s ease';
  popupOverlay.style.opacity = '0';
  setTimeout(() => {
    popupOverlay.classList.remove("active");
    popupOverlay.style.opacity = '1'; // Reset for next open
    document.body.style.overflow = "";
  }, 300);
  if (originalPopupClose) originalPopupClose.call(this);
};

// Animate popup open
function animatePopupOpen() {
  popupOverlay.style.opacity = '0';
  popupOverlay.classList.add("active");
  setTimeout(() => {
    popupOverlay.style.transition = 'opacity 0.3s ease';
    popupOverlay.style.opacity = '1';
  }, 10); // Small delay để transition work
}

// Hook vào popup open events
const originalCarouselClick = carouselItems.forEach(item => item.onclick); // Backup
carouselItems.forEach(item => {
  item.onclick = function() {
    animatePopupOpen();
    // Gọi logic gốc
    const imgElement = this.querySelector("img");
    const titleElement = this.querySelector(".popup__title");
    const timeElement = this.querySelector(".popup__time");
    const captionElement = this.querySelector(".popup__caption");
    popupImage.src = imgElement.src;
    popupImage.alt = imgElement.alt;
    popupTitle.textContent = titleElement.textContent;
    popupTime.textContent = timeElement.textContent;
    popupCaption.textContent = captionElement.textContent;
    popupTime.style.display = "inline-block";
    popupCaption.style.display = "block";
    popupIssuer.style.display = "none";
    popupDate.style.display = "none";
    popupNavigation.classList.add("photo-mode");
    isPhotoMode = true;
    document.body.style.overflow = "hidden";
  };
});

const originalCertificateClick = certificateItems.forEach(item => item.onclick); // Backup
certificateItems.forEach((item, index) => {
  item.onclick = function() {
    animatePopupOpen();
    // Gọi logic gốc
    const imgElement = this.querySelector("img");
    const titleElement = this.querySelector(".certificate__title");
    const issuerElement = this.querySelector(".certificate__issuer");
    const dateElement = this.querySelector(".certificate__date");
    currentCertificateIndex = index;
    updateCertificatePopup(imgElement, titleElement, issuerElement, dateElement);
    popupNavigation.classList.remove("photo-mode");
    isPhotoMode = false;
    document.body.style.overflow = "hidden";
  };
});

// 7. Smooth transition cho certificate popup prev/next
const originalPopupPrev = popupPrev.onclick;
popupPrev.onclick = function() {
  if (isPhotoMode) return;
  // Fade out current image
  popupImage.style.transition = 'opacity 0.3s ease';
  popupImage.style.opacity = '0';
  setTimeout(() => {
    if (originalPopupPrev) originalPopupPrev.call(this);
    // Fade in new image
    setTimeout(() => {
      popupImage.style.opacity = '1';
    }, 10);
  }, 300);
};

const originalPopupNext = popupNext.onclick;
popupNext.onclick = function() {
  if (isPhotoMode) return;
  // Fade out current image
  popupImage.style.transition = 'opacity 0.3s ease';
  popupImage.style.opacity = '0';
  setTimeout(() => {
    if (originalPopupNext) originalPopupNext.call(this);
    // Fade in new image
    setTimeout(() => {
      popupImage.style.opacity = '1';
    }, 10);
  }, 300);
};

  // Star animation
  // function initStarAnimation() {
  //     const starsContainer = document.querySelector(".stars-container");
  //     if (!starsContainer) return;
  //     const NUM_STARS = 120;
  //     const MAX_MOVEMENT = 200;
  //     const MIN_DURATION = 10;
  //     const MAX_DURATION = 20;
  //     setTimeout(() => {
  //         let bodyWidth = document.body.scrollWidth;
  //         let bodyHeight = document.body.scrollHeight;
  //         const fragment = document.createDocumentFragment();
  //         for (let i = 0; i < NUM_STARS; i++) {
  //             const star = document.createElement("div");
  //             star.className = "star";
  //             const size = Math.random() * 2 + 1;
  //             star.style.width = `${size}px`;
  //             star.style.height = `${size}px`;
  //             star.style.left = `${Math.random() * bodyWidth}px`;
  //             star.style.top = `${Math.random() * bodyHeight}px`;
  //             const moveX = (Math.random() - 0.5) * MAX_MOVEMENT;
  //             const moveY = (Math.random() - 0.5) * MAX_MOVEMENT;
  //             const duration = Math.random() * (MAX_DURATION - MIN_DURATION) + MIN_DURATION;
  //             star.style.setProperty('--move-x', `${moveX}px`);
  //             star.style.setProperty('--move-y', `${moveY}px`);
  //             star.style.animationDuration = `${duration}s`;
  //             star.addEventListener('animationiteration', function() {
  //                 this.style.left = `${Math.random() * document.body.scrollWidth}px`;
  //                 this.style.top = `${Math.random() * document.body.scrollHeight}px`;
  //                 const newMoveX = (Math.random() - 0.5) * MAX_MOVEMENT;
  //                 const newMoveY = (Math.random() - 0.5) * MAX_MOVEMENT;
  //                 this.style.setProperty('--move-x', `${newMoveX}px`);
  //                 this.style.setProperty('--move-y', `${newMoveY}px`);
  //             });
  //             fragment.appendChild(star);
  //         }
  //         starsContainer.appendChild(fragment);
  //         const resizeObserver = new ResizeObserver(() => {
  //             bodyWidth = document.body.scrollWidth;
  //             bodyHeight = document.body.scrollHeight;
  //             starsContainer.style.height = `${bodyHeight}px`;
  //         });
  //         resizeObserver.observe(document.body);
  //     }, 500);
  // }
  // setTimeout(initStarAnimation, 300);

  // Initialize EmailJS with contact form
  document.getElementById("contact-form").addEventListener("submit", function (event) {
      event.preventDefault();

      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        Swal.fire({
          icon: "warning",
          title: "Vui lòng xác minh!",
          text: "Bạn cần xác minh reCAPTCHA trước khi gửi.",
          confirmButtonText: "OK",
        });
        return;
      }

      const now = new Date();
      const timeString = now.toLocaleString("vi-VN").replace(",", "");
      document.getElementById("time").value = timeString;
      document.getElementById("page-url").value = window.location.hostname;

      const submitButton = this.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG GỬI...';

      emailjs.sendForm("service_m3j08qf", "dtcontact", this).then(function (response) {
          Swal.fire({
            icon: "success",
            title: "Thành công!",
            text: "Tin nhắn đã được gửi thành công!",
            showConfirmButton: false,
            timer: 1500,
          });
          document.getElementById("contact-form").reset();
          grecaptcha.reset(); // reset reCAPTCHA sau khi gửi
        })
        .catch(function (error) {
          Swal.fire({
            icon: "error",
            title: "Lỗi!",
            text: "Không gửi được tin nhắn. Vui lòng thử lại.",
            confirmButtonText: "OK",
          });
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        });
    });

  // Chatbot functionality
  const chatBody = document.querySelector(".chat-body");
  const messageInput = document.querySelector(".message-input");
  const sendMessageButton = document.querySelector("#send-message");
  const fileInput = document.querySelector("#file-input");
  const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
  const fileCancelButton = document.querySelector("#file-cancel");
  const chatbotToggler = document.querySelector("#chatbot-toggler");
  const closeChatbot = document.querySelector("#close-chatbot");
  const scrollToBottomBtn = document.querySelector("#scroll-to-bottom");
  const API_KEY = "AIzaSyAmudee2bOPCIa2YbY4FO82GHnwmMGFiyQ";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  const userData = {
    message: null,
    file: {
      data: null,
      mime_type: null,
    },
  };

  let isAutoScrolling = false;
  let isScrollingToBottomRequested = false;
  let isBotResponding = false;

  function updateSendButtonState() {
    const isValidMessage = messageInput.value.trim().length > 0;
    sendMessageButton.style.display = isValidMessage && !isBotResponding ? "block" : "none";
    sendMessageButton.disabled = isBotResponding;
  }

  chatBody.addEventListener("scroll", () => {
    if (isScrollingToBottomRequested) {
      scrollToBottomBtn.classList.remove("show");
      return;
    }

    if (!isAutoScrolling) {
      const isScrolledToBottom = chatBody.scrollHeight - chatBody.scrollTop <= chatBody.clientHeight + 100;
      if (!isScrolledToBottom) {
        scrollToBottomBtn.classList.add("show");
      } else {
        scrollToBottomBtn.classList.remove("show");
      }
    }
  });

  scrollToBottomBtn.addEventListener("click", () => {
    scrollToBottomBtn.classList.remove("show");
    isAutoScrolling = true;
    isScrollingToBottomRequested = true;

    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: "smooth",
    });

    setTimeout(() => {
      isAutoScrolling = false;
      setTimeout(() => {
        isScrollingToBottomRequested = false;
      }, 100);
    }, 500);
  });

  const chatHistory = [
  {
    role: "model",
    parts: [{
      text: `Giới thiệu:

Chào mừng bạn đến với trợ lý ảo được xây dựng dựa trên thông tin về Chu Đức Tiến, một tài năng trẻ đầy triển vọng trong lĩnh vực Công nghệ Thông tin. Chatbot này được tạo ra để cung cấp cho bạn cái nhìn toàn diện về con người, hành trình học tập, những kỹ năng chuyên môn ấn tượng và vô số dự án sáng tạo mà Tiến đã và đang thực hiện. Hãy khám phá thế giới công nghệ đầy đam mê của Tiến qua những thông tin chi tiết dưới đây.

Chi tiết:

Sinh ra và lớn lên tại mảnh đất Hà Nội giàu truyền thống, Chu Đức Tiến từ nhỏ đã sớm bộc lộ sự tò mò và niềm yêu thích đặc biệt đối với các thiết bị điện tử. Những món đồ quen thuộc trong gia đình như chiếc vợt bắt muỗi phát ra tia điện, chiếc máy cassette cũ kỹ, hay những chiếc điện thoại "cục gạch" bền bỉ đã trở thành nguồn cảm hứng bất tận, thôi thúc Tiến khám phá cấu trúc bên trong và nguyên lý hoạt động kỳ diệu của chúng.

Bước ngoặt thực sự đến với Tiến vào những năm cấp 2, đặc biệt là trong khoảng thời gian dịch COVID-19. Khi có nhiều thời gian ở nhà, Tiến bắt đầu tự học lập trình web và khám phá mọi thứ khiến bản thân tò mò – từ những trang web đơn giản cho đến vọc điện thoại, như root máy hay cài custom ROM cho Android. Nhờ sự hướng dẫn tận tình từ nhiều anh chị đi trước, Tiến đã học hỏi được nhiều kiến thức quý giá và tích lũy kinh nghiệm thông qua các dự án nhỏ như xây dựng website cá nhân hay các công cụ tiện ích cho cộng đồng.

Tiến có niềm đam mê lớn với công nghệ và lập trình. Ngoài lập trình, Tiến còn thích chơi thể thao (đặc biệt là bóng đá), khám phá công nghệ mới, giao lưu với mọi người để mở rộng mối quan hệ, và du lịch, hòa mình với thiên nhiên.

Kinh nghiệm:

- Developer: phát triển các công cụ tiện ích, bot Discord, chia sẻ kiến thức đến cộng đồng.
- Script & Bot Developer: thiết kế và tối ưu hóa script, bot trên nhiều nền tảng.
- Tech Innovator: thử nghiệm công nghệ mới, từ lập trình web, AI đến các công cụ tiện ích cho cộng đồng.

Các kỹ năng của Tiến:

- Lập trình Front-end: HTML5, CSS3, JavaScript (ES6), sử dụng Tailwind CSS và Bootstrap.
- Lập trình Back-end: PHP, JavaScript, Python cho web scraping và tự động hóa.
- Cơ sở dữ liệu: MySQL, MongoDB, SQLite; bảo mật SSL cơ bản.
- Công cụ thiết kế: Figma, Photoshop; VS Code; Git/GitHub.
- Ngôn ngữ khác: C/C++, Java, Pascal, Shell scripting.

Chu Đức Tiến luôn ý thức được ưu nhược điểm của bản thân: tò mò, ham học hỏi, cởi mở, nhưng đôi khi dễ mất tập trung hoặc rơi vào "nỗ lực ảo". Tiến đang nỗ lực từng ngày để trở thành phiên bản tốt hơn của chính mình.

Chứng chỉ:

- Google AI (2025)
- Foundations: Data, Data Everywhere (2025)
- Advanced Commands Linux (2025)
- Google AI Essentials (2025)

Các dự án và cộng đồng:

- Website cá nhân và các ứng dụng tiện ích.
- Bot Telegram tự động hóa, API tải video TikTok/Facebook, web chuyển đổi mã 2FA.
- Chrome Extension hỗ trợ đánh giá giảng viên, công cụ tạo QR Code, dự báo thời tiết trực tuyến.

Mạng xã hội:

- Facebook: facebook.com/chuductien
- X (Twitter): x.com/chuductien
- Instagram: instagram.com/chuductien
- YouTube: youtube.com/@chuductien
- GitHub: github.com/chuductien
- Telegram: t.me/chuductien
- Telegram Group: t.me/tienich

Với tinh thần sáng tạo, tự học và chia sẻ, Chu Đức Tiến không chỉ phát triển kỹ năng cá nhân mà còn đóng góp tích cực cho cộng đồng công nghệ. Chatbot này sẵn sàng cung cấp thông tin chi tiết về các kỹ năng, dự án và tầm nhìn của Tiến.`
    }]
  },
];

  
  // const chatHistory = [];
  const initialInputHeight = messageInput.scrollHeight;

  const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  };

  const notificationSound = new Audio( "./assets/sounds/notification-sound-effect.mp3" );
  notificationSound.volume = 1.0;

  function markdownToHTML(text) {
    if (!text) return "";
    let html = text
      // Code block (```lang\n...\n```)
      .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const safeCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<pre><code class="language-${lang || ""}">${safeCode}</code></pre>`;
      })
      .replace(/`([^`]+)`/g, "<code>$1</code>") // Inline code (phải đặt sau code block)
      .replace(/^###### (.*$)/gm, "<h6>$1</h6>") // Tiêu đề
      .replace(/^##### (.*$)/gm, "<h5>$1</h5>")
      .replace(/^#### (.*$)/gm, "<h4>$1</h4>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^\d+\. (.*$)/gm, "<li>$1</li>") // Danh sách có thứ tự
      .replace(/^[-*] (.*$)/gm, "<li>$1</li>") // Danh sách không thứ tự
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // In đậm
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // In nghiêng
      .replace(/~~(.*?)~~/g, "<del>$1</del>") // Gạch ngang
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>') // Link
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;"/>') // Hình ảnh
      .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>") // Blockquote
      .replace(/^\-\-\-$/gm, "<hr/>"); // Horizontal rule
    html = html.replace(/(<li>.*<\/li>)+/gms, (m) => {
      if (m.includes("<ol>") || m.includes("<ul>")) return m;
      return m.trim().startsWith("<li>1.") ? `<ol>${m}</ol>` : `<ul>${m}</ul>`;
    });
    html = html
      .replace(/\n{2,}/g, "</p><p>") // Đoạn mới
      .replace(/\n/g, "<br/>") // Xuống dòng trong đoạn
      .replace(/(^|<\/[^>]+>)([^<]*?)(<[^>]+>|$)/g, (m, p1, p2, p3) => {
        if (!p2.trim()) return m;
        const isBlockElement = /<\/?(h[1-6]|pre|code|ul|ol|li|blockquote|hr)/i.test(p1 + p3);
        return isBlockElement ? m : p1 + "<p>" + p2 + "</p>" + p3;
      });
    return html;
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatTime(date = new Date()) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const generateBotResponse = async (incomingMessageDiv) => {
    isBotResponding = true;
    updateSendButtonState();
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    chatHistory.push({
      role: "user",
      parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])],
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory,
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);
      let apiResponseText = data.candidates[0].content.parts[0].text;
      apiResponseText = apiResponseText.replace(/\n+$/, "");
      let htmlResponse = "";

      if (/<[a-z][\s\S]*>/i.test(apiResponseText)) {
        htmlResponse = markdownToHTML(escapeHTML(apiResponseText));
      } else {
        htmlResponse = markdownToHTML(apiResponseText);
      }

      notificationSound.currentTime = 0;
      notificationSound.play().catch(() => {});
      messageElement.innerHTML = `${htmlResponse}<span class="message-time">${formatTime()}</span>`;

      chatHistory.push({
        role: "model",
        parts: [{ text: apiResponseText }],
      });
    } catch (error) {
      messageElement.innerText = error.message;
      messageElement.style.color = "#ff0000";
    } finally {
      isBotResponding = false;
      updateSendButtonState();
      userData.file = {};
      incomingMessageDiv.classList.remove("thinking");
      isAutoScrolling = true;
      isScrollingToBottomRequested = true;
      scrollToBottomBtn.classList.remove("show");
      chatBody.scrollTo({ behavior: "smooth", top: chatBody.scrollHeight });

      setTimeout(() => {
        isAutoScrolling = false;
        setTimeout(() => {
          isScrollingToBottomRequested = false;
        }, 100);
      }, 500);
    }
  };

  const handleOutgoingMessage = (e) => {
    e.preventDefault();
    if (isBotResponding) return;
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));
    const messageContent = `<div class="message-text"></div>
                              ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").innerHTML = `${userData.message}<span class="message-time">${formatTime()}</span>`;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                      <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                  </svg>
                  <div class="message-text">
                      <div class="thinking-indicator">
                          <div class="dot"></div>
                          <div class="dot"></div>
                          <div class="dot"></div>
                      </div>
                  </div>`;
      const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
      chatBody.appendChild(incomingMessageDiv);
      chatBody.scrollTo({ behavior: "smooth", top: chatBody.scrollHeight });
      isAutoScrolling = true;
      isScrollingToBottomRequested = true;
      scrollToBottomBtn.classList.remove("show");
      chatBody.scrollTo({ behavior: "smooth", top: chatBody.scrollHeight });

      setTimeout(() => {
        isAutoScrolling = false;
        isScrollingToBottomRequested = false;
      }, 500);
      generateBotResponse(incomingMessageDiv);
    }, 600);
  };

  messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768 && !isBotResponding) {
      handleOutgoingMessage(e);
    }
  });

  messageInput.addEventListener("input", (e) => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
    updateSendButtonState();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      fileUploadWrapper.querySelector("img").src = e.target.result;
      fileUploadWrapper.classList.add("file-uploaded");
      const base64String = e.target.result.split(",")[1];
      userData.file = {
        data: base64String,
        mime_type: file.type,
      };
      fileInput.value = "";
    };
    reader.readAsDataURL(file);
  });

  fileCancelButton.addEventListener("click", (e) => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
  });

  const picker = new EmojiMart.Picker({
    theme: "auto",
    showSkinTones: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
      const { selectionStart: start, selectionEnd: end } = messageInput;
      messageInput.setRangeText(emoji.native, start, end, "end");
      messageInput.focus();
      updateSendButtonState();
    },
    onClickOutside: (e) => {
      if (e.target.id === "emoji-picker") {
        document.body.classList.toggle("show-emoji-picker");
      } else {
        document.body.classList.remove("show-emoji-picker");
      }
    },
  });

  document.querySelector(".chat-form").appendChild(picker);
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!validImageTypes.includes(file.type)) {
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)",
        confirmButtonText: "OK",
      });
      resetFileInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      fileUploadWrapper.querySelector("img").src = e.target.result;
      fileUploadWrapper.classList.add("file-uploaded");
      const base64String = e.target.result.split(",")[1];
      userData.file = {
        data: base64String,
        mime_type: file.type,
      };
    };
    reader.readAsDataURL(file);
  });

  function resetFileInput() {
    fileInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    fileUploadWrapper.querySelector("img").src = "#";
    userData.file = { data: null, mime_type: null };
    document.querySelector(".chat-form").reset();
  }

  sendMessageButton.addEventListener("click", (e) => {
    if (!isBotResponding) {
      handleOutgoingMessage(e);
    }
  });

  document.querySelector("#file-upload").addEventListener("click", (e) => fileInput.click());
  chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
  closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
});

// ==========================================
// SCROLLREVEAL ANIMATIONS
// ==========================================
const sr = ScrollReveal({
  origin: 'top',
  distance: '60px',
  duration: 2000,
  delay: 200,
  opacity: 0,  // Thêm để fade in/out mượt mà
  easing: 'cubic-bezier(0.5, 0, 0, 1)',
  reset: true, // QUAN TRỌNG: Biến mất khi scroll ra, xuất hiện lại khi vào lại
  mobile: true,
});

// Profile section (giữ nguyên)
sr.reveal('.profile__border, .profile__name');

// Các phần khác (giữ nguyên)
sr.reveal('.profile__social, .profile_profession, .profile__info-group, .profile__buttons, .projects__card, .skills__area, .resume__area', { 
  origin: 'bottom' 
});

// Projects note (giữ nguyên)
sr.reveal('.note', { 
  origin: 'left' 
});

// Resume time (giữ nguyên)
sr.reveal('.resume__step__time', { 
  origin: 'right' 
});

// About icons (old style - nếu còn)
sr.reveal('.about__box .icon img', { 
  origin: 'bottom', 
  scale: 0.9, 
  rotate: { z: 45 }, 
  reset: false 
});

// ⬇️⬇️⬇️ SỬA CHO ABOUT CARDS ⬇️⬇️⬇️
// About Cards - Slide từ LEFT (xuất hiện từ trái, biến mất về trái)
sr.reveal('.card.about-card[data-reveal="left"]', { 
  origin: 'left',       // Slide từ trái vào
  distance: '100px',    // Khoảng cách slide
  duration: 1200,       // Thời gian animation
  delay: 200,           // Delay ban đầu
  interval: 200,        // Cards xuất hiện lần lượt (stagger)
  reset: true,          // Biến mất khi scroll ra, xuất hiện lại khi vào lại
  opacity: 0,           // Fade in/out mượt mà
  scale: 0.95,          // Nhẹ scale để mượt hơn
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Easing mượt
});

// About Cards - Slide từ RIGHT (xuất hiện từ phải, biến mất về phải)
sr.reveal('.card.about-card[data-reveal="right"]', { 
  origin: 'right',      // Slide từ phải vào
  distance: '100px',    // Khoảng cách slide
  duration: 1200,       // Thời gian animation
  delay: 200,           // Delay ban đầu
  interval: 200,        // Cards xuất hiện lần lượt (stagger)
  reset: true,          // Biến mất khi scroll ra, xuất hiện lại khi vào lại
  opacity: 0,           // Fade in/out mượt mà
  scale: 0.95,          // Nhẹ scale để mượt hơn
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Easing mượt
});

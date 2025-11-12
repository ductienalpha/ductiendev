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

  // Toggle dark/light mode
  const body = document.querySelector("body");
  const modeToggle = document.querySelector(".dark-light");
  const themeToggle = document.getElementById("themeToggle");
  const savedMode = localStorage.getItem("mode");
  const switchOnSound = new Audio("./assets/sounds/switch-on.mp3");
  const switchOffSound = new Audio("./assets/sounds/switch-off.mp3");
  switchOnSound.volume = 1.0;
  switchOffSound.volume = 1.0;

  const toggleMode = (isDark, skipSound = false) => {
    const wasDark = body.classList.contains("dark");
    body.classList.toggle("dark", isDark);
    modeToggle.classList.toggle("active", isDark);
    themeToggle.checked = isDark;
    localStorage.setItem("mode", isDark ? "dark-mode" : "light-mode");
    if (!skipSound && wasDark !== isDark) {
      const sound = isDark ? switchOffSound : switchOnSound;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }
  };

  if (savedMode === "dark-mode") {
    toggleMode(true, true);
  } else {
    themeToggle.checked = false;
  }

  modeToggle.addEventListener("click", () => {
    toggleMode(!body.classList.contains("dark"));
  });

  themeToggle.addEventListener("change", function () {
    toggleMode(this.checked);
  });

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

  // ScrollReveal animations
  const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
    opacity: 0,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
    reset: true,
    mobile: true,
  });
  sr.reveal(`.profile__border, .profile__name`);
  sr.reveal(`.profile__social, .profile_profession, .profile__info-group, .profile__buttons, .projects__card, .skills__area, .resume__area`, { origin: 'bottom' });
  sr.reveal(`.note`, { origin: 'left' });
  sr.reveal(`.resume__step__time`, { origin: 'right' });
  sr.reveal(`.about__box .icon img`, { origin: 'bottom', scale: 0.9, rotate: { z: 45 }, reset: false });

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
      parts: [{text: `Giới thiệu:

  Chào mừng bạn đến với trợ lý ảo được xây dựng dựa trên thông tin về Đinh Duy Vinh, một tài năng trẻ đầy triển vọng trong lĩnh vực Công nghệ Thông tin. Tôi được tạo ra để cung cấp cho bạn cái nhìn toàn diện về con người, hành trình học tập, những kỹ năng chuyên môn ấn tượng và vô số dự án sáng tạo mà Vinh đã và đang thực hiện. Hãy khám phá thế giới công nghệ đầy đam mê của Vinh qua những thông tin chi tiết dưới đây.

  Chi tiết:

  Sinh ra và lớn lên tại mảnh đất Quảng Ngãi giàu truyền thống, Đinh Duy Vinh từ nhỏ đã sớm bộc lộ sự tò mò và niềm yêu thích đặc biệt đối với các thiết bị điện tử. Những món đồ quen thuộc trong gia đình như chiếc vợt bắt muỗi phát ra tia điện, chiếc máy cassette cũ kỹ với những cuộn băng nhạc, hay những chiếc điện thoại "cục gạch" bền bỉ đã trở thành nguồn cảm hứng bất tận, thôi thúc Vinh khám phá cấu trúc bên trong và nguyên lý hoạt động kỳ diệu của chúng.

  Bước ngoặt thực sự đến với Vinh vào những năm cuối cấp ba, khi đại dịch COVID-19 ập đến, mang theo những thay đổi lớn trong cuộc sống. Trong khoảng thời gian giãn cách xã hội, thay vì cảm thấy nhàm chán, Vinh đã tìm thấy một cơ hội quý giá để khám phá thế giới lập trình. Anh tự mày mò học HTML và CSS thông qua các khóa học trực tuyến miễn phí, đặt nền móng cho hành trình chinh phục những dòng code. Sự đam mê và tinh thần tự học không ngừng đã dẫn lối Vinh đến với JavaScript và PHP, mở ra những cánh cửa mới trong thế giới phát triển web.

  Những dự án nhỏ ban đầu chính là "sân tập" lý tưởng để Vinh rèn luyện kỹ năng và hiện thực hóa những kiến thức đã học. Từ việc xây dựng một trang web cá nhân đơn giản, nơi anh chia sẻ những suy nghĩ và sở thích, đến việc phát triển những công cụ nhỏ nhưng hữu ích cho cộng đồng, mỗi dự án đều là một bước tiến quan trọng trên con đường trở thành một lập trình viên chuyên nghiệp. Những trải nghiệm thực tế này không chỉ củng cố kiến thức mà còn nuôi dưỡng ngọn lửa đam mê công nghệ trong trái tim Vinh.

  Khi chính thức trở thành sinh viên ngành Công nghệ Thông tin tại Đại học Duy Tân, Đà Nẵng, Vinh nhanh chóng chứng minh được năng lực và sự nhiệt huyết của mình. Anh không chỉ là một sinh viên chăm chỉ mà còn là một lập trình viên đa năng, có khả năng thích ứng và học hỏi nhanh chóng. Với thế mạnh ở mảng Back end, Vinh tự tin làm chủ ngôn ngữ PHP (90%), sử dụng nó để thiết kế và xây dựng các API mạnh mẽ, đảm bảo khả năng giao tiếp và trao đổi dữ liệu hiệu quả giữa các hệ thống. Anh cũng có kinh nghiệm sâu sắc trong việc xử lý dữ liệu, từ việc lưu trữ, truy vấn đến phân tích và tối ưu hóa. Bên cạnh đó, Vinh còn thành thạo tích hợp các công cụ như cURL để làm việc với các dịch vụ web khác và JSON để trao đổi dữ liệu một cách linh hoạt.

  Python (80%) cũng là một công cụ quan trọng trong "hộp đồ nghề" của Vinh. Anh sử dụng Python một cách hiệu quả cho các tác vụ web scraping, giúp thu thập dữ liệu từ các trang web một cách tự động, tự động hóa các quy trình lặp đi lặp lại, tiết kiệm thời gian và công sức, và xử lý dữ liệu phức tạp một cách nhanh chóng và chính xác.

  Về quản lý dữ liệu, Vinh có kiến thức vững chắc về các hệ quản trị cơ sở dữ liệu phổ biến như MySQL, một hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ; MongoDB, một cơ sở dữ liệu NoSQL linh hoạt; và SQLite, một cơ sở dữ liệu nhẹ nhàng, phù hợp cho các ứng dụng nhỏ và di động. Anh cũng hiểu rõ tầm quan trọng của bảo mật SSL và có khả năng triển khai các biện pháp bảo mật cơ bản để bảo vệ dữ liệu và thông tin trên các ứng dụng web của mình.

  Không chỉ tập trung vào "phía sau hậu trường", Vinh còn thể hiện sự linh hoạt và khả năng sáng tạo ở mảng Front end. Anh thành thạo bộ ba nền tảng của web là HTML5, CSS3 và JavaScript (ES6), cho phép anh xây dựng những trang web có cấu trúc rõ ràng, giao diện đẹp mắt và tương tác mượt mà. Để tăng tốc quá trình phát triển giao diện, Vinh còn sử dụng thành thạo các framework và thư viện hiện đại như Tailwind CSS, một framework CSS utility-first giúp tạo giao diện nhanh chóng và tùy biến cao, và Bootstrap, một framework CSS phổ biến với nhiều thành phần UI dựng sẵn.

  Để hiện thực hóa những ý tưởng thiết kế độc đáo, Vinh còn sử dụng thành thạo Figma (30%) và Photoshop, từ việc tạo wireframe, prototype đến thiết kế giao diện người dùng (UI) và trải nghiệm người dùng (UX) trực quan và hấp dẫn.

  "Bộ sưu tập" ngôn ngữ lập trình của Vinh không dừng lại ở đó. Anh còn có kiến thức và kinh nghiệm làm việc với C/C++, nền tảng cho nhiều hệ thống và ứng dụng hiệu suất cao; Java, một ngôn ngữ lập trình đa nền tảng mạnh mẽ; Pascal, ngôn ngữ lập trình cơ bản giúp xây dựng tư duy lập trình; và scripting Shell, công cụ mạnh mẽ để tự động hóa các tác vụ trên hệ thống.

  Để quản lý mã nguồn và cộng tác hiệu quả trong các dự án, Vinh sử dụng thành thạo Git và GitHub, các công cụ quản lý phiên bản phổ biến. Môi trường phát triển chính của anh là Visual Studio Code (VS Code), một trình soạn thảo code mạnh mẽ và linh hoạt. Bên cạnh đó, Vinh cũng làm việc hiệu quả với bộ công cụ văn phòng Microsoft Office.

  Những kiến thức và kỹ năng đa dạng của Vinh đã được thể hiện rõ nét qua hàng loạt các dự án cá nhân đầy sáng tạo và mang tính ứng dụng cao. Anh đã tự mình phát triển một hệ thống giao diện quản lý sinh viên nhỏ gọn bằng Java, thể hiện khả năng xây dựng ứng dụng desktop. Để rèn luyện tư duy logic và kỹ năng lập trình Front end, Vinh đã tạo ra những web game giải trí với các mini game JavaScript thú vị.

  Với mong muốn đóng góp cho cộng đồng, Vinh đã ấp ủ và xây dựng website chống lừa đảo tích hợp dữ liệu báo cáo từ người dùng, tạo ra một nền tảng để mọi người cùng nhau cảnh giác và phòng tránh các hành vi lừa đảo trực tuyến. Anh còn phát triển một bot Telegram thông minh có khả năng nhận diện những "kẻ gian" tiềm ẩn, sử dụng các thuật toán và dữ liệu để phát hiện và cảnh báo người dùng về các tài khoản hoặc hành vi đáng ngờ.

  Để hỗ trợ những người làm việc trong lĩnh vực sáng tạo nội dung, Vinh đã phát triển một công cụ tải ảnh từ Imgur tiện lợi cho các blogger và nhà báo, giúp họ nhanh chóng lấy được hình ảnh chất lượng cao. Anh cũng tạo ra một trình tạo mã QR code đa năng cho phép người dùng dễ dàng tạo mã QR cho URL, văn bản, thông tin Wi-Fi, và QR chuyển khoản các ngân hàng.

  Danh sách các dự án ấn tượng của Vinh còn tiếp tục kéo dài với trang dự báo thời tiết trực tuyến tích hợp OpenWeather API, cung cấp thông tin thời tiết Real-time một cách trực quan. Anh còn phát triển một extension Chrome hỗ trợ đánh giá nhanh giảng viên dành riêng cho sinh viên Đại học Duy Tân (DTU), giúp sinh viên có thể tiết kiệm dôi chút thời gian khi đánh giá.

  Vinh cũng thể hiện sự nhạy bén với các xu hướng công nghệ mới bằng việc phát triển các API tải video TikTok và Facebook không watermark, đáp ứng nhu cầu của nhiều người dùng. Anh còn xây dựng web chuyển đổi mã xác thực hai yếu tố (2FA), tăng cường bảo mật cho tài khoản trực tuyến. Đặc biệt, Vinh còn khám phá lĩnh vực bảo mật ứng dụng di động với việc tạo ra module iOS "mở khóa" các tính năng Pro/Premium của ứng dụng Locket Gold,... thể hiện sự tò mò và khả năng nghiên cứu sâu rộng.

  Ngoài ra, Vinh còn là một "fan cứng" của tự động hóa và đã phát triển vô số bot Telegram tự động hóa với nhiều tính năng tiện ích, từ việc gửi thông báo, thu thập dữ liệu đến quản lý nhóm và thực hiện các tác vụ lặp đi lặp lại một cách hiệu quả. Anh thậm chí còn thử sức mình trong việc khai thác API từ các nền tảng mạng xã hội lớn như Facebook, Instagram, TikTok và Zalo để thu thập thông tin người dùng một cách có trách nhiệm, biến những ý tưởng sáng tạo thành những giải pháp công nghệ thiết thực, mang lại lợi ích cho cộng đồng.

  Để lan tỏa kiến thức và kết nối với cộng đồng, Vinh đã xây dựng và duy trì một hệ sinh thái các trang web và ứng dụng cá nhân đa dạng. Những "ngôi nhà ảo" này không chỉ là nơi anh giới thiệu các dự án mà còn là nơi chia sẻ những kinh nghiệm và kiến thức quý báu:

  dinhduyvinh.dev: Trang web tổng hợp thông tin cá nhân, portfolio và các dự án nổi bật của Vinh.
  dinhduyvinh.eu.org: Trang thông tin thanh toán (có thể được sử dụng cho các mục đích liên hệ hoặc hỗ trợ).
  upanh.vercel.app: Ứng dụng web đơn giản để tải ảnh lên Imgur một cách nhanh chóng.
  crusssh.vercel.app: Một không gian trực tuyến cá nhân, có thể là nơi Vinh thử nghiệm các ý tưởng hoặc chia sẻ những sở thích cá nhân.
  thoitiet2025.vercel.app: Trang web cung cấp thông tin dự báo thời tiết trực tuyến, tích hợp dữ liệu từ OpenWeather API.
  baomoi24h.eu.org: Một blog thông tin, nơi Vinh có thể chia sẻ kiến thức, quan điểm hoặc những thông tin hữu ích khác.
  listgames.vercel.app: Một trang web tổng hợp danh sách các game giải trí, có thể là dự án cá nhân hoặc một nguồn tài liệu tham khảo.
  web-qrcode.vercel.app: Một công cụ trực tuyến giúp người dùng tạo mã QR code một cách dễ dàng và nhanh chóng.
  Và còn nhiều trang web và ứng dụng khác đang được Vinh ấp ủ và phát triển.
  Vinh không chỉ là một người đam mê công nghệ mà còn là một thành viên tích cực và cởi mở của cộng đồng trực tuyến. Anh luôn sẵn lòng chia sẻ kiến thức và kinh nghiệm của mình thông qua nhiều nền tảng mạng xã hội:

  Facebook: facebook.com/duyvinh09 - Nơi Vinh chia sẻ những cập nhật về dự án, suy nghĩ cá nhân và tương tác với bạn bè, nhóm.
  X (Twitter): x.com/duyvinh09 - Nền tảng để Vinh thu thập thông tin, tham khảo ý tưởng nhanh chóng và kết nối với cộng đồng công nghệ.
  Instagram: instagram.com/dvinh.09 - Nơi Vinh chia sẻ những hình ảnh về cuộc sống, dự án và những khoảnh khắc đáng nhớ.
  YouTube: youtube.com/@duyvinh09 - Kênh chia sẻ các video hướng dẫn, mẹo công nghệ và những nội dung liên quan đến lập trình, và tiện ích.
  GitHub: github.com/duyvinh09 - Kho lưu trữ mã nguồn các dự án cá nhân và đóng góp vào các dự án open-source.
  Telegram: t.me/duyvinh09 - Kênh liên lạc cá nhân và chia sẻ thông tin nhanh chóng.
  Telegram Group: t.me/tienich - Một cộng đồng mở, nơi Vinh cùng những người có chung đam mê giao lưu, học hỏi và hỗ trợ lẫn nhau trong lĩnh vực công nghệ.
  Với ngọn lửa sáng tạo không ngừng cháy bỏng và một trái tim luôn hướng về sự phát triển của cộng đồng công nghệ Việt Nam, Đinh Duy Vinh không chỉ tập trung vào việc nâng cao kỹ năng cá nhân mà còn tích cực chia sẻ kiến thức, kinh nghiệm và hỗ trợ những người khác trên con đường chinh phục công nghệ. Mỗi dự án mà Vinh thực hiện đều là một minh chứng cho khả năng giải quyết vấn đề sáng tạo, tinh thần tự học và khát khao được đóng góp những giá trị thiết thực cho xã hội. Với những nỗ lực không mệt mỏi và tầm nhìn xa rộng, Đinh Duy Vinh đang từng bước khẳng định mình là một nguồn cảm hứng đầy hứa hẹn cho thế hệ trẻ Việt Nam, những người mang trong mình tình yêu và đam mê bất tận với thế giới của những dòng code và công nghệ tiên tiến.

  Những dòng code không chỉ là những ký tự vô tri mà còn là ngôn ngữ để Vinh thể hiện sự sáng tạo, kết nối với thế giới và hiện thực hóa những ý tưởng độc đáo. Hành trình chinh phục công nghệ của Đinh Duy Vinh vẫn đang tiếp diễn, hứa hẹn sẽ còn gặt hái được nhiều thành công hơn nữa và mang đến những đóng góp ý nghĩa hơn cho cộng đồng công nghệ Việt Nam và xa hơn thế nữa.

  Hãy kết nối với chúng tôi (chatbot được xây dựng dựa trên thông tin của Vinh) để khám phá thêm về những dự án, kỹ năng và tầm nhìn của Đinh Duy Vinh. Tôi luôn sẵn sàng cung cấp thông tin chi tiết và hỗ trợ bạn tìm hiểu về chàng trai tài năng này.`}],
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

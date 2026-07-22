const root = document.documentElement;
const body = document.body;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loadingScreen = document.querySelector(".loading-screen");
const navToggle = document.querySelector(".nav-toggle");
const navPanel = document.querySelector(".nav-panel");
const navLinks = [...document.querySelectorAll(".nav-panel a, .footer-grid a")];
const headerLinks = [...document.querySelectorAll(".nav-panel a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const progressBars = [...document.querySelectorAll(".progress i")];
const counterItems = [...document.querySelectorAll("[data-counter]")];
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".project-card")];
const themeToggle = document.querySelector(".theme-toggle");
const scrollProgress = document.querySelector(".scroll-progress");
const backToTop = document.querySelector(".back-to-top");
const spotlight = document.querySelector(".spotlight");
const copyButton = document.querySelector(".copy-email");
const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector(".form-feedback");
const typingElement = document.querySelector(".typing");
const magneticItems = [...document.querySelectorAll(".magnetic")];
const tiltItems = [...document.querySelectorAll(".tilt")];
const cursorDot = document.querySelector(".cursor--dot");
const cursorGlow = document.querySelector(".cursor--glow");
const cursorTrail = document.querySelector(".cursor-trail");
const canvas = document.querySelector(".particle-canvas");
const sections = [...document.querySelectorAll("main section[id]")];

const state = {
  theme: localStorage.getItem("portfolio-theme") || "dark",
  navOpen: false,
};

function applyTheme(theme, withTransition = false) {
  const update = () => {
    state.theme = theme;
    root.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#07111f" : "#eff6ff");
  };

  if (withTransition && document.startViewTransition) {
    document.startViewTransition(update);
  } else {
    update();
  }
}

function initMenu() {
  if (!navToggle || !navPanel) return;

  navToggle.addEventListener("click", () => {
    state.navOpen = !state.navOpen;
    navPanel.classList.toggle("is-open", state.navOpen);
    navToggle.setAttribute("aria-expanded", String(state.navOpen));
  });

  headerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      state.navOpen = false;
      navPanel.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initTyping() {
  if (!typingElement) return;
  const words = JSON.parse(typingElement.dataset.words || "[]");
  if (!words.length) return;

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const word = words[wordIndex];
    typingElement.textContent = word.slice(0, charIndex);

    if (!deleting) {
      charIndex += 1;
      if (charIndex > word.length) {
        deleting = true;
        window.setTimeout(tick, 1200);
        return;
      }
    } else {
      charIndex -= 1;
      if (charIndex < 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        charIndex = 0;
      }
    }

    window.setTimeout(tick, deleting ? 45 : 85);
  };

  tick();
}

function revealOnScroll() {
  if (!revealItems.length || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    progressBars.forEach((bar) => bar.style.width = bar.style.getPropertyValue("--value"));
    counterItems.forEach((item) => item.textContent = item.dataset.counter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        if (entry.target.matches(".skill-group")) {
          entry.target.querySelectorAll(".progress i").forEach((bar) => {
            bar.style.width = bar.style.getPropertyValue("--value");
          });
        }

        entry.target.querySelectorAll("[data-counter]").forEach(animateCounter);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
  document.querySelectorAll(".skill-group, .hero-card, .stat-card").forEach((item) => observer.observe(item));
}

function animateCounter(node) {
  if (node.dataset.counted === "true") return;
  node.dataset.counted = "true";
  const target = Number(node.dataset.counter || 0);
  const duration = 1400;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.round(target * eased));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function initScrollSpy() {
  const setActive = (id) => {
    headerLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { threshold: [0.35, 0.6], rootMargin: "-20% 0px -45% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function initFiltering() {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const update = () => {
        filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        projectCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category?.includes(filter);
          card.hidden = !show;
        });
      };

      if (document.startViewTransition) {
        document.startViewTransition(update);
      } else {
        update();
      }
    });
  });
}

function initThemeToggle() {
  applyTheme(state.theme);
  themeToggle?.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark", true);
  });
}

function initScrollUI() {
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    backToTop?.classList.toggle("is-visible", window.scrollY > 640);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" }));
}

function initRipple() {
  document.querySelectorAll(".ripple").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.append(ripple);
      window.setTimeout(() => ripple.remove(), 650);
    });
  });

  const style = document.createElement("style");
  style.textContent = `
    .ripple-effect {
      position: absolute;
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: color-mix(in oklch, white 60%, transparent);
      transform: translate(-50%, -50%);
      animation: ripple 650ms ease-out forwards;
      pointer-events: none;
    }
    @keyframes ripple {
      from { opacity: .65; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(16); }
    }
  `;
  document.head.append(style);
}

function initMagnetic() {
  if (prefersReducedMotion) return;
  magneticItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    item.addEventListener("pointerleave", () => {
      item.style.transform = "";
    });
  });
}

function initTilt() {
  if (prefersReducedMotion) return;
  tiltItems.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initPointerEffects() {
  if (prefersReducedMotion || !cursorDot || !cursorGlow || !cursorTrail || !spotlight) return;

  let glowX = window.innerWidth / 2;
  let glowY = window.innerHeight / 2;
  let trailX = glowX;
  let trailY = glowY;

  window.addEventListener("pointermove", (event) => {
    const { clientX, clientY } = event;
    cursorDot.style.transform = `translate(${clientX}px, ${clientY}px)`;
    glowX = clientX;
    glowY = clientY;
    root.style.setProperty("--spotlight-x", `${clientX}px`);
    root.style.setProperty("--spotlight-y", `${clientY}px`);
  });

  const animate = () => {
    trailX += (glowX - trailX) * 0.12;
    trailY += (glowY - trailY) * 0.12;
    cursorGlow.style.transform = `translate(${trailX}px, ${trailY}px)`;
    cursorTrail.style.transform = `translate(${trailX * 0.92 + glowX * 0.08}px, ${trailY * 0.92 + glowY * 0.08}px)`;
    requestAnimationFrame(animate);
  };

  animate();
}

function initParticles() {
  if (prefersReducedMotion || !canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let particles = [];

  const resize = () => {
    canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
    canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(Math.min(window.devicePixelRatio, 2), Math.min(window.devicePixelRatio, 2));
    particles = Array.from({ length: Math.min(34, Math.floor(window.innerWidth / 42)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
    }));
  };

  const render = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fillStyle = "rgba(103, 232, 249, 0.45)";
      context.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance > 120) continue;
        context.strokeStyle = `rgba(56, 189, 248, ${0.18 - distance / 900})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particles[i].x, particles[i].y);
        context.lineTo(particles[j].x, particles[j].y);
        context.stroke();
      }
    }

    requestAnimationFrame(render);
  };

  resize();
  render();
  window.addEventListener("resize", resize);
}

function initCopyEmail() {
  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.copy;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1400);
    } catch {
      copyButton.textContent = "Use email";
    }
  });
}

function initContactForm() {
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!formFeedback) return;
    formFeedback.textContent = "Message drafted successfully. Connect the form to your preferred email or backend endpoint.";
    contactForm.reset();
  });
}

function initLoading() {
  window.addEventListener("load", () => {
    loadingScreen?.classList.add("is-hidden");
  });
}

function initAnchorTransitions() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  });
}

applyTheme(state.theme);
initMenu();
initTyping();
revealOnScroll();
initScrollSpy();
initFiltering();
initThemeToggle();
initScrollUI();
initRipple();
initMagnetic();
initTilt();
initPointerEffects();
initParticles();
initCopyEmail();
initContactForm();
initLoading();
initAnchorTransitions();

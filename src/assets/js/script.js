const pageLoader = document.getElementById("page-loader");
const topbar = document.getElementById("topbar");
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
const heroMedia = document.getElementById("hero-media");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

window.addEventListener("load", () => {
  pageLoader?.classList.add("hidden");
});

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const opened = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(opened));
  });
}

document.querySelectorAll('.menu a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    menu?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealNodes = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
);

revealNodes.forEach((node) => revealObserver.observe(node));

let latestScrollY = 0;
let ticking = false;

const updateOnScroll = () => {
  const scrolled = latestScrollY > 26;
  topbar?.classList.toggle("scrolled", scrolled);

  if (!prefersReduced && heroMedia) {
    const offset = Math.min(latestScrollY * 0.22, 120);
    heroMedia.style.transform = `translate3d(0, ${offset}px, 0)`;
  }

  ticking = false;
};

window.addEventListener("scroll", () => {
  latestScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(updateOnScroll);
    ticking = true;
  }
});

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = Number(entry.target.getAttribute("data-target") || 0);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 },
);

counters.forEach((counter) => counterObserver.observe(counter));

function animateCounter(node, target) {
  const duration = 1400;
  const startedAt = performance.now();

  const tick = (time) => {
    const progress = Math.min((time - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = Math.round(target * eased).toString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

let lastFocusedElement = null;
let activeModal = null;

function getFocusableElements(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(container.querySelectorAll(selectors.join(","))).filter(
    (element) => !element.hasAttribute("disabled") && element.offsetParent !== null
  );
}

function setActiveModal(modal) {
  activeModal = modal;
  if (modal) {
    lastFocusedElement = document.activeElement;
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

function trapFocus(event) {
  if (!activeModal || event.key !== "Tab") return;
  const focusable = getFocusableElements(activeModal);
  if (focusable.length === 0) return;

  const firstElement = focusable[0];
  const lastElement = focusable[focusable.length - 1];
  const isShift = event.shiftKey;

  if (isShift && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!isShift && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openModal(modal, initialFocus) {
  if (!modal) return;
  setActiveModal(modal);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const focusTarget = initialFocus || getFocusableElements(modal)[0] || modal;
  focusTarget.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
  setActiveModal(null);
}

// Event modal: open details from .event-card
const eventCards = document.querySelectorAll(".event-card");
const eventModal = document.getElementById("event-modal");
const eventModalClose = document.getElementById("event-modal-close");
const eventModalTitle = document.getElementById("event-modal-title");
const eventModalDate = document.getElementById("event-modal-date");
const eventModalDesc = document.getElementById("event-modal-desc");
const eventModalLocation = document.getElementById("event-modal-location");

eventCards.forEach((card) => {
  const openEvent = () => {
    if (!eventModal) return;
    const title = card.querySelector("h3")?.textContent || card.dataset.title || "";
    const date = card.querySelector("time")?.textContent || card.dataset.date || "";
    const desc = card.dataset.desc || "";
    const location = card.dataset.location || "";
    eventModalTitle.textContent = title;
    eventModalDate.textContent = date;
    eventModalDesc.textContent = desc;
    eventModalLocation.textContent = location;
    openModal(eventModal, eventModalClose || eventModal);
  };

  card.addEventListener("click", openEvent);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.code === "Space") {
      e.preventDefault();
      openEvent();
    }
  });
});

function closeEventModal() {
  closeModal(eventModal);
}

eventModalClose?.addEventListener("click", closeEventModal);
eventModal?.addEventListener("click", (event) => {
  if (event.target === eventModal) closeEventModal();
});

const masonry = document.getElementById("masonry");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");

masonry?.addEventListener("click", (event) => {
  const button = event.target.closest(".gallery-image");
  const img = button?.querySelector("img");
  if (!lightbox || !lightboxImage || !img) return;

  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt;
  openModal(lightbox, lightboxClose || lightbox);
});

function closeLightbox() {
  if (!lightbox || !lightboxImage || !lightbox.classList.contains("open")) return;
  closeModal(lightbox);
  lightboxImage.removeAttribute("src");
}

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    if (typeof closeEventModal === "function") closeEventModal();
  }
  trapFocus(event);
});

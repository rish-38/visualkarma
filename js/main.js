/**
 * Visual Karma — Rishikesh Vishwakarma Portfolio
 * Main Interactive Script
 */

// =============================================================================
// 1. Personal & Contact Configuration
// =============================================================================
// Replace with your real WhatsApp number (country code + number, e.g. "919876543210") and email:
const CONFIG = {
  phone: "919136294212", // WhatsApp phone number with country code without + or spaces
  email: "vishwakarmarishikesh38@gmail.com", // Your direct email address
  socials: {
    behance: "https://www.behance.net/rishikesh",
    github: "https://github.com/rish-38",
    linkedin: "https://linkedin.com/in/rishikesh-vishwakarma",
  }
};

// =============================================================================
// 2. Projects & Posters Data
// =============================================================================

let PROJECTS = [];



async function loadProjects() {
  try {
    const res = await fetch('assets/project.json');
    if (res.ok) {
      PROJECTS = await res.json();
    }
  } catch (e) {
    console.warn("Could not fetch project.json", e);
  }
}

// Skills & Tools Configuration
const SKILLS = {
  design: ["Photoshop", "Illustrator", "Figma", "Adobe XD", "CorelDraw"],
  video: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut"],
  // ai: ["Midjourney", "Runway", "Kling AI", "ElevenLabs", "ChatGPT"],
  web: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "PHP", "SQL"]
};

// =============================================================================
// 3. Theme Toggle (Light / Dark)
// =============================================================================
function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem("vk_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = savedTheme || (prefersDark ? "dark" : "light");

  applyTheme(currentTheme);

  toggleBtn.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("vk_theme", nextTheme);
  });

  // Listen for system theme changes if user hasn't explicitly set a preference
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem("vk_theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    toggleBtn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    toggleBtn.innerHTML = theme === "dark"
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.3 2a10 10 0 00-1.9 20 9.9 9.9 0 007.8-3.9.75.75 0 00-.6-1.2 8.5 8.5 0 01-8.5-8.5c0-2.3 1-4.4 2.6-5.8a.75.75 0 00-.4-1.3c-.33-.04-.67-.07-1-.07z"/></svg>`;
  }
}

// =============================================================================
// 4. Bento Skills & Tools Display
// =============================================================================
function renderSkillBars() {
  // Tools and skills are rendered as semantic, high-performance interactive tag chips directly in markup
}

// =============================================================================
// 5. Projects Showcase: Borderless Circular Wheel & Detail Card
// =============================================================================
function initProjects() {
  const filtersContainer = document.getElementById("project-filters");
  const trackContainer = document.getElementById("wheel-track-container");
  const wheelItemsContainer = document.getElementById("wheel-items");
  const wheelPrevBtn = document.getElementById("wheel-prev");
  const wheelNextBtn = document.getElementById("wheel-next");

  const previewImg = document.getElementById("wheel-preview-img");
  const previewVideo = document.getElementById("wheel-preview-video");
  const previewPlayHint = document.getElementById("wheel-preview-play-hint");
  const previewBadge = document.getElementById("wheel-preview-badge");
  const previewDesc = document.getElementById("wheel-preview-desc");
  const previewLink = document.getElementById("wheel-preview-link");
  const previewImageWrap = document.getElementById("wheel-preview-image-wrap");

  if (!filtersContainer || !trackContainer) return;

  const categories = ["All", "Brand identity", "UI/UX", "Web", "Art & Sketch", "Video & Motion", "Posters"];
  let activeCategory = "All";
  let filteredProjects = PROJECTS;

  // Wheel State
  let targetIndex = 0;
  let currentIndex = 0;
  let activePreviewIndex = -1;
  let isDragging = false;
  let startY = 0;
  let startIndex = 0;
  let hasMoved = false;

  // ---------------------------------------------------------
  // Filter Tabs
  // ---------------------------------------------------------
  function renderFilters() {
    filtersContainer.innerHTML = categories.map(cat => {
      const count = cat === "All" ? PROJECTS.length : PROJECTS.filter(p => p.category === cat).length;
      const isSelected = cat === activeCategory;
      return `
        <button class="fb" type="button" aria-pressed="${isSelected}" data-cat="${cat}">
          ${cat} <span class="count">${count}</span>
        </button>
      `;
    }).join("");
  }

  // ---------------------------------------------------------
  // Wheel Items Generation (Small Dot + Large Number + Trimmed Title)
  // ---------------------------------------------------------
  function buildWheelItems() {
    if (!wheelItemsContainer) return;
    wheelItemsContainer.innerHTML = filteredProjects.map((p, i) => {
      const formatted = String(i + 1).padStart(2, "0");
      return `
        <div class="wheel-item" data-index="${i}">
          <span class="wheel-dot" aria-hidden="true"></span>
          <span class="wheel-idx">${formatted}</span>
          <span class="wheel-item-title">${p.title}</span>
        </div>
      `;
    }).join("");

    const itemEls = wheelItemsContainer.querySelectorAll(".wheel-item");
    itemEls.forEach((el, i) => {
      el.addEventListener("mouseenter", () => {
        targetIndex = i;
        updatePreview(i);
      });
      el.addEventListener("click", () => {
        if (!hasMoved) {
          targetIndex = i;
          updatePreview(i);
        }
      });
    });
  }

  function clampTarget() {
    const maxIdx = Math.max(0, filteredProjects.length - 1);
    targetIndex = Math.max(0, Math.min(maxIdx, targetIndex));
  }

  // ---------------------------------------------------------
  // Dynamic Detail Card Update with Spin Reveal Transitions
  // ---------------------------------------------------------
  function applyMediaAspect(w, h, p) {
    if (!previewImageWrap) return;
    const previewCard = document.getElementById("wheel-preview-card");
    const ar = (w && h) ? (w / h) : (p && p.isWide ? 1.6 : 1.0);

    previewImageWrap.style.aspectRatio = `${ar}`;

    // Adjust card container width and image classes to hug the image aspect with no whitespace
    if (ar < 0.85) {
      // Tall / Vertical (e.g. posters 0.71)
      if (previewCard && window.innerWidth > 640) previewCard.style.maxWidth = "330px";
      previewImageWrap.classList.remove("is-wide", "is-square");
      previewImageWrap.classList.add("is-vertical");
    } else if (ar < 1.18) {
      // Square / Near-Square (e.g. Chill Dude 1.0)
      if (previewCard && window.innerWidth > 640) previewCard.style.maxWidth = "380px";
      previewImageWrap.classList.remove("is-wide", "is-vertical");
      previewImageWrap.classList.add("is-square");
    } else {
      // Wide (e.g. Web UI / Branding 1.25 - 2.1)
      if (previewCard && window.innerWidth > 640) previewCard.style.maxWidth = "450px";
      previewImageWrap.classList.remove("is-square", "is-vertical");
      previewImageWrap.classList.add("is-wide");
    }
  }

  function updatePreview(idx, force = false) {
    if (idx < 0 || idx >= filteredProjects.length) return;
    if (idx === activePreviewIndex && !force) return;
    activePreviewIndex = idx;

    const p = filteredProjects[idx];
    const isVideo = p.mediaType === "video";
    const isVimeo = isVideo && (p.url.includes("vimeo.com") || (p.thumbnail && p.thumbnail.includes("vimeo")));

    if (isVideo && !isVimeo) {
      if (previewImg) previewImg.style.display = "none";
      if (previewVideo) {
        previewVideo.style.display = "block";
        const rawSrc = p.url || p.thumbnail;
        const targetSrc = encodeURI(rawSrc);
        if (!previewVideo.src.endsWith(targetSrc) && previewVideo.src !== targetSrc) {
          previewVideo.src = targetSrc;
          previewVideo.load();
        }
        previewVideo.play().catch(() => {});

        if (previewVideo.videoWidth && previewVideo.videoHeight) {
          applyMediaAspect(previewVideo.videoWidth, previewVideo.videoHeight, p);
        } else {
          applyMediaAspect(p.isWide ? 16 : 9, p.isWide ? 9 : 16, p);
          previewVideo.onloadedmetadata = () => {
            applyMediaAspect(previewVideo.videoWidth, previewVideo.videoHeight, p);
          };
        }
      }
      if (previewPlayHint) previewPlayHint.style.display = "flex";
    } else if (isVimeo) {
      if (previewVideo) {
        previewVideo.pause();
        previewVideo.style.display = "none";
      }
      if (previewImg) {
        previewImg.style.display = "block";
        const imgSrc = encodeURI(p.thumbnail || p.url);
        previewImg.src = imgSrc;
        previewImg.alt = p.title;

        if (previewImg.complete && previewImg.naturalWidth && previewImg.naturalHeight) {
          applyMediaAspect(previewImg.naturalWidth, previewImg.naturalHeight, p);
        } else {
          applyMediaAspect(p.isWide ? 16 : 9, p.isWide ? 9 : 16, p);
          previewImg.onload = () => {
            if (previewImg.naturalWidth && previewImg.naturalHeight) {
              applyMediaAspect(previewImg.naturalWidth, previewImg.naturalHeight, p);
            }
          };
        }
      }
      if (previewPlayHint) previewPlayHint.style.display = "flex";
    } else {
      if (previewVideo) {
        previewVideo.pause();
        previewVideo.style.display = "none";
      }
      if (previewPlayHint) previewPlayHint.style.display = "none";
      if (previewImg) {
        previewImg.style.display = "block";
        const imgSrc = encodeURI(p.thumbnail || p.url);
        previewImg.src = imgSrc;
        previewImg.alt = p.title;

        if (previewImg.complete && previewImg.naturalWidth && previewImg.naturalHeight) {
          applyMediaAspect(previewImg.naturalWidth, previewImg.naturalHeight, p);
        } else {
          applyMediaAspect(p.isWide ? 16 : 10, p.isWide ? 10 : 10, p);
          previewImg.onload = () => {
            if (previewImg.naturalWidth && previewImg.naturalHeight) {
              applyMediaAspect(previewImg.naturalWidth, previewImg.naturalHeight, p);
            }
          };
        }
      }
    }

    // Card shows ONLY: category pill on image, image/video, description, "Explore Project" button
    if (previewBadge) {
      previewBadge.textContent = p.tag || p.category;
    }
    if (previewDesc) {
      previewDesc.textContent = p.description;
    }
    if (previewLink) {
      previewLink.href = encodeURI(p.url);
      const span = previewLink.querySelector("span");
      if (span) span.textContent = "Explore Project";
    }

    // Trigger reveal transition: image clip-path + slide/fade, description delayed fade
    if (previewImageWrap && previewDesc) {
      previewImageWrap.classList.remove("reveal-media");
      previewDesc.classList.remove("reveal-desc");
      void previewImageWrap.offsetWidth; // trigger reflow
      previewImageWrap.classList.add("reveal-media");
      previewDesc.classList.add("reveal-desc");
    }
  }

  // ---------------------------------------------------------
  // Circular Wheel Physics & Arc Rendering
  // ---------------------------------------------------------
  function renderWheel() {
    if (!wheelItemsContainer || !trackContainer) return;
    const itemEls = wheelItemsContainer.querySelectorAll(".wheel-item");
    if (!itemEls.length) return;

    const rect = trackContainer.getBoundingClientRect();
    const w = rect.width || 480;
    const h = rect.height || 520;

    // Curved circle center to the right: arc bows towards left edge
    const cx = w * 0.96;
    const cy = h * 0.50;
    const R = Math.max(w * 0.86, 420);

    // Update thin solid arc guideline bleeding off left
    const arcGuide = trackContainer.querySelector(".wheel-arc-guide");
    if (arcGuide) {
      arcGuide.style.width = (R * 2) + "px";
      arcGuide.style.height = (R * 2) + "px";
      arcGuide.style.left = (cx - R) + "px";
      arcGuide.style.top = (cy - R) + "px";
      arcGuide.style.transform = "none";
    }

    const roundedCurrent = Math.round(currentIndex);

    itemEls.forEach((el, i) => {
      const diff = i - currentIndex;
      // Big gaps: 18 degrees angular separation
      const angleDeg = diff * 18;

      // Cull items that rotated out of view
      if (Math.abs(angleDeg) > 55) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.style.transform = "translate3d(-9999px, -9999px, 0)";
        return;
      }

      const angleRad = (angleDeg * Math.PI) / 180;
      const x = cx - R * Math.cos(angleRad);
      const y = cy + R * Math.sin(angleRad);

      const scale = Math.max(0.78, 1.05 - Math.abs(diff) * 0.08);
      const opacity = Math.max(0.15, 1 - Math.pow(Math.abs(diff) / 3.2, 1.5));

      el.style.opacity = opacity.toFixed(3);
      el.style.pointerEvents = "auto";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%) rotate(${angleDeg.toFixed(1)}deg) scale(${scale.toFixed(3)})`;

      if (i === roundedCurrent) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  // Continuous physics animation loop (60fps, no flash, no jump)
  let animationRunning = true;
  function animationStep() {
    if (animationRunning) {
      const diff = targetIndex - currentIndex;
      if (Math.abs(diff) > 0.0005) {
        currentIndex += diff * 0.14;
        renderWheel();
        updatePreview(Math.round(currentIndex));
      } else if (currentIndex !== targetIndex) {
        currentIndex = targetIndex;
        renderWheel();
        updatePreview(Math.round(currentIndex));
      }
    }
    requestAnimationFrame(animationStep);
  }
  requestAnimationFrame(animationStep);

  // ---------------------------------------------------------
  // Interaction Listeners (Wheel, Drag, Keyboard, Buttons)
  // ---------------------------------------------------------
  if (trackContainer) {
    // Mouse wheel / trackpad scroll
    trackContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * Math.min(1.2, Math.abs(e.deltaY) * 0.0035);
      targetIndex += delta;
      clampTarget();
    }, { passive: false });

    // Pointer / touch drag
    trackContainer.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".wheel-nav-btn")) return;
      isDragging = true;
      hasMoved = false;
      startY = e.clientY;
      startIndex = targetIndex;
      trackContainer.setPointerCapture(e.pointerId);
    });

    trackContainer.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const diffY = e.clientY - startY;
      if (Math.abs(diffY) > 5) hasMoved = true;
      targetIndex = startIndex - (diffY * 0.015);
      clampTarget();
    });

    const finishDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      targetIndex = Math.round(targetIndex);
      clampTarget();
    };

    trackContainer.addEventListener("pointerup", finishDrag);
    trackContainer.addEventListener("pointercancel", finishDrag);

    // Keyboard Arrow Keys
    trackContainer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        targetIndex = Math.max(0, Math.round(targetIndex) - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        targetIndex = Math.min(filteredProjects.length - 1, Math.round(targetIndex) + 1);
      }
    });
  }

  // Next / Previous Buttons
  if (wheelPrevBtn) {
    wheelPrevBtn.addEventListener("click", () => {
      targetIndex = Math.max(0, Math.round(targetIndex) - 1);
    });
  }
  if (wheelNextBtn) {
    wheelNextBtn.addEventListener("click", () => {
      targetIndex = Math.min(filteredProjects.length - 1, Math.round(targetIndex) + 1);
    });
  }

  // Window Resize
  window.addEventListener("resize", () => {
    renderWheel();
  });

  // Filter click handler
  filtersContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button.fb");
    if (!btn) return;
    const cat = btn.getAttribute("data-cat");
    if (cat && cat !== activeCategory) {
      activeCategory = cat;
      filteredProjects = PROJECTS.filter(p => activeCategory === "All" || p.category === activeCategory);
      targetIndex = 0;
      currentIndex = 0;
      activePreviewIndex = -1;

      renderFilters();
      buildWheelItems();
      renderWheel();
      updatePreview(0, true);
    }
  });

  // ---------------------------------------------------------
  // Media Lightbox Modal Controller (Videos & Posters)
  // ---------------------------------------------------------
  const lightbox = document.getElementById("video-lightbox");
  const lightboxPlayer = document.getElementById("video-lightbox-player");
  const lightboxIframe = document.getElementById("video-lightbox-iframe");
  const lightboxExternal = document.getElementById("video-lightbox-external");
  const lightboxImg = document.getElementById("image-lightbox-player");
  const lightboxClose = document.getElementById("video-lightbox-close");
  const lightboxBackdrop = document.getElementById("video-lightbox-backdrop");
  const lightboxTitle = document.getElementById("video-lightbox-title");
  const lightboxDesc = document.getElementById("video-lightbox-desc");
  const lightboxTag = document.getElementById("video-lightbox-tag");

  function getVimeoId(url) {
    if (!url) return null;
    if (url.includes("d5f399eb-b2ee-4aea-879d-94d3b97a6f08")) return "1246134654";
    const m = url.match(/vimeo\.com\/(\d+)/) || url.match(/\/(\d{8,11})/);
    return m ? m[1] : null;
  }

  function openMediaModal(project) {
    if (!lightbox) return;
    if (lightboxTitle) lightboxTitle.textContent = project.title;
    if (lightboxDesc) lightboxDesc.textContent = project.description;

    const isVimeo = project.url && (project.url.includes("vimeo.com") || (project.thumbnail && project.thumbnail.includes("vimeo")));

    if (project.mediaType === "video") {
      if (lightboxTag) lightboxTag.textContent = project.tag || "Video & Motion";
      if (lightboxImg) lightboxImg.style.display = "none";

      if (isVimeo) {
        if (lightboxPlayer) {
          lightboxPlayer.pause();
          lightboxPlayer.src = "";
          lightboxPlayer.style.display = "none";
        }
        if (lightboxIframe) {
          const vimeoId = getVimeoId(project.url) || getVimeoId(project.thumbnail);
          lightboxIframe.className = "video-lightbox-iframe" + (project.isWide ? "" : " is-vertical");
          lightboxIframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&color=31b87c&title=0&byline=0&portrait=0`;
          lightboxIframe.style.display = "block";
        }
        if (lightboxExternal) {
          lightboxExternal.href = project.url;
          lightboxExternal.style.display = "inline-flex";
        }
      } else {
        if (lightboxIframe) {
          lightboxIframe.src = "";
          lightboxIframe.style.display = "none";
        }
        if (lightboxExternal) {
          lightboxExternal.style.display = "none";
        }
        if (lightboxPlayer) {
          lightboxPlayer.style.display = "block";
          lightboxPlayer.src = encodeURI(project.url);
          lightboxPlayer.play().catch(() => {});
        }
      }
    } else {
      if (lightboxTag) lightboxTag.textContent = project.category === "Posters" ? "Poster Design" : project.category;
      if (lightboxPlayer) {
        lightboxPlayer.pause();
        lightboxPlayer.style.display = "none";
        lightboxPlayer.src = "";
      }
      if (lightboxIframe) {
        lightboxIframe.src = "";
        lightboxIframe.style.display = "none";
      }
      if (lightboxExternal) {
        lightboxExternal.style.display = "none";
      }
      if (lightboxImg) {
        lightboxImg.style.display = "block";
        lightboxImg.src = encodeURI(project.url || project.thumbnail);
        lightboxImg.alt = project.title;
      }
    }

    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMediaModal() {
    if (!lightbox) return;
    if (lightboxPlayer) {
      lightboxPlayer.pause();
      lightboxPlayer.src = "";
      lightboxPlayer.style.display = "none";
    }
    if (lightboxIframe) {
      lightboxIframe.src = "";
      lightboxIframe.style.display = "none";
    }
    if (lightboxExternal) {
      lightboxExternal.style.display = "none";
    }
    if (lightboxImg) {
      lightboxImg.src = "";
      lightboxImg.style.display = "none";
    }
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeMediaModal);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeMediaModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("active")) {
      closeMediaModal();
    }
  });

  // Intercept video and poster clicks on wheel preview link
  if (previewLink) {
    previewLink.addEventListener("click", (e) => {
      const p = filteredProjects[activePreviewIndex];
      if (p && (p.mediaType === "video" || p.category === "Posters")) {
        e.preventDefault();
        openMediaModal(p);
      }
    });
  }

  // Intercept video and poster clicks on wheel preview image wrap
  if (previewImageWrap) {
    previewImageWrap.addEventListener("click", () => {
      const p = filteredProjects[activePreviewIndex];
      if (p && (p.mediaType === "video" || p.category === "Posters")) {
        openMediaModal(p);
      }
    });
  }

  // Initial Boot
  filteredProjects = PROJECTS.filter(p => activeCategory === "All" || p.category === activeCategory);
  renderFilters();
  buildWheelItems();
  renderWheel();
  updatePreview(0, true);
}




// =============================================================================
// 6. Gamified Quiz / Card Swapping Contact Deck (WhatsApp & Email)
// =============================================================================
function initContactForm() {
  const nameInput = document.getElementById("contact-name");
  const reasonSelect = document.getElementById("contact-reason");
  const messageInput = document.getElementById("contact-message");
  const charCounter = document.getElementById("char-counter");
  const statusMsg = document.getElementById("contact-status");
  const waBtn = document.getElementById("send-wa");
  const emBtn = document.getElementById("send-email");

  const card1 = document.getElementById("card-1");
  const card2 = document.getElementById("card-2");
  const card3 = document.getElementById("card-3");
  const card4 = document.getElementById("card-4");
  const allCards = [card1, card2, card3, card4].filter(Boolean);

  const progressBar = document.getElementById("deck-progress-fill");
  const stepLabel = document.getElementById("deck-step-label");
  const stepPercent = document.getElementById("deck-step-percent");
  const reasonChips = document.querySelectorAll(".deck-chip");

  const summaryName = document.getElementById("summary-name");
  const summaryReason = document.getElementById("summary-reason");
  const summaryMsg = document.getElementById("summary-message");

  if (!messageInput || !charCounter) return;

  let currentStep = 1;

  // Character counter
  messageInput.addEventListener("input", () => {
    const len = messageInput.value.length;
    charCounter.textContent = len;
  });

  // Pleasant audio chime via Web Audio API (tactile pop + celebratory chime)
  function playPopSound(type = "advance") {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = "sine";

      if (type === "celebrate") {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }

  // Haptic vibration feedback
  function triggerHaptic(celebrate = false) {
    if (navigator.vibrate) {
      if (celebrate) {
        navigator.vibrate([30, 40, 40, 50, 30]);
      } else {
        navigator.vibrate([18, 25, 18]);
      }
    }
  }

  // Canvas Confetti Celebration
  function launchConfetti() {
    const canvas = document.getElementById("contact-confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 480;
    canvas.height = rect.height || 420;

    const colors = ["#31b87c", "#e4eec0", "#0d6efd", "#455095", "#ffd166", "#ffffff"];
    const particles = [];
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 9 - 3.5,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    let animId;
    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // subtle gravity
        p.vx *= 0.985;
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
          ctx.restore();
        }
      });

      if (alive) {
        animId = requestAnimationFrame(frame);
      }
    }
    frame();
  }

  function showStatus(text, type) {
    if (!statusMsg) return;
    statusMsg.textContent = text;
    statusMsg.className = `msg ${type || ""}`;
  }

  function updateDeckView(targetStep, direction = "forward") {
    showStatus("", "");

    // Reset card state classes
    allCards.forEach(c => {
      c.classList.remove("is-current", "is-next", "is-far", "is-hidden", "is-swapping-out");
    });

    if (targetStep === 1) {
      if (card1) card1.classList.add("is-current");
      if (card2) card2.classList.add("is-next");
      if (card3) card3.classList.add("is-far");
      if (card4) card4.classList.add("is-hidden");
      if (progressBar) progressBar.style.width = "33.33%";
      if (stepLabel) stepLabel.textContent = "Step 1 of 3";
      if (stepPercent) stepPercent.textContent = "33%";
      setTimeout(() => nameInput && nameInput.focus(), 250);
    } else if (targetStep === 2) {
      if (card2) card2.classList.add("is-current");
      if (card3) card3.classList.add("is-next");
      if (card1) card1.classList.add("is-far");
      if (card4) card4.classList.add("is-hidden");
      if (progressBar) progressBar.style.width = "66.66%";
      if (stepLabel) stepLabel.textContent = "Step 2 of 3";
      if (stepPercent) stepPercent.textContent = "66%";
    } else if (targetStep === 3) {
      if (card3) card3.classList.add("is-current");
      if (card2) card2.classList.add("is-far");
      if (card1) card1.classList.add("is-hidden");
      if (card4) card4.classList.add("is-next");
      if (progressBar) progressBar.style.width = "100%";
      if (stepLabel) stepLabel.textContent = "Step 3 of 3";
      if (stepPercent) stepPercent.textContent = "100%";
      setTimeout(() => messageInput && messageInput.focus(), 250);
    } else if (targetStep === 4) {
      // Summary card
      const name = (nameInput ? nameInput.value.trim() : "") || "Friend";
      const reason = (reasonSelect ? reasonSelect.value : "") || "General inquiry";
      const msg = (messageInput ? messageInput.value.trim() : "") || "—";

      if (summaryName) summaryName.textContent = name;
      if (summaryReason) summaryReason.textContent = reason;
      if (summaryMsg) summaryMsg.textContent = msg;

      if (card4) card4.classList.add("is-current");
      if (card3) card3.classList.add("is-far");
      if (card2) card2.classList.add("is-hidden");
      if (card1) card1.classList.add("is-hidden");

      if (progressBar) progressBar.style.width = "100%";
      if (stepLabel) stepLabel.textContent = "All set! 🎉";
      if (stepPercent) stepPercent.textContent = "Ready";

      playPopSound("celebrate");
      triggerHaptic(true);
      launchConfetti();
    }

    currentStep = targetStep;
  }

  function advanceStep(fromStep) {
    if (fromStep === 1) {
      const name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        showStatus("Please enter your name first.", "error");
        if (nameInput) nameInput.focus();
        return;
      }
      playPopSound();
      triggerHaptic();
      if (card1) {
        card1.classList.add("is-swapping-out");
        setTimeout(() => updateDeckView(2, "forward"), 180);
      } else {
        updateDeckView(2, "forward");
      }
    } else if (fromStep === 2) {
      playPopSound();
      triggerHaptic();
      if (card2) {
        card2.classList.add("is-swapping-out");
        setTimeout(() => updateDeckView(3, "forward"), 180);
      } else {
        updateDeckView(3, "forward");
      }
    } else if (fromStep === 3) {
      const msg = messageInput ? messageInput.value.trim() : "";
      if (!msg) {
        showStatus("Please add a short message about your project.", "error");
        if (messageInput) messageInput.focus();
        return;
      }
      playPopSound();
      triggerHaptic();
      if (card3) {
        card3.classList.add("is-swapping-out");
        setTimeout(() => updateDeckView(4, "forward"), 180);
      } else {
        updateDeckView(4, "forward");
      }
    }
  }

  // Next Buttons
  document.querySelectorAll(".deck-next-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.getAttribute("data-next"), 10);
      advanceStep(step);
    });
  });

  // Prev Buttons
  document.querySelectorAll(".deck-prev-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.getAttribute("data-prev"), 10);
      playPopSound();
      updateDeckView(step - 1, "backward");
    });
  });

  // Enter key advances on Card 1
  if (nameInput) {
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        advanceStep(1);
      }
    });
  }

  // Interactive Reason Chips
  reasonChips.forEach(chip => {
    chip.addEventListener("click", () => {
      reasonChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const val = chip.getAttribute("data-value");
      if (reasonSelect) {
        reasonSelect.value = val;
      }
      playPopSound();
      triggerHaptic();
      // Auto-advance to Card 3 after a subtle tactile delay
      setTimeout(() => advanceStep(2), 220);
    });
  });

  // Clicking on stacked peeking cards jumps to that card
  allCards.forEach((c, idx) => {
    c.addEventListener("click", (e) => {
      if (c.classList.contains("is-next") || c.classList.contains("is-far")) {
        const step = idx + 1;
        playPopSound();
        updateDeckView(step, "backward");
      }
    });
  });

  // Clicking Edit buttons on Card 4 Summary Box
  document.querySelectorAll(".deck-summary-row, .deck-summary-edit-btn").forEach(el => {
    el.addEventListener("click", (e) => {
      const row = el.closest(".deck-summary-row");
      if (row) {
        const target = parseInt(row.getAttribute("data-target-card"), 10);
        if (target) {
          playPopSound();
          updateDeckView(target, "backward");
        }
      }
    });
  });

  // Validation function
  function validate() {
    const name = nameInput ? nameInput.value.trim() : "";
    const msg = messageInput ? messageInput.value.trim() : "";

    if (!name) {
      showStatus("Please enter your name first.", "error");
      updateDeckView(1);
      if (nameInput) nameInput.focus();
      return false;
    }
    if (!msg) {
      showStatus("Please add a short message about your project.", "error");
      updateDeckView(3);
      if (messageInput) messageInput.focus();
      return false;
    }
    return true;
  }

  function getMessageBody() {
    const name = nameInput.value.trim();
    const reason = reasonSelect.value;
    const msg = messageInput.value.trim();
    return `Hi Rishikesh, I'm ${name}.\nRegarding: ${reason}\n\n${msg}`;
  }

  if (waBtn) {
    waBtn.addEventListener("click", () => {
      if (!validate()) return;
      const text = encodeURIComponent(getMessageBody());
      const targetPhone = CONFIG.phone || "";
      showStatus("Opening WhatsApp with your formatted message...", "success");

      const waUrl = targetPhone
        ? `https://wa.me/${targetPhone}?text=${text}`
        : `https://api.whatsapp.com/send?text=${text}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (emBtn) {
    emBtn.addEventListener("click", () => {
      if (!validate()) return;
      const name = nameInput.value.trim();
      const reason = reasonSelect.value;
      const msg = messageInput.value.trim();

      const subject = encodeURIComponent(`${reason} — from ${name}`);
      const body = encodeURIComponent(msg + `\n\n— ${name}`);
      showStatus("Opening your email client...", "success");

      window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    });
  }
}

// =============================================================================
// 7. Back To Top
// =============================================================================
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

// =============================================================================
// 8. Lenis Smooth Scroll & Scroll Parallax
// =============================================================================
let lenis = null;
function initLenis() {
  if (typeof Lenis === "undefined") return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.8,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Subtle hero parallax on scroll (y: -10%)
  const heroEl = document.querySelector(".hero");
  lenis.on("scroll", () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (heroEl && scrollY < window.innerHeight * 1.2) {
      heroEl.style.transform = `translate3d(0, ${-scrollY * 0.10}px, 0)`;
    }
  });

  // Smooth scroll for in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href && href !== "#") {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -30 });
        }
      }
    });
  });
}

// =============================================================================
// 9. Hero Mousemove Parallax on Heading Images
// =============================================================================
function initHeroParallax() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const normX = Math.max(-1, Math.min(1, x / (rect.width / 2)));
    const normY = Math.max(-1, Math.min(1, y / (rect.height / 2)));

    hero.style.setProperty("--ph-tx", `${(normX * 8).toFixed(2)}px`);
    hero.style.setProperty("--ph-ty", `${(normY * 8).toFixed(2)}px`);
    hero.style.setProperty("--ph-tx2", `${(-normX * 7).toFixed(2)}px`);
    hero.style.setProperty("--ph-ty2", `${(-normY * 7).toFixed(2)}px`);
  });

  hero.addEventListener("mouseleave", () => {
    hero.style.setProperty("--ph-tx", "0px");
    hero.style.setProperty("--ph-ty", "0px");
    hero.style.setProperty("--ph-tx2", "0px");
    hero.style.setProperty("--ph-ty2", "0px");
  });
}

// =============================================================================
// DOM Ready
// =============================================================================
document.addEventListener("DOMContentLoaded", async () => {
  initLenis();
  initHeroParallax();
  initTheme();
  renderSkillBars();
  await loadProjects();
  initProjects();
  initContactForm();
  initBackToTop();
});

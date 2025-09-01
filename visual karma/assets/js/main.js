(function(){
  'use strict';

  // Update year
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Back to top visibility
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop(){
    if(!backToTop) return;
    if(window.scrollY > 400){ backToTop.classList.add('show'); }
    else { backToTop.classList.remove('show'); }
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  if(backToTop){ backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' })); }

  // Reveal on scroll with dynamic animation
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry, index)=>{
      if(entry.isIntersecting){ 
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150); // Stagger animation by 150ms
        io.unobserve(entry.target); 
      }
    });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0.1 });
  revealEls.forEach((el)=> io.observe(el));

  // Animate skills: fill bars and count up percentages on reveal
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const bars = skillsSection.querySelectorAll('.progress-bar');
    // Prepare: store targets and reset widths
    bars.forEach((bar) => {
      bar.dataset.targetWidth = bar.style.width || '0%';
      bar.style.width = '0%';
      bar.style.transition = 'width 1.1s ease-out';
    });

    const animatePercents = () => {
      const percentSpans = skillsSection.querySelectorAll('.d-flex.justify-content-between span:last-child');
      percentSpans.forEach((span) => {
        const match = (span.textContent || '').trim().match(/(\d+)%/);
        if (!match) return;
        const target = parseInt(match[1], 10);
        const startTime = performance.now();
        const duration = 1100;
        function step(now) {
          const t = Math.min(1, (now - startTime) / duration);
          const value = Math.round(target * t);
          span.textContent = value + '%';
          if (t < 1) requestAnimationFrame(step);
        }
        span.textContent = '0%';
        requestAnimationFrame(step);
      });
    };

    const fillBars = () => {
      bars.forEach((bar) => {
        const target = bar.dataset.targetWidth || '0%';
        // next frame to ensure transition applies
        requestAnimationFrame(() => { bar.style.width = target; });
      });
    };

    const ioSkills = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fillBars();
          animatePercents();
          ioSkills.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

    ioSkills.observe(skillsSection);
  }

  // Smooth scroll for anchor links (improves older browsers / offset handling)
  document.querySelectorAll('a[href^="#"]').forEach((link)=>{
    link.addEventListener('click', function(e){
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 72; // offset for navbar
        window.scrollTo({ top: y, behavior:'smooth' });
      }
    });
  });

  // Typing animation for hero title
  const typingTarget = document.getElementById('typing');
  if(typingTarget){
    const words = ['RISHIKESH','VISHWAKARMA'];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const typeDelay = 120;
    const deleteDelay = 60;
    const holdDelay = 1000;

    function tick(){
      const current = words[wordIndex];
      if(!deleting){
        charIndex = Math.min(charIndex + 1, current.length);
      } else {
        charIndex = Math.max(charIndex - 1, 0);
      }
      typingTarget.textContent = current.slice(0, charIndex);

      if(!deleting && charIndex === current.length){
        deleting = true;
        setTimeout(tick, holdDelay);
        return;
      }
      if(deleting && charIndex === 0){
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
      setTimeout(tick, deleting ? deleteDelay : typeDelay);
    }
    tick();
  }

  // Contact form validation and WhatsApp submission + optional email draft
  const form = document.getElementById('contactForm');
  if(form){
    // Live counter for message length
    const msgEl = document.getElementById('message');
    const counterEl = document.getElementById('messageCounter');
    if(msgEl && counterEl){
      const updateCounter = () => {
        const max = parseInt(msgEl.getAttribute('maxlength') || '0', 10) || 0;
        const len = (msgEl.value || '').length;
        counterEl.textContent = `${len}/${max || 500}`;
      };
      msgEl.addEventListener('input', updateCounter);
      updateCounter();
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      // Prepare form data
      const name = document.getElementById('name').value;
      const reason = (document.getElementById('reason')?.value) || 'General Inquiry';
      const message = document.getElementById('message').value;

      // Prepare submit button for sending state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending…';

      // Create WhatsApp link with form data
      const whatsappNumber = '919136294212';
      const formattedMessage = `Name: ${name}\nReason: ${reason}\n\nMessage:\n${message}`;
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedMessage)}`;

      // Open WhatsApp in a centered popup (non-blocking page)
      const width = 900;
      const height = 700;
      const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
      const top = Math.max(0, Math.floor((window.screen.height - height) / 2));
      const popup = window.open(whatsappLink, 'waPopup', `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`);
      if(!popup || popup.closed || typeof popup.closed === 'undefined'){
        // fallback: open in same tab if popup blocked
        window.location.href = whatsappLink;
      }

      // Reset UI after brief delay (for consistent UX)
      setTimeout(()=>{
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        form.classList.remove('was-validated');

        const toastEl = document.getElementById('formToast');
        if(window.bootstrap && toastEl){
          const toast = new window.bootstrap.Toast(toastEl);
          toast.show();
        }
      }, 700);
    });
  }

  // Email draft button (opens mail client without needing email input)
  const emailDraftBtn = document.getElementById('emailDraftBtn');
  if(emailDraftBtn){
    emailDraftBtn.addEventListener('click', function(){
      const name = (document.getElementById('name')?.value || '').trim();
      const message = (document.getElementById('message')?.value || '').trim();
      const to = 'vishwakarmarishikesh38@gmail.com';
      const subject = encodeURIComponent(`Portfolio Contact from ${name || 'Visitor'}`);
      const body = encodeURIComponent(`Name: ${name || 'Visitor'}\n\nMessage:\n${message}`);
      const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
    });
  }

  // Enhanced Professional Project Tabs with debugging and responsive handling
  const projectTabs = document.querySelectorAll('.project-tab');
  const artGallery = document.getElementById('artDesignGallery');
  const brandGallery = document.getElementById('brandIdentityGallery');
  const uiuxWebGallery = document.getElementById('uiuxWebGallery');
  
  // Debug logging
  console.log('Project tabs found:', projectTabs.length);
  console.log('Galleries found:', {
    art: artGallery,
    brand: brandGallery,
    uiux: uiuxWebGallery
  });
  
  // Create custom cursor element for image display
  const customCursor = document.createElement('div');
  customCursor.className = 'custom-cursor';
  customCursor.innerHTML = '<img src="" alt="" class="cursor-image">';
  document.body.appendChild(customCursor);
  
  // Enhanced tab animation with responsive timing
  function animateTabs() {
    const isMobile = window.innerWidth <= 768;
    const staggerDelay = isMobile ? 150 : 200; // Faster on mobile
    
    projectTabs.forEach((tab, index) => {
      setTimeout(() => {
        tab.classList.add('animate');
        console.log(`Tab ${index + 1} animated`);
      }, index * staggerDelay);
    });
  }
  
  // Enhanced gallery visibility management
  function showGallery(category) {
    console.log('Showing gallery for category:', category);
    
    // Hide all galleries first
    [artGallery, brandGallery, uiuxWebGallery].forEach(gallery => {
      if (gallery) {
        gallery.hidden = true;
        console.log(`Hidden gallery:`, gallery.id);
      }
    });
    
    // Show selected gallery
    let targetGallery = null;
    switch(category) {
      case 'art-design':
        targetGallery = artGallery;
        break;
      case 'brand-identity':
        targetGallery = brandGallery;
        break;
      case 'uiux-web':
        targetGallery = uiuxWebGallery;
        break;
      default:
        console.warn('Unknown category:', category);
        return;
    }
    
    if (targetGallery) {
      targetGallery.hidden = false;
      console.log(`Shown gallery:`, targetGallery.id);
      
      // Trigger reflow for smooth transition
      targetGallery.offsetHeight;
      targetGallery.style.opacity = '0';
      targetGallery.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        targetGallery.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        targetGallery.style.opacity = '1';
        targetGallery.style.transform = 'translateY(0)';
      }, 50);
    }
  }
  
  // Enhanced tab click handling with error handling
  projectTabs.forEach((tab, index) => {
    console.log(`Setting up tab ${index + 1}:`, tab.dataset.category);
    
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Tab clicked:', tab.dataset.category);
      
      try {
        // Remove active class from all tabs
        projectTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Smooth scroll to tab (mobile-friendly)
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // On mobile, scroll to projects section instead of individual tab
          const projectsSection = document.getElementById('projects');
          if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          // On desktop, scroll to tab
          tab.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show corresponding gallery
        const category = tab.dataset.category;
        showGallery(category);
        
        // Add click feedback
        tab.style.transform = 'scale(0.95)';
        setTimeout(() => {
          tab.style.transform = 'scale(1)';
        }, 150);
        
      } catch (error) {
        console.error('Error handling tab click:', error);
      }
    });
    
    // Enhanced custom cursor effect
    const tabHeader = tab.querySelector('.tab-header');
    const tabTitle = tab.querySelector('.tab-title');
    
    if (tabHeader && tabTitle) {
      const category = tab.dataset.category;
      let projectImage = '';
      
      // Get project image based on category
      switch(category) {
        case 'art-design': {
          const firstArtImg = document.querySelector('#artDesignGallery img');
          projectImage = firstArtImg ? firstArtImg.src : 'assets/media/art-design/1.png';
          break;
        }
        case 'brand-identity':
          projectImage = 'assets/media/thumbnail/3.jpg';
          break;
        case 'uiux-web':
          projectImage = 'assets/media/thumbnail/u1.png';
          break;
        default:
          projectImage = 'assets/media/logo.png';
      }
      
      // Show custom cursor on text hover (desktop only)
      if (window.innerWidth > 768) {
        [tabHeader, tabTitle].forEach(element => {
          element.addEventListener('mouseenter', () => {
            const cursorImage = customCursor.querySelector('.cursor-image');
            cursorImage.src = projectImage;
            cursorImage.alt = category;
            customCursor.classList.add('active');
          });
          
          element.addEventListener('mouseleave', () => {
            customCursor.classList.remove('active');
          });
        });
      }
    }
  });
  
  // Enhanced custom cursor with responsive handling
  let isCursorEnabled = window.innerWidth > 768;
  
  function updateCursorState() {
    const newState = window.innerWidth > 768;
    if (newState !== isCursorEnabled) {
      isCursorEnabled = newState;
      if (!isCursorEnabled) {
        customCursor.classList.remove('active');
      }
    }
  }
  
  // Update custom cursor position
  document.addEventListener('mousemove', (e) => {
    if (isCursorEnabled) {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    }
  });
  
  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    customCursor.classList.remove('active');
  });
  
  // Handle window resize for responsive behavior
  window.addEventListener('resize', () => {
    updateCursorState();
    console.log('Window resized to:', window.innerWidth);
  });
  
  // Initialize animations when page loads
  function initializeProjectSection() {
    console.log('Initializing project section...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        animateTabs();
        // Show default gallery (art-design)
        showGallery('art-design');
      });
    } else {
      animateTabs();
      // Show default gallery (art-design)
      showGallery('art-design');
    }
  }
  
  // Initialize
  initializeProjectSection();

  // Responsive sizing via GSAP (only size changes on mobile)
  try {
    if (window.gsap && typeof window.gsap.matchMedia === 'function') {
      const mm = window.gsap.matchMedia();
      mm.add('(max-width: 768px)', () => {
        // On mobile: center hero text and keep image responsive (CSS handles size)
        window.gsap.set('#home .col-lg-7', { textAlign: 'center' });
        window.gsap.set('#home .col-lg-7 .d-flex', { justifyContent: 'center' });
        // Animate self.gif gently into view from bottom
        const img = document.querySelector('.oversized-image');
        if (img) {
          window.gsap.fromTo(img,
            { y: 24, opacity: 0.0, scale: 0.96 },
            { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out', delay: 0.1 }
          );
        }
        return () => {};
      });
      mm.add('(min-width: 769px)', () => {
        // On larger screens: restore original CSS-driven sizes
        window.gsap.set('#home .col-lg-7', { clearProps: 'textAlign' });
        window.gsap.set('#home .col-lg-7 .d-flex', { clearProps: 'justifyContent' });
        window.gsap.set('.oversized-image', { clearProps: 'all' });
        // Subtle float-in on load for desktop as well
        const img = document.querySelector('.oversized-image');
        if (img) {
          window.gsap.fromTo(img,
            { y: 20, opacity: 0.0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.1 }
          );
        }
      });
    }
  } catch (e) {
    console.warn('GSAP responsive sizing setup failed:', e);
  }

})();



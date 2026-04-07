/* ============================================================
   SunPeak Energy Solutions — Main Script
   ============================================================ */

'use strict';

/* ── DOM Ready ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initCalculator();
  initFAQ();
  initBookingForm();
  initSliderProgress();
});

/* ============================================================
   NAVBAR — shrink on scroll
   ============================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 20) {
      navbar.style.boxShadow = '0 2px 24px rgba(0,0,0,.22)';
    } else {
      navbar.style.boxShadow = '';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  const hamburger = document.querySelector('.navbar__hamburger');
  const menu      = document.querySelector('.mobile-menu');
  const overlay   = document.querySelector('.mobile-menu__overlay');
  const closeBtn  = document.querySelector('.mobile-menu__close');
  const menuLinks = document.querySelectorAll('.mobile-menu__links a, .mobile-menu__cta');

  if (!hamburger || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeMenu() {
    menu.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ============================================================
   SMOOTH SCROLL (enhances the CSS scroll-behavior for offset)
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   FADE-IN ON SCROLL (Intersection Observer)
   ============================================================ */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings inside a grid/timeline
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)');
        let delay = 0;
        siblings.forEach((el, idx) => {
          if (el === entry.target) delay = idx * 80;
        });

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ============================================================
   SAVINGS CALCULATOR
   ============================================================ */
function initCalculator() {
  const slider      = document.getElementById('bill-slider');
  const billDisplay = document.getElementById('bill-display');
  const homeSizeEl  = document.getElementById('home-size');
  const annualEl    = document.getElementById('annual-savings');
  const paybackEl   = document.getElementById('payback-period');
  const lifetimeEl  = document.getElementById('lifetime-savings');

  if (!slider || !homeSizeEl) return;

  function updateCalculator() {
    const bill     = parseInt(slider.value, 10);
    const sizeMulti = parseFloat(homeSizeEl.value);

    billDisplay.textContent = `$${bill}`;
    updateSliderProgress(slider);

    const annualBill    = bill * 12;
    const annualSavings = Math.round(annualBill * 0.65 * sizeMulti);
    const systemCost    = bill * 80;
    const afterTaxCost  = systemCost * 0.70;  // 30% tax credit
    const paybackYears  = annualSavings > 0 ? (afterTaxCost / annualSavings) : 0;
    const lifetimeSavings = annualSavings * 25 - afterTaxCost;

    animateNumber(annualEl,   annualSavings,    formatDollar);
    animateNumber(paybackEl,  paybackYears,     formatYears);
    animateNumber(lifetimeEl, Math.max(0, lifetimeSavings), formatDollar);
  }

  slider.addEventListener('input', updateCalculator);
  homeSizeEl.addEventListener('change', updateCalculator);

  // Init
  updateCalculator();
}

/* Slider fill progress visual */
function initSliderProgress() {
  const slider = document.getElementById('bill-slider');
  if (slider) updateSliderProgress(slider);
}

function updateSliderProgress(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const val = parseFloat(slider.value);
  const pct = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--progress', `${pct.toFixed(1)}%`);
}

/* Animated number counter */
function animateNumber(el, targetValue, formatter) {
  const duration = 500;
  const start    = performance.now();
  const startVal = parseFloat(el.dataset.currentValue || '0') || 0;

  el.classList.add('counting');
  el.dataset.currentValue = targetValue;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = startVal + (targetValue - startVal) * eased;

    el.textContent = formatter(current);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = formatter(targetValue);
      el.classList.remove('counting');
    }
  }

  requestAnimationFrame(step);
}

function formatDollar(val) {
  return '$' + Math.round(val).toLocaleString('en-US');
}

function formatYears(val) {
  return val.toFixed(1) + ' yrs';
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      items.forEach(other => {
        const otherBtn    = other.querySelector('.faq__question');
        const otherAnswer = other.querySelector('.faq__answer');
        if (otherBtn && otherAnswer && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;

      // Scroll into view if opened and partially off-screen
      if (!isOpen) {
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    });
  });
}

/* ============================================================
   BOOKING FORM — validation + success
   ============================================================ */
function initBookingForm() {
  const form        = document.getElementById('booking-form');
  const successEl   = document.getElementById('booking-success');
  const successMsg  = document.getElementById('success-message');

  if (!form || !successEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const name = form.querySelector('#full-name').value.trim();
    const firstName = name.split(' ')[0];

    // Show success
    form.hidden = true;
    successEl.hidden = false;
    successMsg.textContent = `Thanks, ${firstName}! We'll reach out within 1 business day to schedule your free consultation.`;

    // Scroll to success message
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Live validation on blur
  const inputs = form.querySelectorAll('.form__input, .form__select, .form__textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });
}

function validateForm(form) {
  let valid = true;

  // Text / email / tel / textarea inputs
  const fields = form.querySelectorAll('.form__input, .form__select, .form__textarea');
  fields.forEach(field => {
    if (!validateField(field)) valid = false;
  });

  // Radio groups
  const radioGroups = ['ownership', 'contactMethod'];
  const errorIds    = { ownership: 'ownership-error', contactMethod: 'contact-error' };

  radioGroups.forEach(name => {
    const checked   = form.querySelector(`input[name="${name}"]:checked`);
    const errorSpan = document.getElementById(errorIds[name]);
    if (!checked) {
      if (errorSpan) {
        errorSpan.textContent = 'Please select an option.';
      }
      valid = false;
    } else {
      if (errorSpan) errorSpan.textContent = '';
    }
  });

  // Focus first invalid field
  if (!valid) {
    const firstError = form.querySelector('.error, [aria-expanded]');
    const firstErrorField = form.querySelector('.form__input.error, .form__select.error');
    if (firstErrorField) firstErrorField.focus();
  }

  return valid;
}

function validateField(field) {
  const errorSpan = field.parentElement.querySelector('.form__error');
  let message = '';

  if (field.required && !field.value.trim()) {
    message = 'This field is required.';
  } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    message = 'Please enter a valid email address.';
  } else if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
    message = 'Please enter a valid phone number.';
  }

  if (message) {
    field.classList.add('error');
    if (errorSpan) errorSpan.textContent = message;
    return false;
  } else {
    field.classList.remove('error');
    if (errorSpan) errorSpan.textContent = '';
    return true;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  // Allow formats: (602) 555-0187, 602-555-0187, 6025550187, +16025550187
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ''));
}

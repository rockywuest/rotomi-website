// ROTOMI Website — Sentinel Agent Landing Page

class ROTOMIWebsite {
        constructor() {
                    this.theme = localStorage.getItem('theme') || 'light';
                    this.animatedElements = new Set();
                    this.mobileMenuOpen = false;
                    this.init();
        }

    init() {
                this.setTheme(this.theme);
                this.setupEventListeners();
                this.setupScrollAnimations();
                this.setupCounterAnimations();
                this.setupFormValidation();
                this.setupFaqAccordion();
                this.setupMobileMenu();
    }

    // Theme Management
    setTheme(theme) {
                this.theme = theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
    }

    toggleTheme() {
                this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }

    // Event Listeners
    setupEventListeners() {
                const themeToggle = document.getElementById('themeToggle');
                if (themeToggle) {
                                themeToggle.addEventListener('click', () => this.toggleTheme());
                }

            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                            anchor.addEventListener('click', (e) => this.handleAnchorClick(e));
            });
    }

    // Mobile Menu
    setupMobileMenu() {
                const hamburger = document.getElementById('navHamburger');
                const menu = document.getElementById('navMenu');
                if (!hamburger || !menu) return;

            const overlay = document.createElement('div');
                overlay.className = 'nav-overlay';
                document.body.appendChild(overlay);

            const toggleMenu = () => {
                            this.mobileMenuOpen = !this.mobileMenuOpen;
                            hamburger.classList.toggle('active', this.mobileMenuOpen);
                            hamburger.setAttribute('aria-expanded', this.mobileMenuOpen);
                            menu.classList.toggle('open', this.mobileMenuOpen);
                            overlay.classList.toggle('visible', this.mobileMenuOpen);
                            document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
            };

            const closeMenu = () => {
                            if (!this.mobileMenuOpen) return;
                            this.mobileMenuOpen = false;
                            hamburger.classList.remove('active');
                            hamburger.setAttribute('aria-expanded', 'false');
                            menu.classList.remove('open');
                            overlay.classList.remove('visible');
                            document.body.style.overflow = '';
            };

            hamburger.addEventListener('click', toggleMenu);
                overlay.addEventListener('click', closeMenu);

            menu.querySelectorAll('.nav__link, .nav__cta').forEach(link => {
                            link.addEventListener('click', closeMenu);
            });

            document.addEventListener('keydown', (e) => {
                            if (e.key === 'Escape') closeMenu();
            });
    }

    // FAQ Accordion
    setupFaqAccordion() {
                const questions = document.querySelectorAll('.faq-item__question');
                questions.forEach(btn => {
                                btn.addEventListener('click', () => {
                                                    const expanded = btn.getAttribute('aria-expanded') === 'true';
                                                    const answer = btn.nextElementSibling;

                                                                     questions.forEach(other => {
                                                                                             if (other !== btn) {
                                                                                                                         other.setAttribute('aria-expanded', 'false');
                                                                                                                         other.nextElementSibling.classList.remove('open');
                                                                                                 }
                                                                     });

                                                                     btn.setAttribute('aria-expanded', !expanded);
                                                    answer.classList.toggle('open', !expanded);
                                });
                });
    }

    // Smooth Scroll
    handleAnchorClick(e) {
                const href = e.currentTarget.getAttribute('href');
                if (!href || href === '#') return;

            const target = document.querySelector(href);
                if (!target) return;

            e.preventDefault();
                const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
                window.scrollTo({ top, behavior: 'smooth' });
    }

    // Scroll Animations
    setupScrollAnimations() {
                const observer = new IntersectionObserver((entries) => {
                                entries.forEach(entry => {
                                                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                                                                            entry.target.classList.add('animate-in');
                                                                            this.animatedElements.add(entry.target);
                                                    }
                                });
                }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

            document.querySelectorAll([
                            '.hero__content', '.section__header',
                            '.product__card', '.feature-card',
                            '.compliance-card', '.pricing-card',
                            '.deploy-card', '.integration-card',
                            '.problem__stat', '.pilot-callout',
                            '.faq__list', '.cta__form'
                        ].join(',')).forEach(el => observer.observe(el));
    }

    // Navigation Scroll Effects
    handleScroll() {
                const nav = document.querySelector('.nav');
                if (!nav) return;

            if (window.pageYOffset > 10) {
                            nav.style.boxShadow = '0 1px 12px rgba(0, 0, 0, 0.06)';
            } else {
                            nav.style.boxShadow = 'none';
            }

            this.updateActiveSection();
    }

    updateActiveSection() {
                const sections = document.querySelectorAll('section[id]');
                const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
                let currentSection = '';

            sections.forEach(section => {
                            const top = section.getBoundingClientRect().top;
                            const height = section.offsetHeight;
                            if (top <= navHeight + 120 && top + height > navHeight + 120) {
                                                currentSection = section.getAttribute('id');
                            }
            });

            document.querySelectorAll('.nav__link').forEach(link => {
                            const active = link.getAttribute('href') === `#${currentSection}`;
                            link.classList.toggle('active', active);
            });
    }

    // Counter Animations
    setupCounterAnimations() {
                const counters = document.querySelectorAll('.stat-number[data-target]');
                const observer = new IntersectionObserver((entries) => {
                                entries.forEach(entry => {
                                                    if (entry.isIntersecting) {
                                                                            this.animateCounter(entry.target);
                                                                            observer.unobserve(entry.target);
                                                    }
                                });
                }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(el) {
                const target = parseInt(el.dataset.target, 10);
                const duration = 2000;
                const start = performance.now();

            const tick = (now) => {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            el.textContent = Math.floor(target * eased);
                            if (progress < 1) {
                                                requestAnimationFrame(tick);
                            } else {
                                                el.textContent = target;
                            }
            };

            requestAnimationFrame(tick);
    }

    // Form Validation
    setupFormValidation() {
                const form = document.getElementById('contactForm');
                if (!form) return;

            form.addEventListener('submit', (e) => this.handleFormSubmit(e));

            form.querySelectorAll('input, select, textarea').forEach(input => {
                            input.addEventListener('blur', () => this.validateField(input));
                            input.addEventListener('input', () => this.clearFieldError(input));
            });
    }

    validateField(field) {
                this.clearFieldError(field);
                const value = field.value.trim();

            if (field.hasAttribute('required') && !value) {
                            this.showFieldError(field, `${field.labels?.[0]?.textContent?.replace(' *', '') || 'Field'} is required.`);
                            return false;
            }

            if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            this.showFieldError(field, 'Please enter a valid business email.');
                            return false;
            }

            return true;
    }

    clearFieldError(field) {
                field.classList.remove('error');
                const err = field.parentNode.querySelector('.field-error');
                if (err) err.remove();
    }

    showFieldError(field, message) {
                field.classList.add('error');
                const el = document.createElement('div');
                el.className = 'field-error';
                el.textContent = message;
                el.style.cssText = 'color: var(--error-red); font-size: var(--font-size-xs); margin-top: var(--space-4);';
                field.parentNode.appendChild(el);
    }

    // ---- Form Submission (sends to send-mail.php) ----
    handleFormSubmit(e) {
                e.preventDefault();
                const form = e.target;
                let valid = true;

            form.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
                            if (!this.validateField(input)) valid = false;
            });

            if (!valid) return;

            const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;

            const payload = {
                            name:    form.querySelector('#name').value.trim(),
                            email:   form.querySelector('#email').value.trim(),
                            company: form.querySelector('#company').value.trim(),
                            agents:  form.querySelector('#agents').value,
                            usecase: form.querySelector('#usecase').value,
                            message: form.querySelector('#message').value.trim()
            };

            fetch('send-mail.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
            })
                .then(res => res.json().then(data => ({ ok: res.ok, data })))
                .then(({ ok, data }) => {
                                btn.textContent = originalText;
                                btn.disabled = false;

                                  if (ok && data.ok) {
                                                      form.reset();
                                                      this.showFormMessage(form, 'Thank you! We\'ll be in touch within 24 hours.', 'success');
                                  } else {
                                                      this.showFormMessage(form, data.error || 'Something went wrong. Please try again or email us directly.', 'error');
                                  }
                })
                .catch(() => {
                                btn.textContent = originalText;
                                btn.disabled = false;
                                this.showFormMessage(form, 'Network error. Please try again or email sentinel@frechundwuest.de directly.', 'error');
                });
    }

    showFormMessage(form, message, type) {
                const existing = form.querySelector('.form-message');
                if (existing) existing.remove();

            const el = document.createElement('div');
                el.className = 'form-message';
                el.textContent = message;
                el.style.cssText = `
                            padding: var(--space-12) var(--space-16);
                                        margin-bottom: var(--space-16);
                                                    border-radius: var(--radius-base);
                                                                font-weight: 500;
                                                                            font-size: var(--font-size-sm);
                                                                                        ${type === 'success'
                                                                                                          ? 'background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2);'
                                                                                                          : 'background: rgba(239, 68, 68, 0.1); color: #DC2626; border: 1px solid rgba(239, 68, 68, 0.2);'
                                                                                          }
                                                                                                  `;

            form.insertBefore(el, form.firstChild);

            if (type === 'success') {
                            setTimeout(() => {
                                                el.style.transition = 'opacity 0.3s ease';
                                                el.style.opacity = '0';
                                                setTimeout(() => el.remove(), 300);
                            }, 5000);
            }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
        window.rotomiWebsite = new ROTOMIWebsite();
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('theme-toggle')) {
                    e.preventDefault();
                    e.target.click();
        }
});

/* ===================================================
   BUILDMASTER PRO — MAIN JAVASCRIPT
   =================================================== */

'use strict';

/* --------------------------------------------------
   1. PRELOADER
-------------------------------------------------- */
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('hide'), 2200);
    }
});

/* --------------------------------------------------
   2. STICKY HEADER
-------------------------------------------------- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 80);
});

/* --------------------------------------------------
   3. MOBILE BURGER MENU
-------------------------------------------------- */
const burger  = document.getElementById('burger');
const navbar  = document.getElementById('navbar');

if (burger && navbar) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navbar.classList.toggle('open');
        document.body.style.overflow = navbar.classList.contains('open') ? 'hidden' : '';
    });

    // Close on nav link click
    navbar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navbar.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Mobile dropdown toggle
    navbar.querySelectorAll('.dropdown > a').forEach(toggle => {
        toggle.addEventListener('click', e => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                toggle.closest('.dropdown').classList.toggle('open');
            }
        });
    });
}

/* --------------------------------------------------
   4. HERO SLIDER
-------------------------------------------------- */
(function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero .dot');
    if (!slides.length) return;

    let current = 0;
    let timer;

    function goTo(n) {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }

    function start() { timer = setInterval(next, 5000); }
    function stop()  { clearInterval(timer); }

    dots.forEach((dot, i) => dot.addEventListener('click', () => { stop(); goTo(i); start(); }));
    start();
})();

/* --------------------------------------------------
   5. STATS COUNTER ANIMATION
-------------------------------------------------- */
(function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el    = entry.target;
            const target = +el.dataset.count;
            const dur    = 2200;
            const step   = target / (dur / 16);
            let cur = 0;

            const tick = () => {
                cur += step;
                if (cur >= target) { el.textContent = target.toLocaleString(); return; }
                el.textContent = Math.floor(cur).toLocaleString();
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.4 });

    counters.forEach(c => observer.observe(c));
})();


/* --------------------------------------------------
   6. SCROLL REVEAL ANIMATIONS
-------------------------------------------------- */
(function initScrollReveal() {
    const targets = document.querySelectorAll(
        '.service-card, .project-card, .project-page-card, .team-card, ' +
        '.blog-card, .stat-item, .partner-logo, .award-card, .vm-card, ' +
        '.tl-item, .ci-card, .why-item, .step, .testimonial-card'
    );

    // Add stagger delay based on index within parent
    targets.forEach(el => {
        if (!el.closest('.testimonials-slider')) {
            el.classList.add('reveal');
        }
    });

    // Generic reveal classes
    document.querySelectorAll('.qa-left, .cq-info, .why-left, .sd-content:nth-child(1)').forEach(el => {
        el.classList.add('reveal-left');
    });
    document.querySelectorAll('.qa-right, .why-right, .sd-img').forEach(el => {
        el.classList.add('reveal-right');
    });

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // Calculate stagger based on sibling index
                const siblings = Array.from(el.parentElement?.children || []);
                const idx = siblings.indexOf(el);
                el.style.transitionDelay = `${Math.min(idx * 0.08, 0.5)}s`;

                el.classList.add('visible');
                revealObserver.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });
})();

/* --------------------------------------------------
   7. PROJECT FILTER (index + projects page)
-------------------------------------------------- */
(function initProjectFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards      = document.querySelectorAll('.project-card, .project-page-card');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.style.transition = 'opacity .35s ease, transform .35s ease';
                if (match) {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                    card.style.display = '';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.92)';
                    setTimeout(() => {
                        if (card.dataset.category !== filter && filter !== 'all') {
                            card.style.display = 'none';
                        }
                    }, 350);
                }
            });
        });
    });
})();

/* --------------------------------------------------
   8. TESTIMONIALS SLIDER
-------------------------------------------------- */
(function initTestimonials() {
    const track  = document.querySelector('.testimonial-track');
    const dots   = document.querySelectorAll('.tdot');
    const prev   = document.querySelector('.test-prev');
    const next   = document.querySelector('.test-next');
    if (!track) return;

    let current = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;

    function getPerPage() {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth < 1100) return 2;
        return 3;
    }

    function updateSlider() {
        const perPage = getPerPage();
        const maxIdx  = Math.max(0, total - perPage);
        current = Math.min(current, maxIdx);

        const cardWidth = track.parentElement.offsetWidth / perPage;
        cards.forEach(c => { c.style.minWidth = `${cardWidth - 14}px`; });
        track.style.transform = `translateX(-${current * (cardWidth)}px)`;

        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prev && prev.addEventListener('click', () => { current = Math.max(0, current - 1); updateSlider(); });
    next && next.addEventListener('click', () => {
        const perPage = getPerPage();
        current = Math.min(total - perPage, current + 1);
        updateSlider();
    });
    dots.forEach((d, i) => d.addEventListener('click', () => { current = i; updateSlider(); }));

    // Auto-play
    let autoTimer = setInterval(() => {
        const perPage = getPerPage();
        if (current >= total - perPage) current = 0;
        else current++;
        updateSlider();
    }, 4500);

    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => {
        autoTimer = setInterval(() => {
            const perPage = getPerPage();
            if (current >= total - perPage) current = 0; else current++;
            updateSlider();
        }, 4500);
    });

    window.addEventListener('resize', updateSlider);
    updateSlider();
})();


/* --------------------------------------------------
   9. BACK TO TOP BUTTON
-------------------------------------------------- */
(function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    });

    btn.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

/* --------------------------------------------------
   10. ACTIVE NAV LINK ON SCROLL (Spy)
-------------------------------------------------- */
(function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#navbar a');
    if (!sections.length) return;

    const spy = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}` ||
                        link.getAttribute('href')?.includes(id)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => spy.observe(s));
})();

/* --------------------------------------------------
   11. CONTACT FORM HANDLER
-------------------------------------------------- */
(function initForms() {
    // Quick contact form on index
    const quickForm = document.getElementById('contactForm');
    if (quickForm) {
        quickForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = quickForm.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Xabar Yuborildi!';
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                quickForm.reset();
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 3500);
            }, 1800);
        });
    }

    // Full contact form on contact.html
    const fullForm = document.getElementById('contactFormFull');
    if (fullForm) {
        fullForm.addEventListener('submit', e => {
            e.preventDefault();
            const successMsg = document.querySelector('.success-msg');
            const btn = fullForm.querySelector('button[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yuborilmoqda...';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.disabled = false;
                fullForm.reset();
                if (successMsg) { successMsg.classList.add('show'); setTimeout(() => successMsg.classList.remove('show'), 5000); }
            }, 1800);
        });
    }

    // Newsletter forms
    document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const input = form.querySelector('input');
            const btn   = form.querySelector('button');
            if (!input.value.trim()) return;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            btn.style.background = '#27ae60';
            input.value = '';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
                btn.style.background = '';
            }, 3000);
        });
    });
})();

/* --------------------------------------------------
   12. FAQ ACCORDION
-------------------------------------------------- */
(function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const q = item.querySelector('.faq-q');
        q && q.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            items.forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });
})();

/* --------------------------------------------------
   13. SMOOTH ANCHOR SCROLL
-------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* --------------------------------------------------
   14. NUMBERS / SKILLS PROGRESS BARS
-------------------------------------------------- */
(function initProgressBars() {
    const bars = document.querySelectorAll('.progress-bar[data-width]');
    if (!bars.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    bars.forEach(b => observer.observe(b));
})();

/* --------------------------------------------------
   15. LIGHTBOX (simple image popup)
-------------------------------------------------- */
(function initLightbox() {
    const triggers = document.querySelectorAll('[data-lightbox]');
    if (!triggers.length) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.style.cssText = `
        display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);
        z-index:9999;align-items:center;justify-content:center;
        cursor:pointer;padding:20px;
    `;
    const img = document.createElement('img');
    img.style.cssText = 'max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);';
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position:fixed;top:20px;right:24px;background:var(--orange);border:none;
        color:#fff;width:44px;height:44px;border-radius:50%;font-size:1.1rem;
        cursor:pointer;display:flex;align-items:center;justify-content:center;
    `;
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    triggers.forEach(t => {
        t.addEventListener('click', e => {
            e.preventDefault();
            img.src = t.dataset.lightbox || t.href || t.src;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    [overlay, closeBtn].forEach(el => {
        el.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        });
    });
    img.addEventListener('click', e => e.stopPropagation());
})();

/* --------------------------------------------------
   16. HEADER ACTIVE PAGE HIGHLIGHT
-------------------------------------------------- */
(function highlightCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#navbar a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.split('#')[0] === path) {
            link.classList.add('active');
        }
    });
})();

/* --------------------------------------------------
   17. FLOATING PHONE BUTTON PULSE
-------------------------------------------------- */
(function initFloatingPulse() {
    const phoneBtn = document.querySelector('.phone-btn');
    if (!phoneBtn) return;
    phoneBtn.style.animation = 'pulse 2s ease infinite';
})();

/* --------------------------------------------------
   18. IMAGE LAZY LOADING (native + fallback)
-------------------------------------------------- */
(function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.src = e.target.dataset.src;
                    obs.unobserve(e.target);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => obs.observe(img));
    }
})();

/* --------------------------------------------------
   19. TYPED TEXT EFFECT (Hero subtitle)
-------------------------------------------------- */
(function initTyped() {
    const el = document.querySelector('.hero-badge');
    if (!el) return;
    const texts = ['15 yillik tajriba', 'ISO 9001:2015 sertifikat', '500+ tugallangan loyiha', '120+ malakali mutaxassis'];
    let ti = 0, ci = 0, del = false;

    function tick() {
        const full = texts[ti];
        if (!del && ci <= full.length) {
            el.innerHTML = `<i class="fas fa-award"></i> ${full.slice(0, ci++)}`;
            setTimeout(tick, 80);
        } else if (!del && ci > full.length) {
            del = true;
            setTimeout(tick, 2000);
        } else if (del && ci > 0) {
            el.innerHTML = `<i class="fas fa-award"></i> ${full.slice(0, ci--)}`;
            setTimeout(tick, 40);
        } else {
            del = false;
            ti = (ti + 1) % texts.length;
            setTimeout(tick, 400);
        }
    }
    setTimeout(tick, 2800);
})();

/* --------------------------------------------------
   20. TOOLTIP
-------------------------------------------------- */
(function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
        const tip = document.createElement('span');
        tip.className = 'tooltip-box';
        tip.textContent = el.dataset.tooltip;
        tip.style.cssText = `
            position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
            background:var(--dark);color:#fff;padding:6px 12px;border-radius:8px;
            font-size:.78rem;white-space:nowrap;pointer-events:none;
            opacity:0;transition:opacity .25s ease;z-index:200;
        `;
        el.style.position = 'relative';
        el.appendChild(tip);
        el.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
        el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    });
})();

console.log('%cBuildMaster Pro 🏗️', 'color:#e8890c;font-size:1.4rem;font-weight:800;');
console.log('%cWeb sayt muvaffaqiyatli yuklandi!', 'color:#555;font-size:.9rem;');

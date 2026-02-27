/**
 * iRevolution – Main JavaScript
 * KPI counters, product table, navbar effects, section reveal animations
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ──────────────────────────────────────────────
       Navbar scroll effect
       ────────────────────────────────────────────── */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    /* ──────────────────────────────────────────────
       Mobile menu toggle
       ────────────────────────────────────────────── */
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
        });
    }

    /* ──────────────────────────────────────────────
       Smooth scroll for navigation links
       ────────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                links.classList.remove('open');
            }
        });
    });

    /* ──────────────────────────────────────────────
       Active nav link highlight on scroll
       ────────────────────────────────────────────── */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) {
                current = sec.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });

    /* ──────────────────────────────────────────────
       Intersection Observer – fade-in on scroll
       ────────────────────────────────────────────── */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    /* ──────────────────────────────────────────────
       Hero floating particles
       ────────────────────────────────────────────── */
    const particlesEl = document.getElementById('particles');
    if (particlesEl) {
        for (let i = 0; i < 35; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
            p.style.animationDelay = (Math.random() * 6) + 's';
            p.style.animationDuration = (Math.random() * 10 + 8) + 's';
            particlesEl.appendChild(p);
        }
    }

    /* ──────────────────────────────────────────────
       KPI animated counters (from Flask API)
       ────────────────────────────────────────────── */
    async function loadKPIs() {
        try {
            const res = await fetch('/api/kpis');
            const data = await res.json();

            // Update targets from live data
            const priceK = Math.round(data.avgPrice / 1000);
            setKPI('kpi-products', data.totalProducts, '', '+');
            setKPI('kpi-price', priceK, '₹', 'K');
            setKPI('kpi-rating', Math.floor(data.avgRating), '',
                '.' + String(data.avgRating).split('.')[1]);
            setKPI('kpi-revenue', Math.round(data.latestRevenue), '$', 'B');
        } catch (err) {
            console.warn('KPI API unavailable, using static defaults', err);
        }
    }

    function setKPI(id, target, prefix, suffix) {
        const el = document.getElementById(id);
        if (!el) return;
        el.dataset.target = target;
        el.dataset.prefix = prefix || '';
        el.dataset.suffix = suffix || '';
    }

    // Animate counter when visible
    const kpiGrid = document.getElementById('kpi-grid');
    if (kpiGrid) {
        const kpiObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateKPIs();
                    kpiObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        kpiObs.observe(kpiGrid);
    }

    function animateKPIs() {
        document.querySelectorAll('.kpi-value').forEach(el => {
            const target = parseInt(el.dataset.target) || 0;
            const prefix = el.dataset.prefix || '';
            const suffix = el.dataset.suffix || '';
            let current = 0;
            const step = Math.ceil(target / 40);
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = prefix + current + suffix;
            }, 30);
        });
    }

    /* ──────────────────────────────────────────────
       Product specification table (from Flask API)
       ────────────────────────────────────────────── */
    async function loadProducts() {
        try {
            const res = await fetch('/api/apple-products');
            const data = await res.json();
            renderProducts(data);

            // Search filter
            const searchBox = document.getElementById('productSearch');
            if (searchBox) {
                searchBox.addEventListener('input', () => {
                    const q = searchBox.value.toLowerCase();
                    const filtered = data.filter(p =>
                        p["Product Name"].toLowerCase().includes(q));
                    renderProducts(filtered);
                });
            }
        } catch (err) {
            console.warn('Products API unavailable', err);
        }
    }

    function renderProducts(products) {
        const tbody = document.getElementById('productsBody');
        if (!tbody) return;
        tbody.innerHTML = products.map((p, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${p["Product Name"]}</td>
                <td>₹${Number(p["Sale Price"]).toLocaleString('en-IN')}</td>
                <td>₹${Number(p["Mrp"]).toLocaleString('en-IN')}</td>
                <td>${p["Discount Percentage"]}%</td>
                <td>${Number(p["Number Of Ratings"]).toLocaleString('en-IN')}</td>
                <td>⭐ ${p["Star Rating"]}</td>
                <td>${p["Ram"]}</td>
            </tr>
        `).join('');
    }

    /* ──────────────────────────────────────────────
       Initialize everything
       ────────────────────────────────────────────── */
    loadKPIs();
    loadProducts();
});

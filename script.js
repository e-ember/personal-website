// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});



// Particle system for local mouse responsiveness
function createParticles() {
    const particleGrid = document.getElementById('particleGrid');
    const particleCount = 900;
    
    // Create a more structured, even distribution
    const columns = 36;
    const rows = 24;
    let particleIndex = 0;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (particleIndex >= particleCount) break;
            
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Even grid distribution with some randomness
            const baseX = (col / (columns - 1)) * 100;
            const baseY = (row / (rows - 1)) * 100;
            
            // Add slight randomness to break up the grid pattern
            const randomX = (Math.random() - 0.5) * 8; // ±4% randomness
            const randomY = (Math.random() - 0.5) * 8; // ±4% randomness
            
            particle.style.left = Math.max(0, Math.min(100, baseX + randomX)) + '%';
            particle.style.top = Math.max(0, Math.min(100, baseY + randomY)) + '%';
            
            // Size variation based on position (center particles slightly larger)
            const centerDistance = Math.sqrt(
                Math.pow((baseX - 50) / 50, 2) + 
                Math.pow((baseY - 50) / 50, 2)
            );
            const sizeMultiplier = 1 - (centerDistance * 0.3); // Center particles 30% larger
            const size = (Math.random() * 1.5 + 2) * sizeMultiplier; // 2px to 3.5px
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Opacity variation for depth
            const opacity = Math.random() * 0.4 + 0.15; // 0.15 to 0.55
            const particleColor = `rgba(128, 128, 128, ${opacity})`;
            particle.style.backgroundColor = particleColor;
            particle.dataset.originalColor = particleColor;
            
            // Add some particles with different colors for variety
            if (Math.random() < 0.1) { // 10% chance for slightly different color
                const colorVariation = Math.random() * 40 - 20; // ±20 color variation
                const variedColor = `rgba(${128 + colorVariation}, ${128 + colorVariation}, ${128 + colorVariation}, ${opacity})`;
                particle.style.backgroundColor = variedColor;
                particle.dataset.originalColor = variedColor;
            }
            
            // Add movement properties
            particle.dataset.speedX = (Math.random() - 0.5) * 0.02; // Very slow horizontal movement
            particle.dataset.speedY = (Math.random() - 0.5) * 0.02; // Very slow vertical movement
            particle.dataset.isRed = Math.random() < 0.15; // 15% chance to be red
            particle.dataset.redPhase = Math.random() * Math.PI * 2; // Random starting phase for red fade
            
            particleGrid.appendChild(particle);
            particleIndex++;
        }
    }
    
    // Add some additional random particles for extra density
    const extraParticles = 200;
    for (let i = 0; i < extraParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning for the extra particles
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Smaller size for subtle background effect
        const size = Math.random() * 1.5 + 1.5; // 1.5px to 3px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Lower opacity for subtlety
        const opacity = Math.random() * 0.2 + 0.05; // 0.05 to 0.25
        const particleColor = `rgba(128, 128, 128, ${opacity})`;
        particle.style.backgroundColor = particleColor;
        particle.dataset.originalColor = particleColor;
        
        // Add movement properties
        particle.dataset.speedX = (Math.random() - 0.5) * 0.05; // Even slower for background particles
        particle.dataset.speedY = (Math.random() - 0.5) * 0.05;
        particle.dataset.isRed = Math.random() < 0.2; // 20% chance to be red
        particle.dataset.redPhase = Math.random() * Math.PI * 2;
        
        particleGrid.appendChild(particle);
    }
    
    // Start the particle animation
    animateParticles();
}

// Animate particles with slow movement and red fading
let particleFrame = 0;
let particleList = null;

function animateParticles() {
    particleAnimationId = requestAnimationFrame(animateParticles);

    // The drift is very slow, so update every 3rd frame (with 3x the step) to avoid constant layout work
    particleFrame++;
    if (particleFrame % 3 !== 0) return;

    if (!particleList) {
        particleList = Array.from(document.querySelectorAll('.particle'));
        particleList.forEach(p => {
            p._x = parseFloat(p.style.left);
            p._y = parseFloat(p.style.top);
            p._sx = parseFloat(p.dataset.speedX || 0) * 3;
            p._sy = parseFloat(p.dataset.speedY || 0) * 3;
            p._red = p.dataset.isRed === 'true';
            p._phase = parseFloat(p.dataset.redPhase || 0);
        });
    }
    const time = Date.now() * 0.001;
    updateBursts(time);

    particleList.forEach(particle => {
        let currentX = particle._x + particle._sx;
        let currentY = particle._y + particle._sy;

        // Wrap around edges
        if (currentX < -5) currentX = 105;
        if (currentX > 105) currentX = -5;
        if (currentY < -5) currentY = 105;
        if (currentY > 105) currentY = -5;

        particle._x = currentX;
        particle._y = currentY;
        particle.style.left = currentX + '%';
        particle.style.top = currentY + '%';

        if (particle._active) return;

        // Red particles fade in and out, unless the mouse is currently affecting them
        const burst = particle._burst || 0;
        if (particle._red) {
            const fadeIntensity = Math.max(Math.sin(time * 0.5 + particle._phase) * 0.5 + 0.5, burst);
            particle.style.backgroundColor = `rgba(240, 90, 90, ${Math.max(fadeIntensity * 0.3, burst * 0.6)})`;
            particle.style.boxShadow = `0 0 ${8 + fadeIntensity * 12}px rgba(240, 90, 90, ${fadeIntensity * 0.18})`;
        } else if (burst > 0.01) {
            particle._burstOn = true;
            particle.style.backgroundColor = `rgba(240, 90, 90, ${burst * 0.6})`;
            particle.style.boxShadow = `0 0 ${burst * 14}px rgba(240, 90, 90, ${burst * 0.25})`;
        } else if (particle._burstOn) {
            particle._burstOn = false;
            particle.style.backgroundColor = particle.dataset.originalColor || 'rgba(128, 128, 128, 0.3)';
            particle.style.boxShadow = 'none';
        }
    });
}

// Small circular bursts of reddish dots that swell in and fade back out
const particleBursts = [];
let nextBurstTime = 0;

function updateBursts(time) {
    if (time >= nextBurstTime && particleBursts.length < 3) {
        particleBursts.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: 90 + Math.random() * 90,
            start: time,
            duration: 3 + Math.random() * 2
        });
        nextBurstTime = time + 0.8 + Math.random() * 1.7;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    particleList.forEach(p => { p._burst = 0; });

    for (let i = particleBursts.length - 1; i >= 0; i--) {
        const burst = particleBursts[i];
        const t = (time - burst.start) / burst.duration;
        if (t >= 1) {
            particleBursts.splice(i, 1);
            continue;
        }
        const envelope = Math.sin(t * Math.PI);
        const radius = burst.radius * (0.4 + 0.6 * t);

        particleList.forEach(p => {
            const dx = p._x / 100 * vw - burst.x;
            const dy = p._y / 100 * vh - burst.y;
            if (Math.abs(dx) > radius || Math.abs(dy) > radius) return;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= radius) return;
            const value = envelope * (1 - (d / radius) ** 2);
            if (value > p._burst) p._burst = value;
        });
    }
}

// Particle animation variables
let mouseX = 0;
let mouseY = 0;
let animationFrameId = null;
let particleAnimationId = null;

function updateParticles() {
    if (!particleList) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const effectRadius = 120;

    particleList.forEach(particle => {
        // Position is computed from the cached percentages, avoiding a layout read per particle
        const particleX = particle._x / 100 * vw;
        const particleY = particle._y / 100 * vh;

        const dx = particleX - mouseX;
        const dy = particleY - mouseY;
        if (Math.abs(dx) > effectRadius || Math.abs(dy) > effectRadius) {
            if (particle._active) resetParticle(particle);
            return;
        }
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < effectRadius) {
            const intensity = 1 - (distance / effectRadius);
            particle._active = true;
            particle.classList.add('hovered');

            if (particle._red) {
                particle.style.backgroundColor = `rgba(240, 90, 90, ${Math.min(intensity * 0.45 + 0.1, 0.55)})`;
            } else {
                particle.style.backgroundColor = `rgba(240, 90, 90, ${Math.min(intensity * 0.5, 0.5)})`;
            }

            const scale = 1 + (intensity * 0.8);
            const length = distance || 1;
            const pushDistance = intensity * 15; // Maximum 15px push
            const translateX = (dx / length) * pushDistance;
            const translateY = (dy / length) * pushDistance;

            particle.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            particle.style.boxShadow = `0 0 ${12 + intensity * 20}px rgba(240, 90, 90, ${intensity * 0.3})`;
        } else if (particle._active) {
            resetParticle(particle);
        }
    });
}

function resetParticle(particle) {
    particle._active = false;
    particle.classList.remove('hovered');
    if (!particle._red) {
        particle.style.backgroundColor = particle.dataset.originalColor || 'rgba(128, 128, 128, 0.3)';
        particle.style.boxShadow = 'none';
    }
    particle.style.transform = 'scale(1) translate(0px, 0px)';
}

// Throttled mouse tracking for better performance
function throttledUpdateParticles() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(updateParticles);
}

// Typing animation function
function typeWriter(element, text, speed = 100) {
    return new Promise((resolve) => {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Delete text function
function deleteText(element, speed = 50) {
    return new Promise((resolve) => {
        const text = element.textContent;
        let i = text.length;
        
        function deleteChar() {
            if (i > 0) {
                element.textContent = text.substring(0, i - 1);
                i--;
                setTimeout(deleteChar, speed);
            } else {
                // Add a non-breaking space to maintain cursor position
                element.innerHTML = '&nbsp;';
                resolve();
            }
        }
        deleteChar();
    });
}

// Main typing animation loop
async function startTypingAnimation() {
    const phrases = [
        "software engineer",
        "applied AI researcher", 
        "Computer Science @ UC Santa Cruz"
    ];
    
    const typingElement = document.querySelector('.typing-text');
    
    while (true) {
        for (const phrase of phrases) {
            // Type the phrase
            await typeWriter(typingElement, phrase, 80);
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Delete the phrase
            await deleteText(typingElement, 50);
            
            // Brief pause before next phrase
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

// Scroll-triggered animations
function handleScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    const skillTags = document.querySelectorAll('.skill-tag');
    const projectCards = document.querySelectorAll('.project-card');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.8) {
            section.classList.add('visible');
        }
    });
    
    // Animate timeline items with staggered delay
    timelineItems.forEach((item, index) => {
        const itemTop = item.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (itemTop < windowHeight * 0.92) {
            setTimeout(() => {
                item.classList.add('visible');
            }, Math.min(index, 2) * 40);
        }
    });
    
    // Animate skill tags with staggered delay
    skillTags.forEach((tag, index) => {
        const tagTop = tag.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (tagTop < windowHeight * 0.8) {
            setTimeout(() => {
                tag.classList.add('visible');
            }, index * 100);
        }
    });
    
    // Animate project cards with staggered delay
    projectCards.forEach((card, index) => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (cardTop < windowHeight * 0.8) {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 300);
        }
    });
}

// Polaroids that "snap" into place beside the experience timeline
const POLAROIDS = [
    { side: 'left',  top: '2%',  dy: 0,   dx: 0,   rot: -7, src: 'images/hpe%20pres.png' },
    { side: 'left',  top: '2%',  dy: 150, dx: 62,  rot: 5,  src: 'images/baskin.jpg' },
    { side: 'right', top: '12%', dy: 0,   dx: 0,   rot: 6,  src: 'images/picnic_selfie.jpg' },
    { side: 'left',  top: '36%', dy: 0,   dx: 0,   rot: 4,  src: 'images/avs.jpg' },
    { side: 'right', top: '40%', dy: 0,   dx: 0,   rot: -5, src: 'images/paper.png' },
    { side: 'right', top: '40%', dy: 160, dx: 70,  rot: 8,      src: 'images/rsac.jpg' },
    { side: 'left',  top: '62%', dy: 0,   dx: 0,   rot: -6, src: 'images/gwc.jpg' },
    { side: 'left',  top: '62%', dy: 160, dx: 70,  rot: 7,  src: 'images/gdgc.png' },
    { side: 'right', top: '78%', dy: 0,   dx: 0,   rot: -4, src: 'images/scai%20group%202.jpg' },
    { side: 'left',  top: '88%', dy: 0,   dx: 0,   rot: 5,  src: 'images/hackdev%20shirts.jpg' }
];

const HERO_POLAROIDS = [
    { side: 'left',  rot: -6, src: 'images/talking.jpg' },
    { side: 'right', rot: 5,  src: 'images/hackdev%20team.jpg' }
];

function initPolaroids() {
    const timeline = document.querySelector('.timeline');
    const hero = document.querySelector('.hero');
    if (!timeline) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const polaroid = entry.target;
            observer.unobserve(polaroid);

            const reveal = () => polaroid.classList.add('pop');
            if (reduceMotion || getComputedStyle(polaroid).display === 'none') {
                reveal();
                return;
            }

            const container = polaroid.parentElement;
            const isHero = container === hero;
            const start = () => {
                const label = document.createElement('span');
                label.className = `snap-label ${polaroid.dataset.side}${isHero ? ' hero-snap' : ''}`;
                label.textContent = 'snap!';
                label.style.cssText = polaroid.style.cssText;
                container.appendChild(label);

                setTimeout(() => {
                    label.remove();
                    reveal();
                }, 700);
            };
            setTimeout(start, isHero ? (polaroid.dataset.side === 'left' ? 400 : 900) : 0);
        });
    }, { rootMargin: '0px 0px -20% 0px' });

    POLAROIDS.forEach(item => {
        const polaroid = document.createElement('div');
        polaroid.className = `polaroid ${item.side}`;
        polaroid.dataset.side = item.side;
        polaroid.style.cssText = `--top: ${item.top}; --dy: ${item.dy}px; --dx: ${item.dx}px; --rot: ${item.rot}deg;`;

        const img = document.createElement('img');
        img.src = item.src;
        img.alt = '';
        img.loading = 'lazy';
        polaroid.appendChild(img);

        timeline.appendChild(polaroid);
        observer.observe(polaroid);
    });

    if (!hero) return;
    HERO_POLAROIDS.forEach(item => {
        const polaroid = document.createElement('div');
        polaroid.className = `polaroid hero-polaroid ${item.side}`;
        polaroid.dataset.side = item.side;
        polaroid.style.cssText = `--rot: ${item.rot}deg;`;

        const img = document.createElement('img');
        img.src = item.src;
        img.alt = '';
        polaroid.appendChild(img);

        hero.appendChild(polaroid);
        observer.observe(polaroid);
    });
}

function initProjectSlideshow() {
    const slideshow = document.querySelector('.project-slideshow');
    if (!slideshow) return;

    const slides = Array.from(slideshow.querySelectorAll('.project-row'));
    const previousButton = slideshow.querySelector('.project-previous');
    const nextButton = slideshow.querySelector('.project-next');
    const dotsContainer = slideshow.querySelector('.project-dots');
    const counter = slideshow.querySelector('.project-counter');
    let activeIndex = 0;

    if (!slides.length || !previousButton || !nextButton || !dotsContainer || !counter) return;

    const dots = slides.map((slide, index) => {
        const dot = document.createElement('button');
        dot.className = 'project-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Show project ${index + 1}`);
        dot.addEventListener('click', () => showSlide(index));
        dotsContainer.appendChild(dot);
        return dot;
    });

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            slide.classList.toggle('is-active', isActive);
            slide.classList.toggle('is-before', slideIndex < activeIndex);
            slide.inert = !isActive;
            slide.setAttribute('aria-label', `${slideIndex + 1} of ${slides.length}`);
        });
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-current', String(isActive));
        });
        counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    }

    previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
    nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
    slideshow.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            showSlide(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            showSlide(activeIndex + 1);
        }
    });

    showSlide(activeIndex);
}

// Flickering flame that sits above the projects title
function initFlame() {
    const section = document.querySelector('#projects');
    if (!section) return;

    const flame = document.createElement('div');
    flame.className = 'flame';
    flame.setAttribute('aria-hidden', 'true');
    flame.innerHTML = `
        <svg viewBox="0 0 60 80" preserveAspectRatio="none">
            <path class="flame-outer" d="M30 2 C34 18 52 28 52 50 C52 66 42 78 30 78 C18 78 8 66 8 50 C8 40 14 33 18 26 C20 34 24 36 26 36 C24 24 26 12 30 2 Z" fill="#f05a5a"/>
            <path class="flame-mid" d="M30 24 C33 34 44 42 44 55 C44 67 38 75 30 75 C22 75 16 67 16 55 C16 48 20 44 23 40 C25 45 27 46 28 46 C27 38 28 30 30 24 Z" fill="#ff9a3c"/>
            <path class="flame-core" d="M30 46 C32 52 38 56 38 63 C38 70 34 74 30 74 C26 74 22 70 22 63 C22 58 26 55 27 52 C28 54 29 54 29 54 C29 51 29 48 30 46 Z" fill="#ffe27a"/>
        </svg>`;
    const title = section.querySelector('.container > h2');
    if (title) title.before(flame);
}

// Add some subtle animations on page load
window.addEventListener('load', function() {
    const heroContent = document.querySelector('.hero-content');
    const themeToggle = document.querySelector('.theme-toggle');

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.dataset.theme !== 'light';
        document.body.dataset.theme = isLight ? 'light' : 'dark';
        themeToggle.setAttribute('aria-pressed', String(isLight));

        const mode = isLight ? 'dark' : 'light';
        themeToggle.setAttribute('aria-label', `Switch to ${mode} mode`);
        themeToggle.title = `Switch to ${mode} mode`;
        themeToggle.querySelector('.theme-toggle-icon').innerHTML = isLight
            ? '<svg viewBox="0 0 24 24" focusable="false"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"></path></svg>'
            : '<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>';
    });

    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    
    initPolaroids();
    initProjectSlideshow();
    initFlame();

    // Create particles
    createParticles();
    
    // Set up mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        throttledUpdateParticles();
    });
    
    setTimeout(() => {
        heroContent.style.transition = 'all 0.8s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
        
        // Start typing animation after hero content appears
        setTimeout(() => {
            startTypingAnimation();
        }, 1000);
    }, 100);
    
    // Set up scroll event listeners
    window.addEventListener('scroll', () => {
        handleScrollAnimations();
    });
    
    // Initial check for elements in view
    handleScrollAnimations();
});

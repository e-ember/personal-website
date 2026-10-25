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

        // Red particles fade in and out, unless the mouse is currently affecting them
        if (particle._red && !particle._active) {
            const fadeIntensity = Math.sin(time * 0.5 + particle._phase) * 0.5 + 0.5;
            particle.style.backgroundColor = `rgba(240, 90, 90, ${fadeIntensity * 0.3})`;
            particle.style.boxShadow = `0 0 ${8 + fadeIntensity * 12}px rgba(240, 90, 90, ${fadeIntensity * 0.18})`;
        }
    });
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
        
        if (itemTop < windowHeight * 0.8) {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 200);
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

// Rocket that zig-zags down the projects section as you scroll
function initRocket() {
    const section = document.querySelector('#projects');
    if (!section) return;

    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    rocket.setAttribute('aria-hidden', 'true');
    rocket.innerHTML = `
        <svg viewBox="0 0 70 140">
            <g class="rocket-cloud" fill="#f4f6fa">
                <circle cx="35" cy="102" r="14"/>
                <circle cx="20" cy="112" r="11"/>
                <circle cx="50" cy="112" r="11"/>
                <circle cx="35" cy="124" r="12"/>
                <circle cx="26" cy="132" r="8"/>
                <circle cx="44" cy="132" r="8"/>
            </g>
            <path d="M35 0 C52 16 54 46 50 78 L20 78 C16 46 18 16 35 0 Z" fill="#f4f6fa"/>
            <path d="M20 58 L6 88 L22 80 Z M50 58 L64 88 L48 80 Z" fill="#f05a5a"/>
            <path d="M35 0 C44 8 48 16 50 26 L20 26 C22 16 26 8 35 0 Z" fill="#f05a5a"/>
            <circle cx="35" cy="46" r="8" fill="#2b3a55" stroke="#d94a4a" stroke-width="3"/>
            <path d="M26 78 L44 78 L40 90 L30 90 Z" fill="#d94a4a"/>
        </svg>`;
    section.appendChild(rocket);

    const swings = 5;
    const position = (p) => {
        const w = section.clientWidth;
        const h = section.clientHeight;
        const row = section.querySelector('.project-row');
        const amp = row ? row.offsetWidth / 2 + 45 : Math.min(w * 0.42, 600);
        const phase = p * swings * Math.PI;
        return {
            x: Math.min(w - 32, Math.max(0, w / 2 + amp * Math.sin(phase) - 16)),
            y: p * h,
            dx: amp * swings * Math.PI * Math.cos(phase),
            dy: h
        };
    };

    const update = () => {
        const rect = section.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - rect.top) / rect.height));
        const pos = position(p);
        const angle = Math.atan2(pos.dx, -pos.dy) * 180 / Math.PI;
        rocket.style.transform = `translate(${pos.x}px, ${pos.y - 32}px) rotate(${angle}deg)`;
        rocket.style.opacity = rect.top < window.innerHeight && rect.bottom > 0 ? '1' : '0';
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
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
    initRocket();

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

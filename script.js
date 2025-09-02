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
    const particleCount = 600; // Reduced for better performance with movement
    
    // Create a more structured, even distribution
    const columns = 30; // 30 columns
    const rows = 20;    // 20 rows
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
            particle.dataset.isOrange = Math.random() < 0.15; // 15% chance to be orange
            particle.dataset.orangePhase = Math.random() * Math.PI * 2; // Random starting phase for orange fade
            
            particleGrid.appendChild(particle);
            particleIndex++;
        }
    }
    
    // Add some additional random particles for extra density
    const extraParticles = 150;
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
        particle.dataset.isOrange = Math.random() < 0.2; // 20% chance to be orange
        particle.dataset.orangePhase = Math.random() * Math.PI * 2;
        
        particleGrid.appendChild(particle);
    }
    
    // Start the particle animation
    animateParticles();
}

// Animate particles with slow movement and orange fading
function animateParticles() {
    const particles = document.querySelectorAll('.particle');
    const time = Date.now() * 0.001; // Current time in seconds
    
    particles.forEach(particle => {
        // Get current position
        let currentX = parseFloat(particle.style.left);
        let currentY = parseFloat(particle.style.top);
        
        // Get movement speeds
        const speedX = parseFloat(particle.dataset.speedX || 0);
        const speedY = parseFloat(particle.dataset.speedY || 0);
        
        // Update position with very slow movement
        currentX += speedX;
        currentY += speedY;
        
        // Wrap around edges
        if (currentX < -5) currentX = 105;
        if (currentX > 105) currentX = -5;
        if (currentY < -5) currentY = 105;
        if (currentY > 105) currentY = -5;
        
        // Apply new position
        particle.style.left = currentX + '%';
        particle.style.top = currentY + '%';
        
        // Handle orange particles fading
        if (particle.dataset.isOrange === 'true') {
            const phase = parseFloat(particle.dataset.orangePhase || 0);
            const fadeIntensity = Math.sin(time * 0.5 + phase) * 0.5 + 0.5; // Fade between 0 and 1
            
            // Create orange color with varying intensity
            const orangeColor = `rgba(255, 140, 0, ${fadeIntensity * 0.6})`;
            particle.style.backgroundColor = orangeColor;
            
            // Add subtle glow effect for orange particles
            particle.style.boxShadow = `0 0 ${8 + fadeIntensity * 12}px rgba(255, 140, 0, ${fadeIntensity * 0.4})`;
        }
    });
    
    // Continue animation
    particleAnimationId = requestAnimationFrame(animateParticles);
}

// Particle animation variables
let mouseX = 0;
let mouseY = 0;
let animationFrameId = null;
let particleAnimationId = null;

function updateParticles() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach(particle => {
        const rect = particle.getBoundingClientRect();
        const particleX = rect.left + rect.width / 2;
        const particleY = rect.top + rect.height / 2;
        
        // Calculate distance from mouse to particle
        const distance = Math.sqrt(
            Math.pow(mouseX - particleX, 2) + 
            Math.pow(mouseY - particleY, 2)
        );
        
        // Effect radius (particles within 120px respond for better coverage)
        const effectRadius = 120;
        
        if (distance < effectRadius) {
            // Calculate effect intensity based on proximity
            const intensity = 1 - (distance / effectRadius);
            
            // Add hovered class for fast transitions
            particle.classList.add('hovered');
            
            // Override orange particles with mouse interaction
            if (particle.dataset.isOrange === 'true') {
                particle.style.backgroundColor = `rgba(255, 140, 0, ${intensity * 0.8})`;
            } else {
                // Change color to orange based on proximity
                const orangeIntensity = Math.min(intensity * 0.9, 0.9);
                particle.style.backgroundColor = `rgba(255, 140, 0, ${orangeIntensity})`;
            }
            
            // Scale effect based on proximity
            const scale = 1 + (intensity * 0.8);
            
            // Calculate direction vector from mouse to particle
            const dirX = particleX - mouseX;
            const dirY = particleY - mouseY;
            
            // Normalize the direction vector
            const length = Math.sqrt(dirX * dirX + dirY * dirY);
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;
            
            // Move particle away from mouse (push effect)
            const pushDistance = intensity * 15; // Maximum 15px push
            const translateX = normalizedDirX * pushDistance;
            const translateY = normalizedDirY * pushDistance;
            
            particle.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
            
            // Glow effect based on proximity
            const glowIntensity = intensity * 0.7;
            particle.style.boxShadow = `0 0 ${12 + intensity * 20}px rgba(255, 140, 0, ${glowIntensity})`;
        } else {
            // Remove hovered class for slow reset
            particle.classList.remove('hovered');
            
            // Reset to original state, but preserve orange particles
            if (particle.dataset.isOrange === 'true') {
                // Let the orange particle animation continue
                const time = Date.now() * 0.001;
                const phase = parseFloat(particle.dataset.orangePhase || 0);
                const fadeIntensity = Math.sin(time * 0.5 + phase) * 0.5 + 0.5;
                const orangeColor = `rgba(255, 140, 0, ${fadeIntensity * 0.6})`;
                particle.style.backgroundColor = orangeColor;
                particle.style.boxShadow = `0 0 ${8 + fadeIntensity * 12}px rgba(255, 140, 0, ${fadeIntensity * 0.4})`;
            } else {
                // Reset non-orange particles
                const originalColor = particle.dataset.originalColor || 'rgba(128, 128, 128, 0.3)';
                particle.style.backgroundColor = originalColor;
                particle.style.boxShadow = 'none';
            }
            
            particle.style.transform = 'scale(1) translate(0px, 0px)';
        }
    });
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
        "software developer",
        "machine learning researcher", 
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

// Particle fade effect based on scroll
function handleParticleFade() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const particlesContainer = document.querySelector('.particles-container');
    
    if (particlesContainer) {
        // Start fading particles when entering about section
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            const aboutTop = aboutSection.offsetTop;
            const aboutHeight = aboutSection.offsetHeight;
            
            if (scrollY >= aboutTop - windowHeight) {
                // Calculate fade based on position within about section
                const fadeStart = aboutTop - windowHeight;
                const fadeEnd = aboutTop + (aboutHeight * 0.3);
                const opacity = Math.max(0, 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart)));
                particlesContainer.style.opacity = opacity;
            } else {
                particlesContainer.style.opacity = 1;
            }
        }
    }
}

// Add some subtle animations on page load
window.addEventListener('load', function() {
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(20px)';
    
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
        handleParticleFade();
    });
    
    // Initial check for elements in view
    handleScrollAnimations();
});

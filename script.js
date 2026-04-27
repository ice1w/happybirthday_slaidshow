// --- НАСТРОЙКИ ---
const config = {
    photosCount: 20,         // Количество фото в папке photos
    photoFormat: ".jpg",     // Формат твоих фото
    messages: ["3", "2", "1", "C", "ДНЕМ", "РОЖДЕНИЯ", "ВЕРА"],
    matrixColor: "#ff007f",
    particleColor: "#ff0044", // Цвет интерактивных частиц
    heartScale: 18           // Размер сердца (можно менять от 15 до 20)
};

// --- 1. MATRIX ENGINE (Матричный дождь) ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const columns = Math.floor(width / 20);
const drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = config.matrixColor;
    ctx.font = '15px monospace';

    drops.forEach((y, i) => {
        const text = Math.random() > 0.5 ? "0" : "1";
        ctx.fillText(text, i * 20, y * 20);
        if (y * 20 > height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
let matrixInterval = setInterval(drawMatrix, 35);


// --- 2. SEQUENCE CONTROL (Ускоренный отсчет и переходы) ---
const overlay = document.getElementById('text-overlay');
const musicBtn = document.getElementById('music-btn');
const audio = document.getElementById('bg-music');

musicBtn.onclick = () => {
    audio.play();
    musicBtn.style.display = 'none';
    startSequence();
};

function startSequence() {
    let tl = gsap.timeline();
    
    config.messages.forEach((msg) => {
        tl.to(overlay, {
            onStart: () => { overlay.innerText = msg; },
            opacity: 1, 
            scale: 1.2, 
            duration: 0.5, // УСКОРЕНО: появление
            ease: "back.out(2)"
        }).to(overlay, { 
            opacity: 0, 
            scale: 2, 
            duration: 0.1, // УСКОРЕНО: исчезновение
            delay: 0.2      // УСКОРЕНО: задержка между словами
        });
    });

    // Эффект "прыжка в гиперпространство"
    tl.to("#canvas-container", { 
        scale: 10, 
        opacity: 0, 
        duration: 1.5, 
        ease: "power4.in",
        onComplete: startGalaxy 
    });
}


// --- 3. HEART & PARTICLES ENGINE (Сборка и пульсация) ---
let mouse = { x: null, y: null, radius: 150 };

function startGalaxy() {
    clearInterval(matrixInterval);
    document.getElementById('canvas-container').style.display = 'none';
    const galaxy = document.getElementById('galaxy-screen');
    galaxy.style.display = 'block';
    gsap.to(galaxy, { opacity: 1, duration: 2 });

    buildHeart();
    initParticles();
}

function buildHeart() {
    const container = document.getElementById('photo-container');
    const heartCards = [];

    for (let i = 1; i <= config.photosCount; i++) {
        const frame = document.createElement('div');
        frame.className = 'photo-frame';
        frame.innerHTML = `<img src="photos/${i}${config.photoFormat}" onerror="this.src='https://via.placeholder.com/120x160?text=Photo+${i}'">`;
        container.appendChild(frame);
        heartCards.push(frame);

        // Математика сердца
        const t = (i / config.photosCount) * 2 * Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));

        // Анимация прилета фоток
        gsap.to(frame, {
            x: x * config.heartScale, 
            y: y * config.heartScale,
            rotationZ: Math.random() * 20 - 10,
            rotationY: Math.random() * 30 - 15,
            opacity: 1, 
            scale: 1,
            duration: 2, 
            delay: 0.5 + (i * 0.1),
            ease: "elastic.out(1, 0.5)",
            onComplete: () => {
                if (i === config.photosCount) {
                    startFinalEffects(heartCards);
                }
            }
        });
    }
}

// ФИНАЛЬНАЯ КОНЦОВКА: Пульс и Текст
function startFinalEffects(cards) {
    // 1. Пульсация сердца (Beat)
    gsap.to(cards, {
        scale: 1.1,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: {
            amount: 0.3,
            from: "center"
        }
    });

    // 2. Появление финального текста
    const finalMsg = document.createElement('div');
    finalMsg.id = 'final-text';
    finalMsg.innerText = "I LOVE YOU"; // МОЖНО ИЗМЕНИТЬ
    document.getElementById('galaxy-screen').appendChild(finalMsg);

    gsap.fromTo(finalMsg, 
        { opacity: 0, scale: 0, filter: "blur(20px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2.5, ease: "elastic.out(1, 0.3)" }
    );
}

// --- 4. PHYSICS PARTICLES (Интерактивные частицы) ---
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas.getContext('2d');
let particlesArray = [];

function initParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
    
    for (let i = 0; i < 180; i++) {
        let size = Math.random() * 3 + 1;
        let x = Math.random() * pCanvas.width;
        let y = Math.random() * pCanvas.height;
        particlesArray.push({
            x: x, y: y,
            baseX: x, baseY: y,
            size: size,
            density: (Math.random() * 40) + 1,
            color: Math.random() > 0.8 ? config.particleColor : "#ffffff"
        });
    }
    animateParticles();
}

function animateParticles() {
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        let p = particlesArray[i];
        
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * p.density;
        let directionY = forceDirectionY * force * p.density;

        if (distance < mouse.radius) {
            p.x -= directionX;
            p.y -= directionY;
        } else {
            if (p.x !== p.baseX) {
                let dx = p.x - p.baseX;
                p.x -= dx / 15;
            }
            if (p.y !== p.baseY) {
                let dy = p.y - p.baseY;
                p.y -= dy / 15;
            }
        }

        pCtx.fillStyle = p.color;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
    }
    requestAnimationFrame(animateParticles);
}

// ИВЕНТЫ
window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
window.addEventListener('touchmove', (e) => { 
    mouse.x = e.touches[0].clientX; 
    mouse.y = e.touches[0].clientY; 
});
window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    pCanvas.width = window.innerWidth;
    pCanvas.height = window.innerHeight;
});
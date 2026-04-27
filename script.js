// --- КОНФИГУРАЦИЯ ---
const config = {
    numPhotos: 16, // Сколько фоток у тебя в папке photos
    messages: ["3", "2", "1", "HAPPY", "BIRTHDAY", "FOR YOU"],
    matrixColor: "#ff007f",
    heartScale: 18 // Размер сердца
};

// 1. ЛОГИКА МАТРИЦЫ
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const fontSize = 18;
const columns = canvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = config.matrixColor;
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = alphabet[Math.floor(Math.random() * alphabet.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
let matrixInterval = setInterval(drawMatrix, 35);

// 2. ЛОГИКА ТЕКСТА
const overlay = document.getElementById('overlay-text');
let currentMsg = 0;

function showNextMessage() {
    if (currentMsg < config.messages.length) {
        overlay.innerText = config.messages[currentMsg];
        gsap.fromTo(overlay, { opacity: 0, scale: 0.5 }, { 
            opacity: 1, scale: 1, duration: 0.7, 
            onComplete: () => {
                setTimeout(() => {
                    gsap.to(overlay, { opacity: 0, scale: 1.5, duration: 0.4, onComplete: showNextMessage });
                }, 1000);
            }
        });
        currentMsg++;
    } else {
        transitionToGift();
    }
}

// 3. ПЕРЕХОД И СЕРДЦЕ
function transitionToGift() {
    clearInterval(matrixInterval);
    gsap.to("#matrix-screen", { opacity: 0, duration: 1.5, onComplete: () => {
        document.getElementById('matrix-screen').style.display = 'none';
        document.getElementById('gift-screen').style.display = 'block';
        gsap.to("#gift-screen", { opacity: 1, duration: 1.5, onComplete: createHeart });
    }});
}

function createHeart() {
    const container = document.getElementById('photo-heart-container');
    
    // Создаем звезды
    for(let i=0; i<100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.setProperty('--duration', Math.random() * 3 + 2 + 's');
        document.getElementById('gift-screen').appendChild(star);
    }

    // Фото в форме сердца
    for (let i = 0; i < config.numPhotos; i++) {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `<img src="photos/${i + 1}.jpg" alt="photo">`;
        container.appendChild(card);

        const t = (i / config.numPhotos) * 2 * Math.PI;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        gsap.to(card, {
            x: x * config.heartScale,
            y: y * config.heartScale,
            rotation: Math.random() * 15 - 7.5,
            opacity: 1, scale: 1,
            duration: 1.2, delay: i * 0.1,
            ease: "back.out(1.7)"
        });
    }
}

setTimeout(showNextMessage, 1000);
document.body.addEventListener('click', () => document.getElementById('bgMusic').play(), { once: true });
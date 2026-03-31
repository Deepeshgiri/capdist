let soundVolume = 0.5;
let audioContext = null;
const DISCORD_ID = '505285489776001024';
const planets = ['🪐 Saturn', '🌍 Earth', '🔴 Mars', '🌙 Moon', '⭐ Andromeda', '🌌 Milky Way', '☄️ Asteroid Belt'];

const tracks = [null, null, null]; // populated after DOM ready
let currentTrack = null;

document.addEventListener('DOMContentLoaded', () => {
    tracks[0] = document.getElementById('music1');
    tracks[1] = document.getElementById('music2');
    tracks[2] = document.getElementById('music3');

    initAudioContext();
    setupVolumeControl();
    setupMagicCursor();
    initVideo();
    setupSocialLinks();
    fetchLanyardData();
    trackVisitor();
    setRandomLocation();
    playSound('notification');
    initSwiper();
    setInterval(fetchLanyardData, 30000);
});

function initSwiper() {
    const swiper = new Swiper('.swiper-container', {
        loop: true,
        speed: 600,
        grabCursor: true,
        centeredSlides: true,
        pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        keyboard: { enabled: true }
    });

    // Play music for the first slide on first user interaction
    const startMusic = () => {
        switchTrack(swiper.realIndex);
        document.removeEventListener('click', startMusic);
        document.removeEventListener('keydown', startMusic);
    };
    document.addEventListener('click', startMusic);
    document.addEventListener('keydown', startMusic);

    swiper.on('slideChange', () => switchTrack(swiper.realIndex));
}

function switchTrack(index) {
    tracks.forEach((t, i) => {
        if (!t) return;
        if (i === index) {
            t.volume = soundVolume;
            t.play().catch(() => {});
        } else {
            t.pause();
            t.currentTime = 0;
        }
    });
    currentTrack = tracks[index];
}

function setRandomLocation() {
    const location = planets[Math.floor(Math.random() * planets.length)];
    ['location', 'location2', 'location3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = location;
    });
}

async function fetchLanyardData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await response.json();

        if (data.success) {
            const user = data.data.discord_user;
            const status = data.data.discord_status;
            const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
            const displayName = user.display_name || user.global_name;

            const statusMap = {
                'online':  { text: 'Online',          color: '#43b581' },
                'idle':    { text: 'Idle',             color: '#faa61a' },
                'dnd':     { text: 'Do Not Disturb',   color: '#f04747' },
                'offline': { text: 'Offline',          color: '#747f8d' }
            };
            const currentStatus = statusMap[status] || statusMap['offline'];

            // suffixes: '' for slide 1, '2' for slide 2, '3' for slide 3
            ['', '2', '3'].forEach(s => {
                const get = id => document.getElementById(id + s);
                const avatar  = get('discordAvatar');
                const dtAvatar = get('dogtagAvatar');
                const name    = get('discordName');
                const dtName  = get('dogtagName');
                const dtUser  = get('dogtagUsername');
                const dot     = get('statusDot');
                const txt     = get('statusText');

                if (avatar)   avatar.src = avatarUrl;
                if (dtAvatar) dtAvatar.src = avatarUrl;
                if (name)     name.textContent = displayName;
                if (dtName)   dtName.innerHTML = `${displayName} <br>(CAP彡DIST)`;
                if (dtUser)   dtUser.textContent = `@${user.username}`;
                if (dot)      dot.style.color = currentStatus.color;
                if (txt)      txt.textContent = currentStatus.text;
            });
        }
    } catch (error) {
        console.error('Error fetching Lanyard data:', error);
    }
}

function trackVisitor() {
    let visitors = parseInt(localStorage.getItem('visitorCount') || '0');
    visitors++;
    localStorage.setItem('visitorCount', visitors);
    ['visitorCount', 'visitorCount2', 'visitorCount3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = visitors;
    });
}

function initVideo() {
    document.querySelectorAll('.slide-video').forEach(video => {
        video.play().catch(() => {
            document.addEventListener('click', () => video.play(), { once: true });
        });
    });
}

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function setupVolumeControl() {
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeControl = document.getElementById('volumeControl');

    volumeBtn.addEventListener('click', () => volumeSlider.classList.toggle('active'));

    volumeControl.addEventListener('input', (e) => {
        soundVolume = e.target.value / 100;
        updateVolumeIcon(soundVolume);
        // sync music volume live
        tracks.forEach(t => { if (t) t.volume = soundVolume; });
    });

    document.addEventListener('click', (e) => {
        if (!volumeBtn.contains(e.target) && !volumeSlider.contains(e.target)) {
            volumeSlider.classList.remove('active');
        }
    });
}

function updateVolumeIcon(volume) {
    const icon = document.querySelector('#volumeBtn .icon');
    icon.textContent = volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';
}

const sounds = {
    hover:        { frequency: 800,                        duration: 0.1  },
    click:        { frequency: 600,                        duration: 0.2  },
    notification: { frequency: [523.25, 659.25, 783.99],   duration: 0.15 }
};

function playSound(soundName) {
    if (soundVolume === 0 || !audioContext) return;
    const sound = sounds[soundName];
    if (!sound) return;
    if (Array.isArray(sound.frequency)) {
        sound.frequency.forEach((freq, i) => playTone(freq, audioContext.currentTime, sound.duration, i * 0.05));
    } else {
        playTone(sound.frequency, audioContext.currentTime, sound.duration);
    }
}

function playTone(frequency, startTime, duration, delay = 0) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    const t = startTime + delay;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.3, t + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + duration - 0.01);
    oscillator.start(t);
    oscillator.stop(t + duration);
}

function setupSocialLinks() {
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', () => playSound('hover'));
        link.addEventListener('click', () => playSound('click'));
        link.addEventListener('mouseleave', () => {
            link.classList.add('shatter');
            setTimeout(() => link.classList.remove('shatter'), 500);
        });
    });
}

function setupMagicCursor() {
    const canvas = document.getElementById('cursorCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const stars = [];

    class Star {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.color = `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 30 + 60}%)`;
        }
        update() { this.x += this.speedX; this.y += this.speedY; this.life -= this.decay; this.size *= 0.98; }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const x = this.x + Math.cos(angle) * this.size;
                const y = this.y + Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                const ia = angle + Math.PI / 5;
                ctx.lineTo(this.x + Math.cos(ia) * (this.size * 0.4), this.y + Math.sin(ia) * (this.size * 0.4));
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    // Only run cursor trail on non-touch devices
    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            for (let i = 0; i < 3; i++) stars.push(new Star(e.clientX, e.clientY));
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();
            if (stars[i].life <= 0) stars.splice(i, 1);
        }
        requestAnimationFrame(animate);
    }
    animate();
}

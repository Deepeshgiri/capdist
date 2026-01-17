// Volume Control
let soundVolume = 0.5;
let audioContext = null;
const DISCORD_ID = '505285489776001024';
const planets = ['🪐 Saturn', '🌍 Earth', '🔴 Mars', '🌙 Moon', '⭐ Andromeda', '🌌 Milky Way', '☄️ Asteroid Belt'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAudioContext();
    setupVolumeControl();
    setupMagicCursor();
    initVideo();
    setupSocialLinks();
    fetchLanyardData();
    trackVisitor();
    setRandomLocation();
    playSound('notification');
    
    // Update Lanyard data every 30 seconds
    setInterval(fetchLanyardData, 30000);
});

function setRandomLocation() {
    const location = planets[Math.floor(Math.random() * planets.length)];
    document.getElementById('location').textContent = location;
}

// Fetch Discord data from Lanyard API
async function fetchLanyardData() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await response.json();
        
        if (data.success) {
            const user = data.data.discord_user;
            const status = data.data.discord_status;
            
            const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
            
            // Update both avatars
            document.getElementById('discordAvatar').src = avatarUrl;
            document.getElementById('dogtagAvatar').src = avatarUrl;
            
            // Update names
            const displayName = user.display_name || user.global_name;
            document.getElementById('discordName').textContent = displayName;
            document.getElementById('dogtagName').textContent = displayName;
            document.getElementById('dogtagUsername').textContent = `@${user.username}`;
            
            // Update status
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            
            const statusMap = {
                'online': { text: 'Online', color: '#43b581' },
                'idle': { text: 'Idle', color: '#faa61a' },
                'dnd': { text: 'Do Not Disturb', color: '#f04747' },
                'offline': { text: 'Offline', color: '#747f8d' }
            };
            
            const currentStatus = statusMap[status] || statusMap['offline'];
            statusText.textContent = currentStatus.text;
            statusDot.style.color = currentStatus.color;
        }
    } catch (error) {
        console.error('Error fetching Lanyard data:', error);
    }
}

// Track visitor count using localStorage
function trackVisitor() {
    let visitors = parseInt(localStorage.getItem('visitorCount') || '0');
    visitors++;
    localStorage.setItem('visitorCount', visitors);
    document.getElementById('visitorCount').textContent = visitors;
}

function initVideo() {
    const video = document.getElementById('bgVideo');
    video.play().catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
    });
}

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Volume Control
function setupVolumeControl() {
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeControl = document.getElementById('volumeControl');
    
    volumeBtn.addEventListener('click', () => {
        volumeSlider.classList.toggle('active');
    });
    
    volumeControl.addEventListener('input', (e) => {
        soundVolume = e.target.value / 100;
        updateVolumeIcon(soundVolume);
    });
    
    document.addEventListener('click', (e) => {
        if (!volumeBtn.contains(e.target) && !volumeSlider.contains(e.target)) {
            volumeSlider.classList.remove('active');
        }
    });
}

function updateVolumeIcon(volume) {
    const icon = document.querySelector('#volumeBtn .icon');
    if (volume === 0) {
        icon.textContent = '🔇';
    } else if (volume < 0.5) {
        icon.textContent = '🔉';
    } else {
        icon.textContent = '🔊';
    }
}

// Sound Effects
const sounds = {
    hover: { frequency: 800, duration: 0.1 },
    click: { frequency: 600, duration: 0.2 },
    notification: { frequency: [523.25, 659.25, 783.99], duration: 0.15 }
};

function playSound(soundName) {
    if (soundVolume === 0 || !audioContext) return;
    
    const sound = sounds[soundName];
    if (!sound) return;
    
    if (Array.isArray(sound.frequency)) {
        sound.frequency.forEach((freq, i) => {
            playTone(freq, audioContext.currentTime, sound.duration, i * 0.05);
        });
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
    
    const delayedStart = startTime + delay;
    gainNode.gain.setValueAtTime(0, delayedStart);
    gainNode.gain.linearRampToValueAtTime(soundVolume * 0.3, delayedStart + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, delayedStart + duration - 0.01);
    
    oscillator.start(delayedStart);
    oscillator.stop(delayedStart + duration);
}

// Social Links with Shatter Effect
function setupSocialLinks() {
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('mouseenter', () => playSound('hover'));
        link.addEventListener('click', () => playSound('click'));
        
        link.addEventListener('mouseleave', () => {
            link.classList.add('shatter');
            setTimeout(() => {
                link.classList.remove('shatter');
            }, 500);
        });
    });
}

// Magic Cursor Trail
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
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.life = 1;
            this.decay = Math.random() * 0.02 + 0.01;
            this.color = `hsl(${Math.random() * 60 + 180}, 100%, ${Math.random() * 30 + 60}%)`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
            this.size *= 0.98;
        }
        
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
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = this.x + Math.cos(innerAngle) * (this.size * 0.4);
                const innerY = this.y + Math.sin(innerAngle) * (this.size * 0.4);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }
    
    document.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 3; i++) {
            stars.push(new Star(e.clientX, e.clientY));
        }
    });
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = stars.length - 1; i >= 0; i--) {
            stars[i].update();
            stars[i].draw();
            
            if (stars[i].life <= 0) {
                stars.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

document.querySelector('.profile-card')?.addEventListener('click', () => {
    playSound('notification');
});

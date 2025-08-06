
// Global Variables
let isPlaying = false;
let isMuted = false;
let showConfetti = true;
let confettiInterval;
let countdownInterval;
let letters = JSON.parse(localStorage.getItem('birthday-letters')) || [];

// DOM Elements
const audio = document.getElementById('birthday-audio');
const playPauseBtn = document.getElementById('play-pause');
const muteUnmuteBtn = document.getElementById('mute-unmute');
const volumeSlider = document.getElementById('volume-slider');
const currentTimeSpan = document.getElementById('current-time');
const durationSpan = document.getElementById('duration');
const progressFill = document.getElementById('progress-fill');
const confettiContainer = document.getElementById('confetti-container');
const confettiToggle = document.getElementById('toggle-confetti');

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupMusicPlayer();
    setupLetterWriter();
    setupFlipCards();
    startCountdown();
    startConfetti();
    loadSavedLetters();
}

// Navigation System
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and sections
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding section
            const sectionId = tab.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Music Player Functions
function setupMusicPlayer() {
    // Set initial volume
    audio.volume = volumeSlider.value / 100;
    
    // Play/Pause button
    playPauseBtn.addEventListener('click', togglePlay);
    
    // Mute/Unmute button
    muteUnmuteBtn.addEventListener('click', toggleMute);
    
    // Volume slider
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value / 100;
    });
    
    // Update progress
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    // Auto-update duration when ready
    if (audio.readyState >= 1) {
        updateDuration();
    }
}

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    } else {
        audio.play().catch(console.error);
        playPauseBtn.textContent = '⏸️';
    }
    isPlaying = !isPlaying;
}

function toggleMute() {
    audio.muted = !audio.muted;
    isMuted = audio.muted;
    muteUnmuteBtn.textContent = isMuted ? '🔇' : '🔊';
}

function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
}

function updateDuration() {
    if (audio.duration) {
        durationSpan.textContent = formatTime(audio.duration);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// Flip Cards Animation
function setupFlipCards() {
    const flipCards = document.querySelectorAll('.flip-card');
    
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// Birthday Countdown
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const currentYear = now.getFullYear();
        let nextBirthday = new Date(currentYear, 7 , 8); // December 25th
        
        if (now > nextBirthday) {
            nextBirthday = new Date( currentYear+1, 7, 8);
        }
        
        const timeDiff = nextBirthday.getTime() - now.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Confetti Animation
function startConfetti() {
    const colors = ['#ec4899', '#a855f7', '#eab308', '#10b981', '#f97316'];
    
    function createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-particle';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        // Random shape
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }
        
        confettiContainer.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 6000);
    }
    
    function startConfettiAnimation() {
        if (showConfetti) {
            createConfettiPiece();
        }
    }
    
    // Create confetti every 300ms
    confettiInterval = setInterval(startConfettiAnimation, 300);
    
    // Toggle confetti button
    confettiToggle.addEventListener('click', () => {
        showConfetti = !showConfetti;
        if (!showConfetti) {
            // Clear existing confetti
            confettiContainer.innerHTML = '';
        }
    });
}

// Letter Writer Functions
function setupLetterWriter() {
    const saveBtn = document.getElementById('save-letter');
    const clearBtn = document.getElementById('clear-letter');
    
    saveBtn.addEventListener('click', saveLetter);
    clearBtn.addEventListener('click', clearForm);
}

function saveLetter() {
    const title = document.getElementById('letter-title').value.trim();
    const content = document.getElementById('letter-content').value.trim();
    const author = document.getElementById('author-name').value.trim();
    
    if (!title || !content || !author) {
        alert('Please fill in all fields before saving.');
        return;
    }
    
    const newLetter = {
        id: Date.now().toString(),
        title: title,
        content: content,
        author: author,
        date: new Date().toLocaleDateString()
    };
    
    letters.push(newLetter);
    localStorage.setItem('birthday-letters', JSON.stringify(letters));
    
    // Clear form
    clearForm();
    
    // Reload letters display
    loadSavedLetters();
    
    // Show success message
    showToast('Letter Saved! 💌', 'Your birthday message has been saved successfully.');
}

function clearForm() {
    document.getElementById('letter-title').value = '';
    document.getElementById('letter-content').value = '';
    document.getElementById('author-name').value = '';
}

function loadSavedLetters() {
    const lettersList = document.getElementById('letters-list');
    const letterCount = document.getElementById('letter-count');
    
    letterCount.textContent = letters.length;
    
    if (letters.length === 0) {
        lettersList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem; box">No letters saved yet. Write the first birthday message!</p>';
        return;
    }
    
    lettersList.innerHTML = letters.map(letter => `
        <div class="letter-card">
            <div class="letter-card-header">
                <div>
                    <div class="letter-title">${escapeHtml(letter.title)}</div>
                    <div class="letter-meta">By ${escapeHtml(letter.author)} • ${letter.date}</div>
                </div>
                <button class="delete-btn" onclick="deleteLetter('${letter.id}')" title="Delete letter">×</button>
            </div>
            <div class="letter-preview">${escapeHtml(letter.content)}</div>
        </div>
    `).join('');
}

function deleteLetter(id) {
    if (confirm('Are you sure you want to delete this letter?')) {
        letters = letters.filter(letter => letter.id !== id);
        localStorage.setItem('birthday-letters', JSON.stringify(letters));
        loadSavedLetters();
        showToast('Letter Deleted', 'The letter has been removed.');
    }
}

// Utility Functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(title, message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        border: 2px solid #10b981;
        border-radius: 1rem;
        padding: 1rem 2rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideDown 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <div style="font-weight: bold; color: #047857; margin-bottom: 0.5rem;">${title}</div>
        <div style="color: #6b7280; font-size: 0.9rem;">${message}</div>
    `;
    
    // Add animation keyframe
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translate(-50%, -20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            @keyframes slideUp {
                from { opacity: 1; transform: translate(-50%, 0); }
                to { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add some fun interactions
document.addEventListener('click', function(e) {
    // Create small sparkle effect on clicks
    if (e.target.closest('.flip-card') || e.target.closest('.btn')) {
        createSparkle(e.pageX, e.pageY);
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: #fbbf24;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: sparkle 0.6s ease-out forwards;
    `;
    
    // Add sparkle animation if not exists
    if (!document.getElementById('sparkle-styles')) {
        const style = document.createElement('style');
        style.id = 'sparkle-styles';
        style.textContent = `
            @keyframes sparkle {
                0% { opacity: 1; transform: scale(0) translate(-50%, -50%); }
                50% { opacity: 1; transform: scale(1) translate(-50%, -50%); }
                100% { opacity: 0; transform: scale(0) translate(-50%, -50%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 600);
}

// Cleanup function
window.addEventListener('beforeunload', function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (confettiInterval) clearInterval(confettiInterval);
});
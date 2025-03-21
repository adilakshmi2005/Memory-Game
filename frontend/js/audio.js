class AudioManager {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.flipSound = document.getElementById('flipSound');
        this.matchSound = document.getElementById('matchSound');
        this.wrongSound = document.getElementById('wrongSound');
        this.winSound = document.getElementById('winSound');

        this.bgMusicToggle = document.getElementById('bgMusicToggle');
        this.soundToggle = document.getElementById('soundToggle');

        this.isMusicMuted = false;
        this.isSoundMuted = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.bgMusicToggle.addEventListener('click', () => this.toggleMusic());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        if (this.isMusicMuted) {
            this.bgMusic.pause();
            this.bgMusicToggle.innerHTML = '<i class="fas fa-music-slash"></i>';
        } else {
            this.bgMusic.play();
            this.bgMusicToggle.innerHTML = '<i class="fas fa-music"></i>';
        }
    }

    toggleSound() {
        this.isSoundMuted = !this.isSoundMuted;
        this.soundToggle.innerHTML = this.isSoundMuted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    }

    playSound(sound) {
        if (!this.isSoundMuted) {
            switch(sound) {
                case 'flip':
                    this.flipSound.play();
                    break;
                case 'match':
                    this.matchSound.play();
                    break;
                case 'wrong':
                    this.wrongSound.play();
                    break;
                case 'win':
                    this.winSound.play();
                    break;
            }
        }
    }

    startBackgroundMusic() {
        if (!this.isMusicMuted) {
            this.bgMusic.play();
        }
    }

    stopBackgroundMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
}

const audioManager = new AudioManager();
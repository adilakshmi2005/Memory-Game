document.addEventListener("DOMContentLoaded", () => {
    const bgMusic = document.getElementById("bgMusic");
    const flipSound = document.getElementById("flipSound");
    const matchSound = document.getElementById("matchSound");
    const wrongSound = document.getElementById("wrongSound");
    const winSound = document.getElementById("winSound");
    
    const bgMusicToggle = document.getElementById("bgMusicToggle");
    const soundToggle = document.getElementById("soundToggle");

    let soundEnabled = true;
    
    // Toggle Background Music
    bgMusicToggle.addEventListener("click", () => {
        if (bgMusic.paused) {
            bgMusic.play();
            bgMusicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgMusic.pause();
            bgMusicToggle.innerHTML = '<i class="fas fa-music-slash"></i>';
        }
    });

    // Toggle Sound Effects
    soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        soundToggle.innerHTML = soundEnabled 
            ? '<i class="fas fa-volume-up"></i>' 
            : '<i class="fas fa-volume-mute"></i>';
    });

    // Function to play sounds
    function playSound(sound) {
        if (soundEnabled && sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // Expose functions for game.js
    window.playFlipSound = () => playSound(flipSound);
    window.playMatchSound = () => playSound(matchSound);
    window.playWrongSound = () => playSound(wrongSound);
    window.playWinSound = () => playSound(winSound);
});

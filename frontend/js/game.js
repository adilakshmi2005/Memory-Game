class MemoryGame {
    constructor() {
        this.cards = [];
        this.score = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.gameBoard = document.getElementById('gameBoard');
        this.themeSelect = document.getElementById('themeSelect');
        this.startButton = document.getElementById('startGame');
        this.currentScoreElement = document.getElementById('currentScore');
        this.timeLeft = 60; // 60 seconds per game
        this.timer = null;
        this.timerElement = document.createElement('div');
        this.timerElement.className = 'timer';
        document.querySelector('.game-settings').appendChild(this.timerElement);

        this.themes = {
            animals: [
                'dog', 'cat', 'elephant', 'giraffe', 'lion', 'penguin', 'tiger', 'zebra'
            ],
            nature: [
                'beach', 'canyon', 'desert', 'flowers', 'forest', 'lake', 'mountain', 'waterfall'
            ],
            sports: [
                'basketball', 'boxing', 'chess', 'cricket', 'cycling', 'football', 'skiing', 'tennis'
            ]
        };

        this.difficulties = {
            easy: { time: 60, penalty: 1 },
            medium: { time: 45, penalty: 2 },
            hard: { time: 30, penalty: 3 }
        };
        this.currentDifficulty = 'easy';
        
        // Add difficulty selector
        this.difficultySelect = document.createElement('select');
        this.difficultySelect.id = 'difficultySelect';
        Object.keys(this.difficulties).forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
            this.difficultySelect.appendChild(option);
        });
        document.querySelector('.game-settings').insertBefore(
            this.difficultySelect, 
            this.themeSelect
        );

        this.sounds = {
            flip: new Audio('assets/sounds/flip.mp3'),
            match: new Audio('assets/sounds/match.mp3'),
            wrong: new Audio('assets/sounds/wrong.mp3'),
            win: new Audio('assets/sounds/win.mp3')
        };
        
        // Add mute button
        this.muteButton = document.createElement('button');
        this.muteButton.textContent = '🔊';
        this.muteButton.onclick = () => this.toggleSound();
        document.querySelector('.game-settings').appendChild(this.muteButton);

        this.startButton.addEventListener('click', () => this.startGame());
    }

    resetGame() {
        this.gameBoard.innerHTML = '';
        this.score = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.currentScoreElement.textContent = this.score;
    }

    startTimer() {
        this.timeLeft = 60;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.gameOver(true); // true indicates time's up
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerElement.textContent = `Time: ${this.timeLeft}s`;
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    startGame() {
        this.resetGame();
        this.currentDifficulty = this.difficultySelect.value;
        this.timeLeft = this.difficulties[this.currentDifficulty].time;
        this.startTimer();
        const selectedTheme = this.themeSelect.value;
        const themeItems = this.themes[selectedTheme];
        
        // Create pairs of cards
        this.cards = [...themeItems, ...themeItems]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
                id: index,
                value: item,
                isFlipped: false,
                isMatched: false
            }));

        this.renderBoard();
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.id = card.id;

            const img = document.createElement('img');
            img.src = `assets/${this.themeSelect.value}/${card.value}.jpg`;
            cardElement.appendChild(img);

            cardElement.addEventListener('click', () => this.flipCard(card.id));
            this.gameBoard.appendChild(cardElement);
        });
    }

    flipCard(cardId) {
        const card = this.cards.find(c => c.id === cardId);
        
        if (this.flippedCards.length === 2 || card.isFlipped || card.isMatched) {
            return;
        }

        card.isFlipped = true;
        this.flippedCards.push(card);
        
        const cardElement = document.querySelector(`[data-id="${cardId}"]`);
        cardElement.classList.add('flipped');

        this.playSound('flip');

        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }

    async checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.value === card2.value;

        if (match) {
            card1.isMatched = card2.isMatched = true;
            this.matchedPairs++;
            this.score += 10;
            this.currentScoreElement.textContent = this.score;
            this.playSound('match');

            if (this.matchedPairs === this.cards.length / 2) {
                await this.gameOver();
            }
        } else {
            this.score = Math.max(0, 
                this.score - this.difficulties[this.currentDifficulty].penalty
            );
            this.currentScoreElement.textContent = this.score;
            
            setTimeout(() => {
                card1.isFlipped = card2.isFlipped = false;
                document.querySelector(`[data-id="${card1.id}"]`).classList.remove('flipped');
                document.querySelector(`[data-id="${card2.id}"]`).classList.remove('flipped');
            }, 1000);
            this.playSound('wrong');
        }

        this.flippedCards = [];
    }

    async gameOver(timeUp = false) {
        this.stopTimer();
        if (timeUp) {
            alert("Time's up! Your score: " + this.score);
        }
        this.playSound('win');

        try {
            if (isAuthenticated()) {
                await saveScore({
                    score: this.score,
                    theme: this.themeSelect.value,
                    difficulty: this.currentDifficulty
                });

                const bestScoreElement = document.getElementById('bestScore');
                const currentBest = parseInt(bestScoreElement.textContent) || 0;
                if (this.score > currentBest) {
                    bestScoreElement.textContent = this.score;
                }

                await updateLeaderboard();
                alert(`Congratulations! Your score: ${this.score}`);
            } else {
                alert(`Game Over! Score: ${this.score}\nLogin to save your score!`);
            }
        } catch (error) {
            console.error('Error saving score:', error);
            alert('Error saving score. Please try again.');
        }
    }

    toggleSound() {
        this.muted = !this.muted;
        this.muteButton.textContent = this.muted ? '🔇' : '🔊';
    }

    playSound(soundName) {
        if (!this.muted && this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}

// Initialize the game
const game = new MemoryGame();
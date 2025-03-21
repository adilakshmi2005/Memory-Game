document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("gameBoard");
    const startGameButton = document.getElementById("startGame");
    const currentScoreElement = document.getElementById("currentScore");
    const bestScoreElement = document.getElementById("bestScore");
    const flipSound = new Audio("assets/sounds/flip.wav");
    const matchSound = new Audio("assets/sounds/match.mp3");
    const wrongSound = new Audio("assets/sounds/wrong.wav");
    const winSound = new Audio("assets/sounds/win.mp3");
    
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let bestScore = localStorage.getItem("bestScore") || 0;
    
    bestScoreElement.textContent = bestScore;
    
    const cardImages = ["🍎", "🍌", "🍒", "🍉", "🍇", "🍊", "🍓", "🥝"];
    
    function createCards() {
        const doubledCards = [...cardImages, ...cardImages];
        doubledCards.sort(() => 0.5 - Math.random());
        gameBoard.innerHTML = "";
        
        doubledCards.forEach((icon, index) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.dataset.icon = icon;
            card.innerHTML = `<div class="card-front">❓</div><div class="card-back">${icon}</div>`;
            card.addEventListener("click", flipCard);
            gameBoard.appendChild(card);
        });
        
        cards = document.querySelectorAll(".card");
    }
    
    function flipCard() {
        if (flippedCards.length < 2 && !this.classList.contains("flipped")) {
            this.classList.add("flipped");
            flipSound.play();
            flippedCards.push(this);
        }
        
        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.icon === card2.dataset.icon) {
            matchSound.play();
            matchedPairs++;
            score += 10;
            if (matchedPairs === cardImages.length) {
                winSound.play();
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem("bestScore", bestScore);
                }
            }
        } else {
            wrongSound.play();
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            score -= 5;
        }
        flippedCards = [];
        updateScore();
    }
    
    function updateScore() {
        currentScoreElement.textContent = score;
        bestScoreElement.textContent = bestScore;
    }
    
    startGameButton.addEventListener("click", () => {
        matchedPairs = 0;
        score = 0;
        flippedCards = [];
        updateScore();
        createCards();
    });
    
    createCards();
});

async function saveScore(scoreData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const response = await fetch('http://localhost:3000/api/game/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(scoreData)
        });

        if (!response.ok) {
            throw new Error('Failed to save score');
        }

        await updateLeaderboard();
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

async function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    try {
        if (!isAuthenticated()) {
            leaderboardList.innerHTML = '<p>Please login to view leaderboard</p>';
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/leaderboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const leaderboard = await response.json();
        
        if (!leaderboard || leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>No scores yet. Play a game!</p>';
            return;
        }

        // Update best score
        const bestScore = Math.max(...leaderboard.map(entry => entry.score));
        document.getElementById('bestScore').textContent = bestScore;

        // Create leaderboard HTML
        leaderboardList.innerHTML = leaderboard
            .map((entry, index) => `
                <div class="leaderboard-entry">
                    <span>${index + 1}. ${entry.username}</span>
                    <span>${entry.score} points (${entry.theme})</span>
                </div>
            `)
            .join('');

    } catch (error) {
        console.error('Error updating leaderboard:', error);
        leaderboardList.innerHTML = '<p>Error loading leaderboard. Please try again.</p>';
    }
}

// Initialize leaderboard when DOM loads
document.addEventListener('DOMContentLoaded', updateLeaderboard);

// Update leaderboard every 30 seconds if user is authenticated
setInterval(() => {
    if (isAuthenticated()) {
        updateLeaderboard();
    }
}, 30000);

// Export functions for use in other files
window.saveScore = saveScore;
window.updateLeaderboard = updateLeaderboard;
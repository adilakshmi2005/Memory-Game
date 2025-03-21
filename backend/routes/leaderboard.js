const express = require('express');
const router = express.Router();
const Score = require('../models/score');
const User = require('../models/user');

// Get global leaderboard
router.get('/', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .populate('userId', 'username');

        const leaderboard = scores.map(score => ({
            username: score.userId.username,
            score: score.score,
            theme: score.theme,
            timestamp: score.timestamp
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

// Get theme-specific leaderboard
router.get('/:theme', async (req, res) => {
    try {
        const { theme } = req.params;
        const scores = await Score.find({ theme })
            .sort({ score: -1 })
            .limit(10)
            .populate('userId', 'username');

        const leaderboard = scores.map(score => ({
            username: score.userId.username,
            score: score.score,
            timestamp: score.timestamp
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
});

module.exports = router;

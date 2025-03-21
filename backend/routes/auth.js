const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add username validation function
function validateUsername(username) {
    const minLength = 3;
    const validUsernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    return {
        isValid: username && 
                 username.length >= minLength && 
                 !username.includes(' ') && 
                 validUsernameRegex.test(username),
        message: 'Username must be at least 3 characters, start with a letter, and contain only letters, numbers, and underscores'
    };
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Validate username format
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            return res.status(400).json({ message: usernameValidation.message });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create new user
        const user = new User({ username, password });
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        
        res.status(201).json({
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        
        res.json({
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

module.exports = router;



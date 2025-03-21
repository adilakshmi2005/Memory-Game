const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

// Example URLs for each theme
const images = {
    animals: {
        'dog': 'https://images.unsplash.com/photo-[dog-id]',
        'cat': 'https://images.unsplash.com/photo-[cat-id]',
        // ... add more URLs
    },
    nature: {
        'mountain': 'https://images.unsplash.com/photo-[mountain-id]',
        // ... add more URLs
    },
    movies: {
        'matrix': 'https://images.unsplash.com/photo-[matrix-id]',
        // ... add more URLs
    }
}; 
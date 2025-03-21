let currentUser = null;

async function login(username, password) {
    try {
        if (!username || !password) {
            alert('Please enter both username and password');
            return false;
        }

        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Invalid username or password');
            return false;
        }

        currentUser = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.username);
        updateUIForAuth();
        return true;
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
        return false;
    }
}

async function register(username, password) {
    try {
        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
            alert(usernameValidation.errors.join('\n'));
            return false;
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            alert(passwordValidation.errors.join('\n'));
            return false;
        }

        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || 'Registration failed');
            return false;
        }

        return await login(username, password);
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Please try again.');
        return false;
    }
}

function validateUsername(username) {
    const minLength = 3;
    const validUsernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    
    const errors = [];
    if (!username || username.length < minLength) {
        errors.push(`Username must be at least ${minLength} characters long`);
    }
    if (username.includes(' ')) {
        errors.push('Username cannot contain spaces');
    }
    if (!validUsernameRegex.test(username)) {
        errors.push('Username must start with a letter and can only contain letters, numbers, and underscores');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (!password || password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSymbols) {
        errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateUIForAuth();
    window.location.reload(); // Refresh page to reset game state
}

function isAuthenticated() {
    return currentUser !== null && localStorage.getItem('token') !== null;
}

function updateUIForAuth() {
    const userInfo = document.getElementById('userInfo');
    const authSection = document.getElementById('authSection');
    const usernameElement = document.getElementById('username');

    if (currentUser) {
        userInfo.classList.remove('hidden');
        authSection.classList.add('hidden');
        usernameElement.textContent = currentUser.username;
    } else {
        userInfo.classList.add('hidden');
        authSection.classList.remove('hidden');
        usernameElement.textContent = '';
    }
}

// Event Listeners
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = prompt('Enter username:');
    if (!username) return;

    const password = prompt('Enter password:');
    if (!password) return;

    const success = await login(username, password);
    if (success) {
        alert('Login successful!');
    }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
    let username;
    let isUsernameValid = false;
    let usernameErrors = [];

    while (!isUsernameValid) {
        username = prompt(`Choose username:\n${usernameErrors.join('\n')}\n\nUsername requirements:
        - At least 3 characters
        - Must start with a letter
        - Can contain letters, numbers, and underscores
        - No spaces allowed`);

        if (!username) return;

        const validation = validateUsername(username);
        if (validation.isValid) {
            isUsernameValid = true;
        } else {
            usernameErrors = validation.errors;
        }
    }

    let password;
    let isPasswordValid = false;
    let passwordErrors = [];

    while (!isPasswordValid) {
        password = prompt(`Choose password:\n${passwordErrors.join('\n')}\n\nPassword requirements:
        - At least 6 characters
        - At least 1 uppercase letter
        - At least 1 lowercase letter
        - At least 1 number
        - At least 1 special character (!@#$%^&*(),.?":{}|<>)`);

        if (!password) return;

        const validation = validatePassword(password);
        if (validation.isValid) {
            isPasswordValid = true;
        } else {
            passwordErrors = validation.errors;
        }
    }

    const success = await register(username, password);
    if (success) {
        alert('Registration successful! You are now logged in.');
    }
});

document.getElementById('logoutBtn').addEventListener('click', logout);

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
        currentUser = { username };
        updateUIForAuth();
    }
});
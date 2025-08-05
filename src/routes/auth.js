const express = require('express');
const { validateInput, csrfProtection } = require('../middleware');
const User = require('../models/user');
const router = express.Router();

// Login page
router.get('/login', csrfProtection, (req, res) => {
    if (req.session.user) {
        return res.redirect('/account/dashboard');
    }
    
    res.render('auth/login', {
        title: 'Login',
        layout: 'auth'
    });
});

// Login handler
router.post('/login', 
    csrfProtection,
    validateInput({
        username: {
            required: true,
            minLength: 3,
            maxLength: 16,
            pattern: /^[a-zA-Z0-9]+$/,
            customMessage: 'Username must contain only letters and numbers'
        },
        password: {
            required: true,
            minLength: 3,
            maxLength: 50
        }
    }),
    async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // Find user
            const user = await User.findByUsername(username);
            if (!user) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/auth/login');
            }
            
            // Validate password
            const isValid = await User.validatePassword(username, password);
            if (!isValid) {
                req.flash('error', 'Invalid username or password');
                return res.redirect('/auth/login');
            }
            
            // Update last login
            await User.updateLastLogin(user.id);
            
            // Set session
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                joindate: user.joindate,
                expansion: user.expansion
            };
            
            req.flash('success', `Welcome back, ${user.username}!`);
            res.redirect('/account/dashboard');
            
        } catch (error) {
            console.error('Login error:', error);
            req.flash('error', 'An error occurred during login');
            res.redirect('/auth/login');
        }
    }
);

// Register page
router.get('/register', csrfProtection, (req, res) => {
    if (req.session.user) {
        return res.redirect('/account/dashboard');
    }
    
    if (process.env.ENABLE_REGISTRATION !== 'true') {
        req.flash('error', 'Registration is currently disabled');
        return res.redirect('/auth/login');
    }
    
    res.render('auth/register', {
        title: 'Register',
        layout: 'auth'
    });
});

// Register handler
router.post('/register',
    csrfProtection,
    validateInput({
        username: {
            required: true,
            minLength: 3,
            maxLength: 16,
            pattern: /^[a-zA-Z0-9]+$/,
            customMessage: 'Username must contain only letters and numbers'
        },
        password: {
            required: true,
            minLength: 6,
            maxLength: 50
        },
        confirmPassword: {
            required: true,
            customMessage: 'Passwords do not match'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            customMessage: 'Please enter a valid email address'
        }
    }),
    async (req, res) => {
        console.log('Registration POST handler called');
        console.log('Request body:', req.body);
        
        try {
            if (process.env.ENABLE_REGISTRATION !== 'true') {
                console.log('Registration disabled');
                req.flash('error', 'Registration is currently disabled');
                return res.redirect('/auth/login');
            }
            
            const { username, password, confirmPassword, email } = req.body;
            console.log(`Attempting to register user: ${username}, email: ${email}`);
            
            // Check password confirmation
            if (password !== confirmPassword) {
                console.log('Password confirmation failed');
                req.flash('error', 'Passwords do not match');
                return res.redirect('/auth/register');
            }
            
            // Create user
            console.log('Creating user...');
            const userId = await User.create({ username, password, email });
            console.log(`User created successfully with ID: ${userId}`);
            
            req.flash('success', 'Account created successfully! You can now log in.');
            console.log('Redirecting to login page');
            res.redirect('/auth/login');
            
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.message === 'Username already exists') {
                req.flash('error', 'Username is already taken');
            } else if (error.message === 'Email already registered') {
                req.flash('error', 'Email is already registered');
            } else {
                req.flash('error', 'An error occurred during registration');
            }
            
            console.log('Redirecting back to register page due to error');
            res.redirect('/auth/register');
        }
    }
);

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

// Logout GET (for convenience)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
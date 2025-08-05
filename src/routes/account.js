const express = require('express');
const { validateInput, csrfProtection } = require('../middleware');
const User = require('../models/user');
const Character = require('../models/character');
const router = express.Router();

// Account dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const user = req.session.user;
        const characters = await User.getAccountCharacters(user.id);
        const stats = await User.getAccountStats(user.id);
        
        res.render('account/dashboard', {
            title: 'Account Dashboard',
            user,
            characters,
            stats,
            formatPlaytime: (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/');
    }
});

// Account settings
router.get('/settings', csrfProtection, (req, res) => {
    res.render('account/settings', {
        title: 'Account Settings',
        user: req.session.user
    });
});

// Change password
router.post('/change-password',
    csrfProtection,
    validateInput({
        currentPassword: {
            required: true,
            minLength: 3
        },
        newPassword: {
            required: true,
            minLength: 6,
            maxLength: 50
        },
        confirmPassword: {
            required: true,
            custom: (value, req) => value === req.body.newPassword,
            customMessage: 'New passwords do not match'
        }
    }),
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = req.session.user;
            
            // Verify current password
            const isValid = await User.validatePassword(user.username, currentPassword);
            if (!isValid) {
                req.flash('error', 'Current password is incorrect');
                return res.redirect('/account/settings');
            }
            
            // Change password
            await User.changePassword(user.id, newPassword);
            
            req.flash('success', 'Password changed successfully');
            res.redirect('/account/settings');
            
        } catch (error) {
            console.error('Change password error:', error);
            req.flash('error', 'Error changing password');
            res.redirect('/account/settings');
        }
    }
);

// Change email
router.post('/change-email',
    csrfProtection,
    validateInput({
        newEmail: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            customMessage: 'Please enter a valid email address'
        },
        password: {
            required: true,
            minLength: 3
        }
    }),
    async (req, res) => {
        try {
            const { newEmail, password } = req.body;
            const user = req.session.user;
            
            // Verify password
            const isValid = await User.validatePassword(user.username, password);
            if (!isValid) {
                req.flash('error', 'Password is incorrect');
                return res.redirect('/account/settings');
            }
            
            // Update email
            await User.updateEmail(user.id, newEmail);
            
            // Update session
            req.session.user.email = newEmail;
            
            req.flash('success', 'Email updated successfully');
            res.redirect('/account/settings');
            
        } catch (error) {
            console.error('Change email error:', error);
            
            if (error.message === 'Email already in use') {
                req.flash('error', 'Email is already in use');
            } else {
                req.flash('error', 'Error updating email');
            }
            
            res.redirect('/account/settings');
        }
    }
);

// Account characters
router.get('/characters', async (req, res) => {
    try {
        const user = req.session.user;
        const characters = await User.getAccountCharacters(user.id);
        
        res.render('account/characters', {
            title: 'My Characters',
            characters,
            formatPlaytime: (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        });
    } catch (error) {
        console.error('Characters error:', error);
        req.flash('error', 'Error loading characters');
        res.redirect('/account/dashboard');
    }
});

// Character details
router.get('/character/:guid', async (req, res) => {
    try {
        const { guid } = req.params;
        const user = req.session.user;
        
        // Get character
        const character = await Character.findByGuid(guid);
        if (!character) {
            req.flash('error', 'Character not found');
            return res.redirect('/account/characters');
        }
        
        // Verify ownership
        if (character.account !== user.id) {
            req.flash('error', 'Access denied');
            return res.redirect('/account/characters');
        }
        
        // Get additional character data
        const [equipment, talents, guild] = await Promise.all([
            Character.getCharacterEquipment(guid),
            Character.getCharacterTalents(guid),
            Character.getCharacterGuild(guid)
        ]);
        
        res.render('account/character-detail', {
            title: `${character.name} - Character Details`,
            character,
            equipment,
            talents,
            guild,
            formatPlaytime: (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        });
        
    } catch (error) {
        console.error('Character detail error:', error);
        req.flash('error', 'Error loading character details');
        res.redirect('/account/characters');
    }
});

module.exports = router;
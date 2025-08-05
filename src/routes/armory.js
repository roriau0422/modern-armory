const express = require('express');
const Character = require('../models/character');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    try {
        const [topCharacters, onlineCharacters, stats] = await Promise.all([
            Character.getTopCharacters(10),
            Character.getOnlineCharacters(),
            Character.getCharacterStats()
        ]);
        
        res.render('armory/index', {
            title: 'Welcome to XMETA WoW Server',
            topCharacters,
            onlineCharacters: onlineCharacters.slice(0, 15),
            stats
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.render('armory/index', {
            title: 'Welcome to XMETA WoW Server',
            topCharacters: [],
            onlineCharacters: [],
            stats: { totalCharacters: 0, onlineCharacters: 0, maxLevel: 0, averageLevel: 0 }
        });
    }
});

// Character search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let characters = [];
        
        if (q && q.trim().length > 0) {
            characters = await Character.search(q.trim(), 50);
        }
        
        res.render('armory/search', {
            title: 'Character Search',
            query: q || '',
            characters,
            hasSearched: !!q
        });
    } catch (error) {
        console.error('Search error:', error);
        res.render('armory/search', {
            title: 'Character Search',
            query: req.query.q || '',
            characters: [],
            hasSearched: !!req.query.q,
            error: 'Error performing search'
        });
    }
});

// Character profile
router.get('/character/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        // Get character
        const character = await Character.findByName(name);
        if (!character) {
            return res.status(404).render('error', {
                title: 'Character Not Found',
                error: `Character "${name}" was not found.`,
                statusCode: 404
            });
        }
        
        // Get additional character data
        const [equipment, talents, achievements, guild] = await Promise.all([
            Character.getCharacterEquipment(character.guid),
            Character.getCharacterTalents(character.guid),
            Character.getCharacterAchievements(character.guid),
            Character.getCharacterGuild(character.guid)
        ]);
        
        // Helper function for class names
        const getClassName = (classId) => {
            const classes = {
                1: 'Warrior', 2: 'Paladin', 3: 'Hunter', 4: 'Rogue',
                5: 'Priest', 6: 'Death Knight', 7: 'Shaman', 8: 'Mage',
                9: 'Warlock', 11: 'Druid'
            };
            return classes[classId] || 'Unknown';
        };
        
        res.render('armory/character', {
            title: `${character.name} - Level ${character.level} ${getClassName(character.class)}`,
            character,
            equipment,
            talents,
            achievements: achievements.slice(0, 20), // Show recent 20 achievements
            guild,
            formatPlaytime: (seconds) => {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        });
        
    } catch (error) {
        console.error('Character profile error:', error);
        res.status(500).render('error', {
            title: 'Error',
            error: 'Error loading character profile',
            statusCode: 500
        });
    }
});

// Top characters ladder
router.get('/ladder', async (req, res) => {
    try {
        const characters = await Character.getTopCharacters(100);
        
        res.render('armory/ladder', {
            title: 'Character Ladder',
            characters
        });
    } catch (error) {
        console.error('Ladder error:', error);
        res.render('armory/ladder', {
            title: 'Character Ladder',
            characters: [],
            error: 'Error loading character ladder'
        });
    }
});

// Online characters
router.get('/online', async (req, res) => {
    try {
        const characters = await Character.getOnlineCharacters();
        
        res.render('armory/online', {
            title: 'Online Characters',
            characters
        });
    } catch (error) {
        console.error('Online characters error:', error);
        res.render('armory/online', {
            title: 'Online Characters',
            characters: [],
            error: 'Error loading online characters'
        });
    }
});

// Server statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Character.getCharacterStats();
        
        res.render('armory/stats', {
            title: 'Server Statistics',
            stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.render('armory/stats', {
            title: 'Server Statistics',
            stats: { totalCharacters: 0, onlineCharacters: 0, maxLevel: 0, averageLevel: 0 },
            error: 'Error loading server statistics'
        });
    }
});

module.exports = router;
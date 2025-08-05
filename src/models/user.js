const bcrypt = require('bcryptjs');
const db = require('./database');

class User {
    static async findByUsername(username) {
        try {
            const users = await db.authQuery(
                'SELECT id, username, email, joindate, last_login, expansion FROM account WHERE username = ?',
                [username]
            );
            return users[0] || null;
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const users = await db.authQuery(
                'SELECT id, username, email, joindate, last_login, expansion FROM account WHERE id = ?',
                [id]
            );
            return users[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { username, password, email } = userData;
        
        try {
            // Check if username already exists
            const existingUser = await this.findByUsername(username);
            if (existingUser) {
                throw new Error('Username already exists');
            }

            // Check if email already exists
            const existingEmail = await db.authQuery(
                'SELECT id FROM account WHERE email = ?',
                [email]
            );
            if (existingEmail.length > 0) {
                throw new Error('Email already registered');
            }

            // Generate SRP6 credentials for AzerothCore
            const WoWAuth = require('../utils/wow-auth');
            const credentials = WoWAuth.generateCredentials(username, password);

            // Insert new account with SRP6 salt and verifier
            const result = await db.authQuery(
                `INSERT INTO account (username, salt, verifier, email, joindate, expansion) 
                 VALUES (?, ?, ?, ?, NOW(), 2)`,
                [username.toUpperCase(), credentials.salt, credentials.verifier, email]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    static async validatePassword(username, password) {
        try {
            // Get stored SRP6 data from AzerothCore
            const users = await db.authQuery(
                'SELECT salt, verifier FROM account WHERE username = ?',
                [username.toUpperCase()]
            );

            if (users.length === 0) {
                return false;
            }

            const user = users[0];

            // Use WoW-specific SRP6 authentication
            const WoWAuth = require('../utils/wow-auth');
            const isValid = WoWAuth.validatePassword(username, password, user.salt, user.verifier);
            
            return isValid;
            
        } catch (error) {
            console.error('Error validating password:', error);
            return false;
        }
    }

    static async updateLastLogin(userId) {
        try {
            await db.authQuery(
                'UPDATE account SET last_login = NOW() WHERE id = ?',
                [userId]
            );
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    static async changePassword(userId, newPassword) {
        try {
            // Get username
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Generate new SRP6 credentials
            const WoWAuth = require('../utils/wow-auth');
            const credentials = WoWAuth.generateCredentials(user.username, newPassword);

            await db.authQuery(
                'UPDATE account SET salt = ?, verifier = ? WHERE id = ?',
                [credentials.salt, credentials.verifier, userId]
            );

            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    static async updateEmail(userId, newEmail) {
        try {
            // Check if email already exists
            const existingEmail = await db.authQuery(
                'SELECT id FROM account WHERE email = ? AND id != ?',
                [newEmail, userId]
            );
            if (existingEmail.length > 0) {
                throw new Error('Email already in use');
            }

            await db.authQuery(
                'UPDATE account SET email = ? WHERE id = ?',
                [newEmail, userId]
            );

            return true;
        } catch (error) {
            console.error('Error updating email:', error);
            throw error;
        }
    }

    static async getAccountCharacters(accountId) {
        try {
            const characters = await db.charactersQuery(`
                SELECT 
                    guid, name, race, class, gender, level, zone, map,
                    totaltime, leveltime, logout_time, online,
                    totalHonorPoints, totalKills, arenaPoints
                FROM characters 
                WHERE account = ? AND deleteDate IS NULL
                ORDER BY level DESC, totaltime DESC
            `, [accountId]);

            return characters;
        } catch (error) {
            console.error('Error getting account characters:', error);
            throw error;
        }
    }

    static async getAccountStats(accountId) {
        try {
            const [charCount] = await db.charactersQuery(
                'SELECT COUNT(*) as count FROM characters WHERE account = ? AND deleteDate IS NULL',
                [accountId]
            );

            const [maxLevel] = await db.charactersQuery(
                'SELECT MAX(level) as maxLevel FROM characters WHERE account = ? AND deleteDate IS NULL',
                [accountId]
            );

            const [totalPlaytime] = await db.charactersQuery(
                'SELECT SUM(totaltime) as totalTime FROM characters WHERE account = ? AND deleteDate IS NULL',
                [accountId]
            );

            return {
                characterCount: charCount.count || 0,
                maxLevel: maxLevel.maxLevel || 0,
                totalPlaytime: totalPlaytime.totalTime || 0
            };
        } catch (error) {
            console.error('Error getting account stats:', error);
            throw error;
        }
    }
}

module.exports = User;
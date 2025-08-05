const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.authPool = null;
        this.charactersPool = null;
        this.worldPool = null;
        this.init();
    }

    init() {
        // Authentication database connection
        this.authPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.WEB_DB_USER,
            password: process.env.WEB_DB_PASS,
            database: process.env.AUTH_DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Characters database connection
        this.charactersPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.WEB_DB_USER,
            password: process.env.WEB_DB_PASS,
            database: process.env.CHAR_DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // World database connection
        this.worldPool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.WORLD_DB_USER,
            password: process.env.WORLD_DB_PASS,
            database: process.env.WORLD_DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async query(pool, sql, params = []) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    async authQuery(sql, params = []) {
        return this.query(this.authPool, sql, params);
    }

    async charactersQuery(sql, params = []) {
        return this.query(this.charactersPool, sql, params);
    }

    async worldQuery(sql, params = []) {
        return this.query(this.worldPool, sql, params);
    }

    async testConnection() {
        try {
            await this.authQuery('SELECT 1');
            await this.charactersQuery('SELECT 1');
            await this.worldQuery('SELECT 1');
            console.log('Database connections successful');
            return true;
        } catch (error) {
            console.error('Database connection failed:', error);
            return false;
        }
    }

    async close() {
        if (this.authPool) await this.authPool.end();
        if (this.charactersPool) await this.charactersPool.end();
        if (this.worldPool) await this.worldPool.end();
    }
}

module.exports = new Database();
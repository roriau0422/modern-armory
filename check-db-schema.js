const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabaseSchema() {
    console.log('Checking AzerothCore database schema...');
    
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.WEB_DB_USER,
            password: process.env.WEB_DB_PASS,
            database: process.env.AUTH_DB_NAME
        });

        console.log('Connected to database:', process.env.AUTH_DB_NAME);

        // Check table structure
        console.log('\n=== Account Table Structure ===');
        const [columns] = await connection.execute('DESCRIBE account');
        columns.forEach(col => {
            console.log(`${col.Field} | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default}`);
        });

        // Check if there are any existing accounts to see data format
        console.log('\n=== Sample Account Data ===');
        const [accounts] = await connection.execute('SELECT * FROM account LIMIT 1');
        if (accounts.length > 0) {
            console.log('Sample account columns:', Object.keys(accounts[0]));
            
            // Show password-related columns (without revealing actual values)
            const account = accounts[0];
            Object.keys(account).forEach(key => {
                if (key.toLowerCase().includes('pass') || 
                    key.toLowerCase().includes('hash') || 
                    key.toLowerCase().includes('verifier') || 
                    key.toLowerCase().includes('salt')) {
                    console.log(`${key}: ${account[key] ? '[HAS VALUE]' : '[NULL]'} (length: ${account[key] ? account[key].length : 0})`);
                }
            });
        } else {
            console.log('No accounts found in database');
        }

        await connection.end();
        console.log('\nDatabase check complete!');
        
    } catch (error) {
        console.error('Database check failed:', error);
    }
}

checkDatabaseSchema();
const crypto = require('crypto');

// SRP6 parameters for WoW (from AzerothCore)
const N = BigInt('0x894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7');
const g = BigInt('0x7');

/**
 * AzerothCore SRP6 Authentication Helper
 * This implements the EXACT SRP6 protocol as used by AzerothCore with proper little-endian handling
 * Based on working TypeScript implementation
 */
class WoWAuth {
    /**
     * Helper function to convert BigInt to little-endian buffer (AzerothCore uses little-endian)
     */
    static bigIntToLittleEndianBuffer(n, length) {
        const hex = n.toString(16).padStart(length * 2, '0');
        const buffer = Buffer.from(hex, 'hex');
        return buffer.reverse(); // Convert to little-endian
    }

    /**
     * Helper function to convert little-endian buffer to BigInt
     */
    static littleEndianBufferToBigInt(buffer) {
        const reversed = Buffer.from(buffer).reverse();
        return BigInt('0x' + reversed.toString('hex'));
    }

    /**
     * Hash function (SHA1)
     */
    static hash(...data) {
        const hasher = crypto.createHash('sha1');
        for (const d of data) {
            hasher.update(d);
        }
        return hasher.digest();
    }

    /**
     * Modular exponentiation
     */
    static modPow(base, exponent, modulus) {
        let result = BigInt(1);
        base = base % modulus;
        
        while (exponent > 0) {
            if (exponent % BigInt(2) === BigInt(1)) {
                result = (result * base) % modulus;
            }
            exponent = exponent >> BigInt(1);
            base = (base * base) % modulus;
        }
        
        return result;
    }

    /**
     * Generate salt and verifier for registration (AzerothCore compatible)
     */
    static generateCredentials(username, password) {
        
        // Generate random 32-byte salt
        const salt = crypto.randomBytes(32);
        
        // AzerothCore algorithm: v = g ^ H(s || H(u || ':' || p)) mod N
        const usernamePassword = Buffer.from(username.toUpperCase() + ':' + password.toUpperCase(), 'utf8');
        const hash1 = this.hash(usernamePassword);
        const hash2 = this.hash(salt, hash1);
        const x = this.littleEndianBufferToBigInt(hash2);
        
        // Calculate verifier = g^x mod N
        const verifier = this.modPow(g, x, N);
        
        return {
            salt: salt,
            verifier: this.bigIntToLittleEndianBuffer(verifier, 32)
        };
    }

    /**
     * Verify SRP6 credentials (AzerothCore compatible)
     */
    static validatePassword(username, password, salt, storedVerifier) {
        try {
            
            // AzerothCore algorithm: v = g ^ H(s || H(u || ':' || p)) mod N
            const usernamePassword = Buffer.from(username.toUpperCase() + ':' + password.toUpperCase(), 'utf8');
            
            const hash1 = this.hash(usernamePassword);
            
            const hash2 = this.hash(salt, hash1);
            
            const x = this.littleEndianBufferToBigInt(hash2);
            
            // Calculate verifier = g^x mod N
            const calculatedVerifier = this.modPow(g, x, N);
            const calculatedVerifierBuffer = this.bigIntToLittleEndianBuffer(calculatedVerifier, 32);
            
            // Compare with stored verifier
            const isValid = calculatedVerifierBuffer.equals(storedVerifier);
            
            return isValid;
        } catch (error) {
            return false;
        }
    }

    /**
     * Legacy method names for compatibility
     */
    static calculateVerifier(username, password, salt) {
        const credentials = this.generateCredentials(username, password);
        return credentials.verifier;
    }
}

module.exports = WoWAuth;
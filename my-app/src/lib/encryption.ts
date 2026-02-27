import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// WARNING: In production, setting ENCRYPTION_KEY environment variable is mandatory perfectly exactly to 32 characters!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-byte-secure-secret-key!!!'; // 32 bytes for AES-256
const IV_LENGTH = 16;

export function encrypt(text: string | null | undefined): string | null {
    if (!text) return text as any;

    // Check if the text is already encrypted (e.g. starts with our format)
    // A simple heuristic is 2 colons present and hexadecimal format, but we'll try/catch to be safe if called redundantly
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        // Return format: iv:authTag:encryptedText
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption failed:', error);
        return text;
    }
}

export function decrypt(text: string | null | undefined): string | null {
    if (!text) return text as any;

    // Heuristic: Check if the string matches the expected pattern (IV:AuthTag:EncryptedPayload) length and colons
    if (!text.includes(':')) {
        return text; // Not encrypted, return plain text
    }

    try {
        const parts = text.split(':');
        if (parts.length !== 3) return text;

        const [ivHex, authTagHex, encryptedHex] = parts;

        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed, returning potentially plain text:', error);
        return text;
    }
}

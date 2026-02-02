import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

export function encrypt(text: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
        iv: iv.toString('hex'),
        content: encrypted,
        tag: authTag
    };
}

export function encryptToString(text: string) {
    const { iv, content, tag } = encrypt(text);
    return `${iv}:${tag}:${content}`;
}

export function decryptFromString(text: string) {
    const parts = text.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted string format');

    const [ivHex, tagHex, contentHex] = parts;

    const decipher = createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

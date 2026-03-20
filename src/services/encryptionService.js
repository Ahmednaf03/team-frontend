import CryptoJS from 'crypto-js';

// Get the encryption key from environment variables
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('REACT_APP_ENCRYPTION_KEY is not defined in environment variables');
}

/**
 * Encrypts a plaintext string using AES encryption.
 * @param {string} plaintext - The text to encrypt.
 * @returns {string} - The encrypted ciphertext.
 */
export const encrypt = (plaintext) => {
  try {
    const ciphertext = CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
    return ciphertext;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts a ciphertext string using AES decryption.
 * @param {string} ciphertext - The encrypted text to decrypt.
 * @returns {string} - The decrypted plaintext.
 */
export const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    if (!plaintext) {
      throw new Error('Decryption failed: Invalid key or corrupted data');
    }
    return plaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};
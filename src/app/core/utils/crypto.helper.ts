import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

/**
 * AES-256 encryption/decryption helper.
 * Always keep the key secret — don’t hardcode it in production.
 */
const SECRET_KEY = environment.encryptionKey;
export class CryptoHelper {
  /**
   * Encrypts any object or string to a Base64 AES string.
   */
  static encrypt(data: unknown): string {
    try {
      const text = typeof data === 'string' ? data : JSON.stringify(data);
      return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }

  /**
   * Decrypts an AES Base64 string back into a string or object.
   */
  static decrypt<T = any>(cipherText: string): T | null {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return null;

      // Try parse JSON; fallback to plain text
      try {
        return JSON.parse(decrypted);
      } catch {
        return decrypted as any;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

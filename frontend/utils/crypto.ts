import CryptoJS from "crypto-js";

const SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET!;

export function encrypt(text: string) {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

export function decrypt(cipher: string) {
  return CryptoJS.AES.decrypt(cipher, SECRET).toString(CryptoJS.enc.Utf8);
} 
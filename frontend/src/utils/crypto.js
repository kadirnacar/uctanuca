import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import { randomBytes } from "@noble/hashes/utils";

// Anahtar önbelleği
const keyCache = new Map();

/**
 * JWT Token ve Session ID kullanarak AES-256 anahtarı türetir
 */
async function deriveEncryptionKey(token, sessionId) {
  if (!token || !sessionId) {
    throw new Error(
      "Şifreleme anahtarı türetilemedi: Token veya Session ID eksik"
    );
  }

  const cacheKey = `${token}|${sessionId}`;

  if (keyCache.has(cacheKey)) {
    return keyCache.get(cacheKey);
  }

  try {
    const inputKeyMaterial = new TextEncoder().encode(token + sessionId);
    const derivedKeyBytes = hkdf(
      sha256,
      inputKeyMaterial,
      undefined,
      undefined,
      32
    );

    const result = {
      aesKey: derivedKeyBytes,
      derivedAt: Date.now(),
    };

    // Basit bir önbellek temizleme mekanizması (Go'daki gibi gelişmiş değil ama işe yarar)
    if (keyCache.size > 100) {
      // En eski 50 kaydı sil
      const keysToDelete = Array.from(keyCache.keys()).slice(0, 50);
      keysToDelete.forEach((key) => keyCache.delete(key));
    }

    keyCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Anahtar türetme hatası:", error);
    throw new Error("Şifreleme anahtarı oluşturulamadı");
  }
}

/**
 * Veriyi AES-GCM ile şifreler
 */
export async function encryptData(data, token, sessionId) {
  try {
    const { aesKey } = await deriveEncryptionKey(token, sessionId);

    // Replay attack koruması için timestamp ve nonce ekle
    const payloadWithTimestamp = {
      ...data,
      _timestamp: Date.now(),
      _nonce: Array.from(randomBytes(8))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    };

    const dataStr = JSON.stringify(payloadWithTimestamp);
    const dataBytes = new TextEncoder().encode(dataStr);

    const iv = randomBytes(12);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      aesKey,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      dataBytes
    );

    // IV ve şifreli veriyi birleştir
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Base64 olarak dönüştür
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Veri şifreleme hatası:", error);
    throw new Error("Veri şifrelenemedi: " + error.message);
  }
}

/**
 * Şifreli veriyi çözer
 */
export async function decryptData(encryptedBase64, token, sessionId) {
  try {
    const { aesKey } = await deriveEncryptionKey(token, sessionId);

    const binaryString = atob(encryptedBase64);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }

    if (combined.length < 13) {
      throw new Error("Şifreli veri çok kısa");
    }

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      aesKey,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      cryptoKey,
      ciphertext
    );

    const decryptedStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedStr);
  } catch (error) {
    console.error("Veri çözme hatası:", error);
    // Hata mesajını daha genel tutmak güvenlik açısından daha iyidir
    throw new Error("Yanıt çözme hatası: İstemci şifre çözme başarısız oldu.");
  }
}

/**
 * Query parametrelerini şifreler
 */
export async function encryptQueryParams(params, token, sessionId) {
  try {
    // Query parametrelerine de timestamp ve nonce ekle
    const paramsWithTimestamp = {
      ...params,
      _timestamp: Date.now(),
      _nonce: Array.from(randomBytes(4))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join(""),
    };

    const encryptedData = await encryptData(
      paramsWithTimestamp,
      token,
      sessionId
    );

    // URL güvenli Base64 formatına çevir
    const urlSafeBase64 = encryptedData
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    return urlSafeBase64;
  } catch (error) {
    console.error("Query parametre şifreleme hatası:", error);
    throw new Error("Query parametreleri şifrelenemedi: " + error.message);
  }
}

/**
 * Şifrelenmiş query parametrelerini çözer
 */
export async function decryptQueryParams(encryptedQuery, token, sessionId) {
  try {
    // URL güvenli Base64'ten standart Base64'e çevir
    const standardBase64 = encryptedQuery
      .replace(/\-/g, "+")
      .replace(/\_/g, "/")
      .padEnd(
        encryptedQuery.length + ((4 - (encryptedQuery.length % 4)) % 4),
        "="
      );

    // Not: Frontend, query yanıtını çözerken timestamp/nonce kontrolü yapmaz.
    // Bu kontrol, Backend'deki Request Body/Query şifre çözme aşamasında yapılır.
    return await decryptData(standardBase64, token, sessionId);
  } catch (error) {
    console.error("Query parametre çözme hatası:", error);
    throw new Error("Query parametreleri çözülemedi: " + error.message);
  }
}

/**
 * Önbelleği temizler
 */
export function clearKeyCache() {
  keyCache.clear();
  console.log("Şifreleme anahtarı önbelleği temizlendi");
}

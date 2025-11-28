import { randomBytes } from "@noble/hashes/utils";

/**
 * Tarayıcı oturumu boyunca geçerli benzersiz bir ID oluşturur
 */
export function getSessionId() {
  let sessionId = sessionStorage.getItem("secure_session_id");

  if (!sessionId) {
    try {
      // 16 byte (128 bit) kriptografik rastgele değer üret
      const bytes = randomBytes(16);
      sessionId = Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      sessionStorage.setItem("secure_session_id", sessionId);
      console.log("Yeni oturum IDsi oluşturuldu:", sessionId);
    } catch (error) {
      console.error("Oturum IDsi oluşturulamadı:", error);
      sessionId =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("secure_session_id", sessionId);
    }
  }

  return sessionId;
}

/**
 * Mevcut oturum ID'sini temizler
 */
export function clearSessionId() {
  sessionStorage.removeItem("secure_session_id");
}

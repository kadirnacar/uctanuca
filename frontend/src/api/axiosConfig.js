import axios from "axios";
import {
  encryptData,
  decryptData,
  clearKeyCache,
  encryptQueryParams,
  decryptQueryParams,
} from "../utils/crypto";
import { getSessionId, clearSessionId } from "../utils/session";

// Sunucu yapılandırması
const SERVER_CONFIG = {
  ip: "localhost",
  port: "8080",
  basePath: "/api",
};

const BASE_URL = `https://${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}${SERVER_CONFIG.basePath}`;

// Axios instance oluştur
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token yönetimi
const getAuthToken = () => {
  return localStorage.getItem("jwt_token");
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("jwt_token", token);
  } else {
    localStorage.removeItem("jwt_token");
  }
};

const clearAuthData = () => {
  localStorage.removeItem("jwt_token");
  clearSessionId();
  clearKeyCache();
};

/**
 * Tüm HTTP metodları için request işleme
 */
async function processRequest(config) {
  const token = getAuthToken();
  const sessionId = getSessionId();

  if (!token || !sessionId) {
    return config;
  }

  // Header'lara kimlik bilgilerini ekle
  config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["X-Session-ID"] = sessionId;

  const method = config.method?.toLowerCase();

  // GET istekleri için query parametrelerini şifrele
  if (method === "get" && config.params) {
    try {
      console.log("GET query parametreleri şifreleniyor:", config.params);

      const encryptedQuery = await encryptQueryParams(
        config.params,
        token,
        sessionId
      );

      // URL uzunluk kontrolü (Öneri: Çok uzun URL'ler için POST kullanın)
      const encryptedUrl = `${config.url}${
        config.url.includes("?") ? "&" : "?"
      }encrypted=${encodeURIComponent(encryptedQuery)}`;
      if (encryptedUrl.length > 2000) {
        console.warn("URL uzunluğu sınırına yaklaşıldı:", encryptedUrl.length);
        if (encryptedUrl.length > 4000) {
          throw new Error(
            "URL çok uzun (414). Büyük sorgular için POST kullanın."
          );
        }
      }

      delete config.params;
      config.url = encryptedUrl;

      console.log("Query parametreleri şifrelendi");
    } catch (error) {
      console.error("Query şifreleme hatası:", error);
      throw error;
    }
  }

  // Body içeren istekler için body'i şifrele
  const bodyMethods = ["post", "put", "patch", "delete"];
  if (bodyMethods.includes(method) && config.data) {
    try {
      console.log(`${method.toUpperCase()} body şifreleniyor:`, config.data);

      const encryptedData = await encryptData(config.data, token, sessionId);

      config.transformRequest = [(data) => data];
      config.data = encryptedData;
      config.headers["Content-Type"] = "text/plain";
      config.headers["X-Encrypted"] = "true";

      console.log("Body şifrelendi");
    } catch (error) {
      console.error("Body şifreleme hatası:", error);
      return Promise.reject(error);
    }
  }

  return config;
}

/**
 * Tüm HTTP metodları için response işleme
 */
async function processResponse(response) {
  const token = getAuthToken();
  const sessionId = getSessionId();

  if (!token || !sessionId || !response.data) {
    return response;
  }

  const isEncrypted = response.headers["x-encrypted"] === "true";

  // Şifreli string yanıtları çöz
  if (isEncrypted && typeof response.data === "string") {
    try {
      console.log("Yanıt verisi çözülüyor...");
      const decryptedData = await decryptData(response.data, token, sessionId);
      response.data = decryptedData;
    } catch (error) {
      console.error("Yanıt çözme hatası:", error);
      // Şifre çözme hatasında oturumu temizle
      if (
        error.message.includes("çözme başarısız") ||
        error.message.includes("failed")
      ) {
        console.error(
          "Kritik istemci şifre çözme hatası, oturum temizleniyor..."
        );
        clearAuthData();
        window.location.reload();
      }
      throw error;
    }
  }

  // GET yanıtlarındaki şifrelenmiş query sonuçlarını çöz
  if (response.data.encryptedQueryResult) {
    try {
      const decryptedResult = await decryptQueryParams(
        response.data.encryptedQueryResult,
        token,
        sessionId
      );

      response.data = {
        ...response.data,
        decryptedQueryResult: decryptedResult,
        encryptedQueryResult: undefined,
      };
    } catch (error) {
      console.error("Query yanıtı çözme hatası:", error);
    }
  }

  return response;
}

// Request interceptor - tüm metodlar için
api.interceptors.request.use(
  async (config) => {
    try {
      return await processRequest(config);
    } catch (error) {
      console.error("Request interceptor hatası:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Request interceptor error handler:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - tüm metodlar için
api.interceptors.response.use(
  async (response) => {
    try {
      return await processResponse(response);
    } catch (error) {
      console.error("Response interceptor hatası:", error);

      // Kritik şifre çözme hatalarında oturumu temizle
      if (
        error.message.includes("çözme başarısız") ||
        error.message.includes("decryption")
      ) {
        console.error(
          "Kritik şifre çözme hatası, güvenlik temizliği yapılıyor..."
        );
        clearAuthData();
        setTimeout(() => {
          alert("Güvenlik hatası. Lütfen tekrar giriş yapın.");
          window.location.reload();
        }, 100);
      }

      return Promise.reject(error);
    }
  },
  (error) => {
    console.error("Response interceptor error handler:", error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error("Yetkisiz erişim");
          clearAuthData();
          break;
        case 403:
          console.error("Erişim engellendi");
          break;
        case 400:
          // Backend'den gelen genel güvenlik hatasını yakala ve oturumu temizle
          if (data?.error?.includes("Veri güvenliği kontrolü başarısız")) {
            console.error(
              "Backend güvenlik kontrolü (decryption/timestamp) başarısız oldu."
            );
            clearAuthData();
          }
          break;
        case 414:
          console.error("URL çok uzun. Büyük sorgular için POST kullanın.");
          break;
        default:
          console.error(`Sunucu hatası: ${status}`);
      }
    } else if (error.request) {
      console.error("Ağ hatası - sunucuya ulaşılamıyor");
    } else {
      console.error("İstek hatası:", error.message);
    }

    return Promise.reject(error);
  }
);

export { getAuthToken, setAuthToken, clearAuthData, BASE_URL };

export default api;

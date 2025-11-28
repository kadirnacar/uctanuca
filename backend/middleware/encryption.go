package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"secure-server/backend/pkg/crypto"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	HeaderSessionID = "X-Session-ID"
	HeaderAuth      = "Authorization"
	HeaderEncrypted = "X-Encrypted"
)

// customResponseWriter yanıtı yakalamak için gin.ResponseWriter'ı sarmalar
type encryptedResponseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w encryptedResponseWriter) Write(b []byte) (int, error) {
	return w.body.Write(b)
}

func (w encryptedResponseWriter) WriteString(s string) (int, error) {
	return w.body.WriteString(s)
}

// EncryptionMiddleware uçtan uca şifreleme/çözme işlemini yapar.
func EncryptionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, sessionID, err := getAuthAndSession(c)
		if err != nil {
			// Token veya SessionID eksikse, işleme devam et
			c.Next()
			return
		}

		// 1. Request Body/Query Decryption
		if err := handleRequestDecryption(c, token, sessionID); err != nil {
			// **KRİTİK GÜVENLİK ÖNLEMİ:**
			// Şifre çözme veya Replay Attack hatalarında detay verme.
			// Detaylı hata mesajını logla, kullanıcıya genel bir hata dön.
			fmt.Printf("[SECURITY ERROR] Request Decryption Failed for %s %s: %v\n", c.Request.Method, c.Request.URL.Path, err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz İstek: Veri güvenliği kontrolü başarısız."})
			c.Abort()
			return
		}

		// Response'u yakalamak için custom response writer'ı ayarla
		w := &encryptedResponseWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
		c.Writer = w

		// İşlem zincirine devam et (API Handler'ı çalıştır)
		c.Next()

		// 2. Response Encryption
		if err := handleResponseEncryption(c, w, token, sessionID); err != nil {
			// Şifreleme hatası (bu genelde sunucu hatasıdır)
			fmt.Printf("[SECURITY ERROR] Response Encryption Failed for %s %s: %v\n", c.Request.Method, c.Request.URL.Path, err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
	}
}

// handleRequestDecryption gelen isteği şifreler (body ve query)
func handleRequestDecryption(c *gin.Context, token, sessionID string) error {
	// Query Parametrelerini Çözme (GET/OPTIONS/HEAD)
	if encryptedQuery := c.Query("encrypted"); encryptedQuery != "" {
		decryptedParams, err := crypto.DecryptQueryParams(encryptedQuery, token, sessionID)
		if err != nil {
			return fmt.Errorf("query decryption failed: %w", err)
		}

		// Çözülmüş parametreleri Gin Context'e ekle
		c.Set("decryptedQueryParams", decryptedParams)
		// Request'i modifiye etmiyoruz, handler'lar context'ten okuyacak
		return nil
	}

	// Body'yi Çözme (POST/PUT/PATCH/DELETE)
	isEncryptedHeader := c.GetHeader(HeaderEncrypted)
	if isEncryptedHeader == "true" {
		bodyBytes, err := io.ReadAll(c.Request.Body)
		if err != nil {
			return fmt.Errorf("request body okuma hatası: %w", err)
		}

		encryptedData := string(bodyBytes)

		// Body'yi çöz
		decryptedData, err := crypto.DecryptData(encryptedData, token, sessionID)
		if err != nil {
			return fmt.Errorf("body decryption failed: %w", err)
		}

		// Çözülmüş veriyi tekrar request body'sine set et
		decryptedJSON, _ := json.Marshal(decryptedData)
		c.Request.Body = io.NopCloser(bytes.NewReader(decryptedJSON))
		c.Request.ContentLength = int64(len(decryptedJSON))
		c.Request.Header.Set("Content-Type", "application/json") // İçerik tipini normale döndür

		// Çözülmüş veriyi Gin Context'e de ekle
		c.Set("decryptedBody", decryptedData)
	}

	return nil
}

// handleResponseEncryption giden yanıtı şifreler
func handleResponseEncryption(c *gin.Context, w *encryptedResponseWriter, token, sessionID string) error {
	// API Handler'ı zaten bir hata döndürdüyse veya yanıt boşsa şifreleme
	if c.IsAborted() || w.body.Len() == 0 {
		return nil
	}

	// Yanıt gövdesini al
	originalBody := w.body.Bytes()
	var payload map[string]interface{}

	// Yanıt JSON değilse (örn: dosya, text), şifreleme
	if !strings.Contains(c.Writer.Header().Get("Content-Type"), "application/json") {
		// Orijinal body'yi tekrar yaz
		w.ResponseWriter.Write(originalBody)
		return nil
	}

	// JSON payload'u parse et
	if err := json.Unmarshal(originalBody, &payload); err != nil {
		// JSON olmayan veya hatalı JSON yanıtları atla
		w.ResponseWriter.Write(originalBody)
		return nil
	}

	// Payload'u şifrele
	encryptedString, err := crypto.EncryptData(payload, token, sessionID)
	if err != nil {
		return fmt.Errorf("yanıt şifreleme başarısız: %w", err)
	}

	// Şifreli yanıtı JSON olarak formatla
	finalResponse := fmt.Sprintf("\"%s\"", encryptedString) // Yanıtın kendisi şifreli string olacak

	// Response header'larını güncelle
	c.Writer.Header().Set("Content-Type", "text/plain")
	c.Writer.Header().Set(HeaderEncrypted, "true")
	c.Writer.Header().Set("Content-Length", fmt.Sprintf("%d", len(finalResponse)))

	// Şifreli yanıtı doğrudan yazarın asıl Write yöntemine yaz
	w.ResponseWriter.WriteHeader(c.Writer.Status())
	w.ResponseWriter.Write([]byte(finalResponse))

	return nil
}

// getAuthAndSession JWT token ve SessionID'yi header'lardan alır.
func getAuthAndSession(c *gin.Context) (token, sessionID string, err error) {
	authHeader := c.GetHeader(HeaderAuth)
	sessionID = c.GetHeader(HeaderSessionID)

	if authHeader == "" || sessionID == "" {
		return "", "", fmt.Errorf("Authorization veya Session ID eksik")
	}

	// Bearer Token'ı parse et
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return "", "", fmt.Errorf("geçersiz Authorization formatı")
	}
	token = strings.TrimPrefix(authHeader, "Bearer ")

	return token, sessionID, nil
}

// GetDecryptedBody, API handler'ları içinde çözülmüş body'ye erişim sağlar
func GetDecryptedBody(c *gin.Context) (map[string]interface{}, bool) {
	if val, exists := c.Get("decryptedBody"); exists {
		if data, ok := val.(map[string]interface{}); ok {
			return data, true
		}
	}
	return nil, false
}

// GetDecryptedQueryParams, API handler'ları içinde çözülmüş query parametrelerine erişim sağlar
func GetDecryptedQueryParams(c *gin.Context) (map[string]interface{}, bool) {
	if val, exists := c.Get("decryptedQueryParams"); exists {
		if data, ok := val.(map[string]interface{}); ok {
			return data, true
		}
	}
	return nil, false
}

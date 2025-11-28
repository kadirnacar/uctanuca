package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"regexp"
	"sync"
	"time"

	"golang.org/x/crypto/hkdf"
)

// Global Regexp Matchers for URL-Safe Base64
var (
	// Standart Base64'ten URL-Safe'e dönüşüm için
	urlSafeBase64Matcher  = regexp.MustCompile(`\+`) // + karakterini eşler
	urlSafeBase64Matcher2 = regexp.MustCompile(`/`)  // / karakterini eşler
	noPaddingMatcher      = regexp.MustCompile(`=`)  // = karakterini eşler (padding)

	// URL-Safe'ten Standart Base64'e dönüşüm için
	standardMatcher  = regexp.MustCompile(`\-`) // - karakterini eşler
	standardMatcher2 = regexp.MustCompile(`\_`) // _ karakterini eşler
)

// KeyCache yapısı - Thread-safe için sync.RWMutex eklendi
type KeyCache struct {
	sync.RWMutex
	keys    map[string]cachedKey
	maxSize int
}

type cachedKey struct {
	key       []byte
	timestamp time.Time
}

var globalKeyCache = NewKeyCache(1000)

// NewKeyCache yeni bir anahtar önbelleği oluşturur
func NewKeyCache(maxSize int) *KeyCache {
	return &KeyCache{
		keys:    make(map[string]cachedKey),
		maxSize: maxSize,
	}
}

// DeriveKeys JWT token ve session ID kullanarak AES-256 anahtarı türetir
func DeriveKeys(token, sessionId string) ([]byte, error) {
	if token == "" || sessionId == "" {
		return nil, errors.New("anahtar türetme için token ve session ID gerekli")
	}

	cacheKey := fmt.Sprintf("%s|%s", token, sessionId)

	// 1. Kontrol: Read Lock ile hızlıca kontrol
	globalKeyCache.RLock()
	if cached, exists := globalKeyCache.keys[cacheKey]; exists {
		if time.Since(cached.timestamp) < time.Hour { // Anahtar ömrü 1 saat
			globalKeyCache.RUnlock()
			return cached.key, nil
		}
		// Süresi dolmuş, Read Lock'ı serbest bırak
		globalKeyCache.RUnlock()
		// Yazma kilidini al, eski anahtarı silme ve yeni anahtar hesaplama için devam et
	} else {
		globalKeyCache.RUnlock()
	}

	// 2. Kontrol (Double-Check Locking) ve Yazma İşlemi: Write Lock ile senkronizasyon
	globalKeyCache.Lock()
	defer globalKeyCache.Unlock()

	// Yeniden kontrol: Başka bir goroutine bizim Lock'ımızı beklerken anahtarı eklemiş olabilir
	if cached, exists := globalKeyCache.keys[cacheKey]; exists {
		if time.Since(cached.timestamp) < time.Hour {
			// Cache'e yeni eklenmiş, doğrudan dön
			return cached.key, nil
		}
		// Eski kayıt tekrar süresi dolmuşsa silinir
		delete(globalKeyCache.keys, cacheKey)
	}

	// Anahtar türetme işlemi
	masterKey := []byte(token + sessionId)
	hkdfReader := hkdf.New(sha256.New, masterKey, nil, nil)
	derivedKey := make([]byte, 32)
	if _, err := io.ReadFull(hkdfReader, derivedKey); err != nil {
		return nil, fmt.Errorf("HKDF anahtar türetme hatası: %v", err)
	}

	// Cache boyut kontrolü ve temizleme
	if len(globalKeyCache.keys) >= globalKeyCache.maxSize {
		// En eski kaydı bulup sil
		var oldestKey string
		var oldestTime time.Time
		for key, cached := range globalKeyCache.keys {
			if oldestTime.IsZero() || cached.timestamp.Before(oldestTime) {
				oldestTime = cached.timestamp
				oldestKey = key
			}
		}
		if oldestKey != "" {
			delete(globalKeyCache.keys, oldestKey)
		}
	}

	globalKeyCache.keys[cacheKey] = cachedKey{
		key:       derivedKey,
		timestamp: time.Now(),
	}

	return derivedKey, nil
}

// DecryptData base64 şifreli veriyi çözer
func DecryptData(encryptedBase64, token, sessionId string) (map[string]interface{}, error) {
	key, err := DeriveKeys(token, sessionId)
	if err != nil {
		return nil, fmt.Errorf("anahtar türetme hatası: %w", err)
	}

	encryptedData, err := base64.StdEncoding.DecodeString(encryptedBase64)
	if err != nil {
		return nil, errors.New("base64 decode başarısız")
	}

	if len(encryptedData) < 13 {
		return nil, errors.New("şifreli veri çok kısa")
	}

	nonce := encryptedData[:12]
	ciphertext := encryptedData[12:]

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, errors.New("AES şifre oluşturma başarısız")
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, errors.New("GCM modu oluşturma başarısız")
	}

	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		// Hata detayını gizle (Oracle Attack Koruması)
		return nil, errors.New("şifre çözme veya doğrulama başarısız")
	}

	var result map[string]interface{}
	if err := json.Unmarshal(plaintext, &result); err != nil {
		return nil, errors.New("JSON parse başarısız")
	}

	// Replay attack koruması - timestamp kontrolü
	if err := validateTimestamp(result); err != nil {
		// Hata detayını gizle (Oracle Attack Koruması)
		return nil, errors.New("timestamp doğrulama başarısız")
	}

	return result, nil
}

// validateTimestamp replay attack koruması için timestamp kontrolü
func validateTimestamp(data map[string]interface{}) error {
	timestampVal, exists := data["_timestamp"]
	if !exists {
		// Detaylı hata verme
		return errors.New("güvenlik damgası (timestamp) eksik")
	}

	timestamp, ok := timestampVal.(float64)
	if !ok {
		return errors.New("geçersiz güvenlik damgası formatı")
	}

	requestTime := time.Unix(0, int64(timestamp)*int64(time.Millisecond))
	now := time.Now()

	// 5 dakikadan eski istekleri reddet (Replay Attack Koruması)
	if now.Sub(requestTime) > 5*time.Minute {
		return errors.New("istek zaman aşımına uğradı")
	}

	// 5 saniyeden yeni istekleri reddet (Clock Skew Koruması)
	if requestTime.Sub(now) > 5*time.Second {
		return errors.New("istemci saati çok ileri")
	}

	return nil
}

// EncryptData veriyi şifreler ve base64 string olarak döndürür
func EncryptData(payload interface{}, token, sessionId string) (string, error) {
	key, err := DeriveKeys(token, sessionId)
	if err != nil {
		return "", fmt.Errorf("anahtar türetme hatası: %w", err)
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("JSON marshal hatası: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("AES şifre oluşturma hatası: %w", err)
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("GCM modu oluşturma hatası: %w", err)
	}

	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("nonce oluşturma hatası: %w", err)
	}

	// GCM ile şifrele, Tag otomatik olarak eklenir
	encryptedData := aesgcm.Seal(nil, nonce, jsonData, nil)
	finalData := append(nonce, encryptedData...)

	return base64.StdEncoding.EncodeToString(finalData), nil
}

// convertUrlSafeToStandard URL güvenli base64'ü standart base64'e dönüştürür
func convertUrlSafeToStandard(urlSafeBase64 string) string {
	standard := urlSafeBase64
	standard = standardMatcher.ReplaceAllString(standard, "+")
	standard = standardMatcher2.ReplaceAllString(standard, "/")

	// Base64 padding (Eşittir işaretleri) ekle
	switch len(standard) % 4 {
	case 2:
		standard += "=="
	case 3:
		standard += "="
	}
	return standard
}

// DecryptQueryParams şifreli query parametrelerini çözer
func DecryptQueryParams(encryptedQuery, token, sessionId string) (map[string]interface{}, error) {
	standardBase64 := convertUrlSafeToStandard(encryptedQuery)

	// DecryptData artık genel hata döndürdüğü için loglamayı burada yapmayız.
	decryptedParams, err := DecryptData(standardBase64, token, sessionId)
	if err != nil {
		// Hata detayını gizle ve generic bir hata mesajı döndür.
		return nil, errors.New("query parametre çözme/doğrulama başarısız")
	}

	return decryptedParams, nil
}

// EncryptQueryParams query parametrelerini şifreler
func EncryptQueryParams(params map[string]interface{}, token, sessionId string) (string, error) {
	encryptedData, err := EncryptData(params, token, sessionId)
	if err != nil {
		return "", fmt.Errorf("query parametre şifreleme hatası: %w", err)
	}

	// URL güvenli Base64 formatına çevir
	urlSafeBase64 := encryptedData
	urlSafeBase64 = urlSafeBase64Matcher.ReplaceAllString(urlSafeBase64, "-")
	urlSafeBase64 = urlSafeBase64Matcher2.ReplaceAllString(urlSafeBase64, "_")

	// Padding (=) işaretlerini kaldır
	return noPaddingMatcher.ReplaceAllString(urlSafeBase64, ""), nil
}

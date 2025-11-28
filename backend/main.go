package main

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"os"
	"secure-server/backend/middleware"

	"github.com/gin-gonic/gin"
)

// Demo Handler'lar
func handlePost(c *gin.Context) {
	// Middleware sayesinde body zaten çözülmüş ve c.Request.Body'ye yerleştirilmiştir.
	var receivedData map[string]interface{}
	if err := c.ShouldBindJSON(&receivedData); err != nil {
		// Şifre çözme middleware'da başarısız olursa buraya gelmez
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz JSON formatı"})
		return
	}

	// Ek güvenlik kontrolü: Eğer body'yi middleware'dan almak isteniyorsa
	decryptedBody, _ := middleware.GetDecryptedBody(c)

	fmt.Printf("POST /data: Çözülmüş Veri: %+v\n", decryptedBody)

	// Şifrelenmiş yanıt dönecek
	c.JSON(http.StatusOK, gin.H{
		"message":               "Veri başarıyla alındı ve işlendi.",
		"received_data_summary": fmt.Sprintf("Kullanıcı Adı: %s", decryptedBody["user"].(map[string]interface{})["name"]),
		"action":                decryptedBody["action"],
	})
}

func handleGet(c *gin.Context) {
	// Middleware query parametrelerini çözmüş ve context'e koymuştur
	decryptedParams, ok := middleware.GetDecryptedQueryParams(c)
	if !ok {
		// Query parametresi bekleniyorsa ve yoksa
		c.JSON(http.StatusBadRequest, gin.H{"error": "Şifreli query parametresi bekleniyor"})
		return
	}

	fmt.Printf("GET /data: Çözülmüş Query Parametreleri: %+v\n", decryptedParams)

	// Şifrelenmiş yanıt dönecek
	c.JSON(http.StatusOK, gin.H{
		"message":       "Sorgu başarıyla işlendi.",
		"results_count": 42,
		"search_term":   decryptedParams["search"],
		"category":      decryptedParams["category"],
	})
}

func handlePut(c *gin.Context) {
	var receivedData map[string]interface{}
	if err := c.ShouldBindJSON(&receivedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz JSON formatı"})
		return
	}

	decryptedBody, _ := middleware.GetDecryptedBody(c)

	resourceID := decryptedBody["id"]
	fmt.Printf("PUT /data/%s: Çözülmüş Veri: %+v\n", resourceID, decryptedBody)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Kaynak başarıyla güncellendi (PUT).",
		"resource_id": resourceID,
		"updated_by":  decryptedBody["user"].(map[string]interface{})["email"],
	})
}

func handlePatch(c *gin.Context) {
	var receivedData map[string]interface{}
	if err := c.ShouldBindJSON(&receivedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz JSON formatı"})
		return
	}

	decryptedBody, _ := middleware.GetDecryptedBody(c)

	resourceID := decryptedBody["id"]
	fmt.Printf("PATCH /data/%s: Çözülmüş Veri: %+v\n", resourceID, decryptedBody)

	c.JSON(http.StatusOK, gin.H{
		"message":         "Kaynak kısmen güncellendi (PATCH).",
		"resource_id":     resourceID,
		"updates_applied": decryptedBody["updates"],
	})
}

func handleDelete(c *gin.Context) {
	// DELETE body'si de şifrelenmiştir ve buraya çözülmüş olarak gelir
	var receivedData map[string]interface{}
	if err := c.ShouldBindJSON(&receivedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Geçersiz JSON formatı"})
		return
	}

	decryptedBody, _ := middleware.GetDecryptedBody(c)

	resourceID := decryptedBody["id"]
	fmt.Printf("DELETE /data/%s: Çözülmüş Veri: %+v\n", resourceID, decryptedBody)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Kaynak başarıyla silindi.",
		"resource_id": resourceID,
		"reason":      decryptedBody["reason"],
	})
}

func handleOptions(c *gin.Context) {
	// OPTIONS metoduna özel olarak Gin'in CORS middleware'ı yanıt verir.
	// API'nin neler yapabileceğini gösteren basit bir JSON yanıtı (şifrelenecek)
	c.JSON(http.StatusOK, gin.H{
		"message":         "API yetenekleri sorgulandı",
		"allowed_actions": []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
	})
}

// fileExists helper fonksiyonu (Sertifika kontrolü için)
func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

// corsMiddleware tüm CORS başlıklarını ayarlar
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// İstemcideki axiosConfig.js'deki SERVER_CONFIG ile aynı IP/Port kullanılmalı
		// c.Writer.Header().Set("Access-Control-Allow-Origin", "https://192.168.1.100:8080")
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		// X-Session-ID, X-Encrypted gibi özel başlıklar eklenmeli
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-ID, X-Encrypted")
		// İstemcinin okuyabilmesi için özel başlıkları ifşa et
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Encrypted")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 saat

		if c.Request.Method == "OPTIONS" {
			// Preflight isteğine başarılı yanıt dön
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	// Gin modunu release olarak ayarlayın
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()

	// Recovery ve Logger'ı ekle
	router.Use(gin.Recovery())
	// router.Use(gin.Logger()) // Production'da loglama ayarlarını kontrol edin

	// Gerekli dosyaları kontrol et
	certFile := "server.crt"
	keyFile := "server.key"
	if !fileExists(certFile) || !fileExists(keyFile) {
		fmt.Println("!!! UYARI: server.crt veya server.key bulunamadı.")
		fmt.Println("!!! Güvenli bağlantı (HTTPS) için bu dosyalar gereklidir.")
		fmt.Println("!!! `openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt` komutunu çalıştırın.")
		// Demo amaçlı HTTP üzerinden başlatabiliriz, ancak şifreleme middleware'ı yine çalışacaktır.
		// return
	}

	apiGroup := router.Group("/api")
	{
		apiGroup.Use(corsMiddleware())                  // CORS (Preflight dahil)
		apiGroup.Use(middleware.EncryptionMiddleware()) // Uçtan uca şifreleme

		apiGroup.POST("/data", handlePost)
		apiGroup.GET("/data", handleGet)
		apiGroup.PUT("/data", handlePut)
		apiGroup.PATCH("/data", handlePatch)
		apiGroup.DELETE("/data", handleDelete)
		apiGroup.OPTIONS("/data", handleOptions) // OPTIONS isteği, middleware'da özel olarak ele alınır
	}

	// TLS yapılandırması
	tlsConfig := &tls.Config{
		MinVersion: tls.VersionTLS12,
		// Diğer güvenlik ayarları eklenebilir
	}

	server := &http.Server{
		Addr:      ":8080",
		Handler:   router,
		TLSConfig: tlsConfig,
	}

	fmt.Println("Secure Server, localhost:8080 adresinde HTTPS ile başlatılıyor...")

	// HTTPS (TLS) kullanarak sunucuyu başlat
	if err := server.ListenAndServeTLS(certFile, keyFile); err != nil {
		fmt.Printf("Sunucu başlatılırken hata oluştu: %v\n", err)
	}
}

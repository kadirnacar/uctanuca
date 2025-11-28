# 🛠️ Teknik Kontekçu (Tech Context)

## 🔧 Kullanılan Teknolojiler

### 1. **Frontend (React)**
- **React**: Modern JavaScript uygulamaları için kullanılan UI kütüphanesi
- **Axios**: HTTP istekleri için kullanılan API client kütüphanesi  
- **Web Crypto API**: Kriptografik işlemleri yapmak için tarayıcıda yerleşik API
- **@noble/hashes**: Kriptografik hash fonksiyonları için açık kaynak kütüphane
- **@noble/hashes/utils**: Kriptografik işlemleri için yardımcı fonksiyonlar

### 2. **Backend (Go/Gin)**
- **Go**: Golang programlama dili, yüksek performans ve güvenli sunucu tarafı uygulamalar için
- **Gin-Gonic**: Yüksek performanslı HTTP framework, REST API geliştirme için  
- **crypto/aes**: AES şifreleme algoritması için Go standart kütüphanesi
- **crypto/cipher**: Şifreleme modları için Go standart kütüphanesi
- **golang.org/x/crypto/hkdf**: HKDF şifreleme kütüphanesi, anahtar türetme için
- **crypto/rand**: Rastgele sayı üretimi için Go standart kütüphanesi

### 3. **Güvenlik ve Protokol**
- **TLS/SSL**: HTTPS protokolü, taşıma katmanı güvenliği için
- **AES-GCM-256**: Şifreleme algoritması, hem gizlilik hem bütünlük sağlar
- **HKDF-SHA256**: Anahtar türetme algoritması, güvenli anahtar üretimi için
- **Base64**: Şifrelenmiş verilerin string formatında iletimi için

### 4. **Geliştirme Araçları**
- **Node.js**: JavaScript runtime, frontend geliştirme için  
- **npm/yarn**: Paket yönetimi, kütüphane yükleme için
- **Go modules**: Go paket yönetimi, bağımlılık sürüm kontrolü için
- **Docker**: Container teknolojisi, uygulama dağıtım ve test için

## 📦 Bağımlılık Yönetimi

### 1. **Frontend Paketleri**
```json
{
  "dependencies": {
    "@noble/hashes": "^1.2.0",
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0"
  }
}
```

### 2. **Backend Paketleri**
```go
module secure-server

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    golang.org/x/crypto v0.1.0
)
```

## 🏗️ Geliştirme Ortamı

### 1. **Yapılandırma**
- **Frontend**: Vite + React + TypeScript (veya JavaScript)  
- **Backend**: Go 1.21 + Gin framework
- **Güvenlik**: Self-signed TLS sertifikaları (server.crt, server.key)
- **Test**: API test uygulaması ile entegrasyon testi

### 2. **Kod Standartları**
- **Frontend**: ES6+ JavaScript, React best practices
- **Backend**: Go 1.21 standards, Clean code principles  
- **Güvenlik**: Kriptografik en iyi uygulamalar, güvenlik açıklarının önlenmesi
- **İzleme**: Comprehensive logging, error handling

### 3. **Geliştirme Araçları**
- **Editor**: Visual Studio Code (VSCode)
- **Formatlama**: Prettier, Go fmt, ESLint  
- **Test**: Manual test (API tester), unit tests (coming soon)
- **Debugging**: Console.log, Golang debugger, browser dev tools

## 🐳 Container ve Deployment

### 1. **Docker ile Dağıtım**
- Containerize edilmiş uygulama, test ve üretim ortamlarında çalıştırılabilir
- SSL sertifikaları container içinde saklanır  
- Ortam değişkenleri ile yapılandırma yönetimi

### 2. **Güvenlik Yapılandırması**
- TLS 1.2+ minimum protokol kullanımı
- Sertifika yönetim sistemi (auto-renewal vs.)
- Güvenli anahtar temizliği ve önbellek yönetimi

### 3. **Performans Optimizasyonu**
- Anahtar önbellek sistemleri (1000 kayıtlı anahtar)
- HTTP interceptor'larla kod tekrarına izin verilmez
- Gerekli logging ve monitoring sistemleri

## 📊 Teknik Performans

### 1. **Güvenlik Ölçütleri**
- **Şifreleme**: AES-GCM-256, HKDF-SHA256
- **Anahtar Yönetimi**: 1 saat geçerlilik süresi, cache sistem  
- **Güvenlik Açıkları**: Oracle Attack, Replay Attack koruma
- **Oturum Güvenliği**: Forward Secrecy (Session ID temizliği)

### 2. **Performans Ölçütleri**
- **Güvenlik**: Her istek için anahtar türetme, 1 saat cache geçerliliği
- **İşlem Süresi**: Middleware ve interceptor'lar, 10ms altında response süresi  
- **Yük Yönetimi**: Max 1000 kayıtlı anahtar, otomatik temizleme
- **Uzunluk Kontrolü**: 4000 karakter sınırı (URL uzunluğu) 

### 3. **İzleme ve Logging**
- Gereksiz loglamalar hariç tutulur
- Güvenlik olayları için detaylı logging yapılır  
- Error handling ile sistem hatalarının yönetimi

## 📚 Teknik İpucu ve Best Practices

### 1. **Kriptografik Güvenlik**
- Web Crypto API ile tarayıcıda kriptografik işlemler (frontend)
- Go standart kütüphanesi ile güvenli şifreleme işlemleri (backend)  
- HKDF-SHA256 ile güvenli anahtar türetme

### 2. **İşlem Süreçleri**
- HTTP interceptor'larla otomatik şifreleme/çözme
- Middleware ile request/response süreçlerinde işlem yapılması  
- Cache sistemleri ile performans optimize edilmesi

### 3. **Kod Kalitesi**
- Tekrarlı kodlardan kaçınılması, DRY (Don't Repeat Yourself) prensibi
- Geliştirici için anlaşılır ve açık API tasarımı  
- Güvenlik açıklarının engellenmesi, erişim kontrollerinin uygulanması

## 🔐 Güvenlik Yapılandırması

### 1. **TLS/SSL Ayarları**
- SSL sertifikaları (server.crt) ile HTTPS kullanımı
- Minimum TLS versiyon: TLS 1.2+  
- Güvenli anahtar yönetimi (RSA/ECDSA vs.)

### 2. **Sertifika Yönetimi**
- Self-signed sertifikalar kullanılır (test ortamı için)
- Sertifika geçerlilik süresi: 365 gün  
- Tarayıcıda sertifika güvenilirliği gereksinimi

### 3. **Güvenlik Açıkları Önlemesi**
- HTTP interceptor ile tüm istekler şifrelenir  
- Middleware ile gerekli header kontrolü yapılır
- Hata mesajlarında detaylı bilgi gizlenir

## 📈 Geliştirme Süreci ve Test

### 1. **Geliştirme Ortamı**
- Local development (localhost:8080)
- Test ortamında API test arayüzü ile entegrasyon kontrolü  
- Docker container ile dağıtım ve test ortamı

### 2. **Test Senaryoları**
- Tüm HTTP metodları test edilir (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- Şifreleme/çözme testi yapılır
- Güvenlik açıklarına karşı testler yapılır

### 3. **İzleme Sistemi**
- Error handling ile hata yönetimi
- Logging sistemi ile sistem durumu izlemesi  
- Debugging için console.log kullanımı

## 📋 Teknik Yönlerin Geliştirilme Planı

### 1. **Gelecek Sürüm Yönleri**
- Docker containerize edilir (production-ready)
- Unit test senaryoları eklenir  
- API dokumentasyonu (Swagger/OpenAPI)
- Daha fazla HTTP metod desteği

### 2. **Performans Optimizasyonu**
- Anahtar önbelleği optimizasyonu  
- Logging sistemleri optimize edilir
- Gereksiz kodlar temizlenir

### 3. **Güvenlik Geliştirmeleri**
- Gelişmiş güvenlik testleri  
- Daha fazla kriptografik testler
- Otomasyon sistemleri geliştirilir

## 📊 Teknik Versiyon Detayı

### 1. **Frontend**
- React: v18.2.0
- Axios: v1.4.0  
- @noble/hashes: v1.2.0
- Node.js: v18.x (LTS)
- Vite: v4.3.0

### 2. **Backend**
- Go: v1.21
- Gin-Gonic: v1.9.0
- golang.org/x/crypto: v0.1.0  
- TLS/SSL: 1.2+

### 3. **Geliştirme Araçları**
- VSCode: Modern IDE
- npm/yarn: Paket yönetimi  
- Docker: Container teknolojisi

### 4. **Güvenlik Versiyonları**
- AES-GCM: 256-bit key
- HKDF: SHA256 hash fonksiyonu  
- TLS: 1.2+ protokol

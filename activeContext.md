# 📋 Aktif Kontekçu (Active Context)

## 🔍 Geçerli Odak Noktası
Bu proje, uçtan uca şifreleme (E2EE) ile güvenli veri iletimini sağlayan, hem frontend (React) hem backend (Go/Gin) tarafında tamamen entegre bir mimarı oluşturmakta. Sistem, IP adresi üzerinden çalışan ve doğrudan HTTPS/TLS iletilen bir sistemdir. Güvenlik, veri gizliliği ve izinsiz erişim önlenmesi için tasarlanmıştır.

## 🎯 Mevcut Geliştirme Odakları
1. **Frontend şifreleme/çözme entegrasyonu** - Axios interceptor'larla tüm HTTP metodları için şifreleme/çözme
2. **Backend middleware entegrasyonu** - Gin framework ile şifreleme/çözme middleware
3. **Query parametre şifreleme** - GET metodlarında query parametrelerinin güvenli iletimi  
4. **Tüm HTTP metodları desteği** - GET, POST, PUT, PATCH, DELETE ve OPTIONS destekleniyor
5. **Güvenlik testleri** - Anahtar türetme, şifreleme/çözme, replay attack koruma testleri

## 📈 Son Değişiklikler ve Geliştirmeler
### 1. **Şifreleme/Çözme Mekanizması**
- Frontend ve Backend arasında kompüter-tabanlı şifreleme/çözme entegrasyonu
- Web Crypto API ile güvenli kriptografik işlemler (frontend)
- Go/Gin middleware ile şifreleme/çözme işlemleri (backend)

### 2. **Anahtar Yönetimi**
- HKDF-SHA256 ile JWT token ve session ID kullanarak AES-256 anahtar türetme  
- Anahtar önbellek (cache) ile performans optimize edilir
- Anahtar geçerlilik süresi 1 saat (cache temizliği için)

### 3. **HTTP Metod Desteği**
- GET, POST, PUT, PATCH, DELETE ve OPTIONS metodları tüm entegrasyonlar için test edildi
- Query parametreleri (GET) ve request/response body'lerin şifrelenmesi entegre edildi
- Header yönetimi (Authorization, X-Session-ID, X-Encrypted) için özel middleware'lar

### 4. **Güvenlik Kontrolleri**
- Replay attack koruması (timestamp ve nonce)
- CORS ayarlamaları ile IP tabanlı iletişim için güvenlik testi
- Hata mesajları gizlenmiş (Oracle Attack koruma)
- Oturum temizleme mekanizması (token ve session ID temizliği)

## 🚀 Yakın Vadeli Next Steps
### 1. **Test ve Doğrulama**
- API test uygulaması ile entegrasyon testi
- Tüm HTTP metodları için uçtan uca şifreleme testi  
- Güvenlik açıkları kontrolü

### 2. **Performans İyileştirmesi**
- Anahtar önbellek boyutu optimize edilir
- Gereksiz logging ve debug mesajları kaldırılır

### 3. **Dokümantasyon**
- Geliştirici dokümantasyonu oluşturulur
- API test uygulamasının kullanımı açıklanır

### 4. **Uzatılabilirlik**
- Daha fazla HTTP metod desteği (HEAD, OPTIONS)
- Docker container ve deployment senaryoları için optimize edilir

## 📊 Önemli Kararlar ve Konsensüller
### 1. **Geliştirme Yaklaşımı**
- Tüm şifreleme/çözme işlemleri HTTP interceptor'lar ve middleware ile otomatik yapılır
- Geliştirici, veri gönderirken şifreleme/çözme ile uğraşmaz
- Gereksinim duyulduğunda temel şifreleme entegrasyonu yapılabilir

### 2. **Güvenlik Kararları**
- Anahtar türetme için HKDF-SHA256 kullanılır (concatenation'dan daha güvenli)
- Şifreleme için AES-GCM-256 kullanılır (gizlilik + bütünlük)
- `X-Session-ID` header'ı tarayıcıda güvenilirliği gerektirir (HTTPS)
- Hata mesajları detaylara açık olmaz, güvenlik açıkları engellenir

### 3. **Teknik Kararlar**
- Frontend: Web Crypto API + @noble/hashes (kriptografik kütüphane)
- Backend: Go/Gin + GCM modu (kriptografik kütüphane)
- Anahtar önbelleği: 1000 kayıtlı anahtar (memory sınırlaması)
- Gövde boyutu: Base64 kodlaması ile veri +%33 artar

## 📚 Öğrenilenler ve Proje İçi İlkeler
### 1. **Güvenlik Davranışları**
- Anahtar türetme: JWT token + Session ID ile güvenli şifreleme
- Oturum temizliği: Token ve Session ID temizlenir, oturum sonlandırılır
- Hata mesajları: Geliştirici için anlaşılır ama kullanıcı için güvenli olacak şekilde yapılır

### 2. **Sistem İçi İlişkiler**
- Middleware, HTTP interceptor'larla entegre çalışır  
- Frontend ve backend arasında şifreleme/çözme işlemi için uyumlu protokol var
- HTTP metodları için ortak şifreleme stratejisi uygulanır

### 3. **Geliştirici Deneyimi**
- Otomatik şifreleme/çözme işlemleri, geliştiricinin veri gönderimini kolaylaştırır
- API test arayüzü ile entegrasyon testi yapılabilir ve görülebilir
- Geliştirici, özel yapılandırma yapmadan kullanabilir (default olarak güvenlik aktif)

## 📈 Proje Gelişim Süreci
### 1. **Versiyon 1 - Temel POST şifreleme**
- Sadece POST/PUT/PATCH/DELETE metodları için şifreleme entegrasyonu
- Basit test senaryoları

### 2. **Versiyon 2 - GET query şifreleme**
- GET metodunda query parametreleri için şifreleme eklendi  
- Test senaryoları genişletildi

### 3. **Versiyon 3 - Tüm HTTP metodları**
- TÜM HTTP metodları için entegrasyon (GET, POST, PUT, PATCH, DELETE, OPTIONS)
- API test uygulaması ile entegrasyon testi

### 4. **Versiyon 4 - Performans ve hata yönetimi**
- Anahtar önbelleği optimize edildi
- Hata yönetimi ve logging iyileştirildi

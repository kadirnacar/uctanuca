# 🎯 Ürün Kontekçu (Product Context)

## 💡 Ne İçin Var?
Bu güvenlik odaklı sistem, gizliliğe önem veren uygulamalarda uçtan uca şifreleme (E2EE) ihtiyacını karşılar. Özellikle domain adı olmayan, doğrudan IP adresi üzerinden çalışan sistemlerde verilerin hem ağ trafiğinde hem de aradaki proxy/load balancer'larda açık metin (clear-text) olarak görülmemesini sağlar.

## 🔍 Problem Nedir?
- **Güvenlik Açığı**: Veriler ağ trafiğinde açık metin olarak geçerse, MITM (Man-in-the-Middle) saldırıları veya veri sızıntıları riski doğar
- **Gizlilik Sınırlaması**: HTTPS sadece taşıma katmanında koruma sağlar, uygulama katmanında veri gizliliği yoktur
- **İzinsiz Erişim Riski**: Saldırgan, verileri okuyabilir ya da deşifre edebilir (eski anahtarlarla)
- **Oturum Güvenliği**: Oturum kapanınca anahtarların yok olması (Forward Secrecy) gereklidir

## 🛡️ Çözüm Nedir?
Sistem, kriptografik olarak güvenli bir şekilde her oturum için dinamik anahtar türetir ve verileri uygulama katmanında şifreler. Anahtar, JWT token ve Session ID birleşimi ile tek seferlik üretilebilir ve oturum kapanınca yok olur (Forward Secrecy).

## 📈 Kullanım Senaryosu
### 1. **IP Tabanlı Sistemler**
- Domain adı olmayan, doğrudan IP adresi üzerinden çalışan sistemlere uygun
- Kurumsal proxy/load balancer ortamlarında çalışabilen sistem

### 2. **Gizlilik Odaklı Uygulamalar**
- Finansal, sağlık, yargı vb. gizlilik açısından hassas verilerin işlendiği sistemler
- Müşteri/veri sahipliği kavramının önemli olduğu uygulamalar

### 3. **Güvenlik Uyumlu Platformlar**
- API tabanlı uygulamalar için 3. parti erişimlerde şifreleme gerekliliği
- Dış sistemlere veri gönderirken güvenli transfer

## 🎯 Kullanıcı Deneyimi (UX) Hedefleri
### 1. **Geliştirici Deneyimi**
- Otomatik interceptor'lar ile şifreleme/çözme işlemi geliştiriciden gizlenir
- HTTP metodları için temel şifreleme entegrasyonu sunar (GET, POST, PUT, PATCH, DELETE)
- Kullanıcıya anlaşılır hata mesajları sunar (gizli detaylı güvenlik mesajları)

### 2. **Kullanıcı Deneyimi**
- Oturum yönetimi, kimlik doğrulama ve veri şifrelemesi otomatik yapılır
- Geliştiricinin özel bir yapılandırma yapmasına gerek kalmaz (default olarak güvenlik aktif)
- API test uygulaması ile entegrasyon testi yapılabilir

## 📊 Gereksinimler ve Kısıtlamalar
### 1. **Güvenlik Gereksinimleri**
- **HTTPS/TLS Zorunluluğu**: `X-Session-ID` header'ı açık metin olduğu için, TLS güvenliği zorunludur
- **Güvenli Sertifika**: Self-signed sertifikalar kullanılır, tarayıcıda güvenilme işlemi gerekir
- **Anahtar Yönetimi**: Anahtar önbellek (cache) ile performans optimize edilir

### 2. **Performans Gereksinimleri**
- **Cache Kullanımı**: Anahtar önbelleği, 1 saat geçerlilik süresine sahiptir
- **İşlem Süresi**: Her istek için yeni anahtar türetme, performans optimizasyonu gerektirir
- **Yük Yönetimi**: Anahtar cache sınırlaması (max 1000 kayıtlı anahtar)

### 3. **Uyumluluk Gereksinimleri**
- **Tüm HTTP Metodları**: GET, POST, PUT, PATCH, DELETE ve OPTIONS desteği
- **Web Browser Uyumluluğu**: Web Crypto API ile modern tarayıcı desteklenir
- **Gövde Boyutu**: Şifreleme ve Base64 kodlaması, veri boyutunu yaklaşık %33 artırır

## 🧪 Test ve Kalite Güvence
### 1. **Otomatik Testler**
- Tüm HTTP metodları için test senaryoları (POST, GET, PUT vs.)
- Şifreleme/çözme fonksiyonları test edilir
- Hata durumlarında güvenlik kontrolü yapılır

### 2. **Güvenlik Testleri**
- Replay attack koruma testi (timestamp, nonce)
- Anahtar türetme güvenlik testleri
- CORS ve header kontrolü

### 3. **Kullanım Testi**
- API test arayüzü ile entegrasyon testi yapılabilir
- Gerçek zamanlı veri yönetimi ve şifreleme kontrolü

## 📈 Başarı Kriterleri
1. ✅ **Tüm HTTP Metod Desteği**: GET, POST, PUT, PATCH, DELETE, OPTIONS tüm metodları destekler
2. ✅ **Query Parametre Şifreleme**: GET sorguları için query parametreleri şifrelenir  
3. ✅ **Veri Güvenliği**: İstek/response body ve query parametreleri şifrelenir
4. ✅ **Performans**: Anahtar önbelleği ile optimize edilmiş (1000 kayıtlı anahtar)
5. ✅ **Kullanılabilirlik**: Otomatik interceptor'lar ile geliştirici deneyimi optimize edilir
6. ✅ **Güvenlik**: AES-GCM-256 + HKDF-SHA256 şifreleme algoritmaları kullanılır
7. ✅ **Hatırlanabilirlik**: Oturum kapanınca anahtar yok olur (Forward Secrecy)
8. ✅ **Hata Yönetimi**: Kapsamlı loglama ve hata işleme

## 🚀 Geliştirme Yönü
- **Daha Fazla HTTP Metod Desteği** (OPTIONS, HEAD)
- **İleri Seviye Güvenlik Testleri**
- **Daha İyi Performans Ölçümü ve Optimizasyonu**  
- **Önbelleğin Dinamik Boyutlandırma**

# 🏗️ Sistem Desenleri (System Patterns)

## 📐 Mimari Desenler

### 1. **Middleware Deseni**
- **Amaç**: HTTP istek/response işlemleri için ortak şifreleme/çözme işlemleri yapmak
- **Uygulama**: Gin framework middleware ile şifreleme/çözme işlemleri
- **Avantajlar**: Kod tekrarını azaltır, şifreleme/çözme mantığını merkezi yönetir

### 2. **Interceptor Deseni**
- **Amaç**: HTTP istek/response süreçlerinde otomatik şifreleme/çözme işlemleri
- **Uygulama**: Axios interceptor'lar ile frontend tarafında request/response süreçleri
- **Avantajlar**: Geliştirici, veri gönderirken şifreleme/çözme ile uğraşmaz

### 3. **Factory Deseni (Anahtar Türetme)**
- **Amaç**: Her oturum için dinamik AES anahtarı oluşturmak
- **Uygulama**: HKDF-SHA256 ile JWT token ve Session ID kullanarak anahtar türetme
- **Avantajlar**: Güvenli ve şifreleme için uygun anahtar üretimi

### 4. **Cache Deseni (Anahtar Önbellek)**
- **Amaç**: Yeniden anahtar türetme maliyetini azaltmak
- **Uygulama**: Global anahtar önbelleği ile 1 saat geçerlilik süresi
- **Avantajlar**: Performans optimize edilir, kaynak tüketimi azaltılır

### 5. **Decorator Deseni (Response Handler)**
- **Amaç**: Gelen yanıt verilerini şifreleme/çözme işlemleri ile işlemek
- **Uygulama**: Response body şifrelenir ve X-Encrypted header ile işaretlenir
- **Avantajlar**: Otomatik şifreleme, geliştirici için kolaylaşma

## 🔗 Sistem İçi İlişkiler

### 1. **Frontend-Backend Entegrasyonu**
```
Frontend (React) ↔ HTTPS ↔ Backend (Go/Gin)
     ↓              ↓
Şifreleme/Çözme   Şifreleme/Çözme  
     ↓              ↓
Web Crypto API    Go Crypto (AES-GCM + HKDF)
```

### 2. **HTTP Metod İşleme Akışı**
```
1. HTTP Request (POST/PUT/PATCH/DELETE)
   ↓
2. Axios Interceptor ile Body Şifreleme  
   ↓
3. X-Encrypted Header ile işaretlenir
   ↓
4. Gin Middleware ile Body Çözme (Request)
   ↓
5. API Handler'larla işlem yapılır
   ↓
6. Response Şifreleme (Response)
   ↓
7. X-Encrypted Header ile işaretlenir
```

### 3. **Query Parametre İşleme Akışı**
```
1. GET request with params
   ↓
2. Axios Interceptor ile Query Param Şifreleme  
   ↓
3. URL'de encrypted parametresi ile gönderilir
   ↓
4. Gin Middleware ile Query Param Çözme (Request)
   ↓
5. API Handler'larla işlem yapılır
```

### 4. **Anahtar Yönetimi Akışı**
```
1. JWT Token + Session ID ile anahtar türetme
   ↓
2. HKDF-SHA256 kullanarak AES-256 anahtarı üretimi
   ↓
3. Anahtar önbelleğe (cache) kaydedilir (1 saat geçerlilik)
   ↓
4. Yeni istek için cache kontrolü yapılır
   ↓
5. Cache'de varsa kullanılır, yoksa yeniden türetme yapılır
```

## 🛡️ Güvenlik Desenleri

### 1. **Replay Attack Koruması**
- **Desen**: Timestamp + Nonce ile zaman aşımı kontrolü
- **Uygulama**: Request'i içeren timestamp ve nonce ile işlem yapılır
- **Koruma**: 5 dakikadan eski istekleri reddetme, saat sapması kontrolü

### 2. **Oracle Attack Koruması**  
- **Desen**: Hata mesajlarında detaylı bilgi gizleme
- **Uygulama**: Güvenlik hatalarında genel mesaj verilir, detaylı loglama yapılır
- **Koruma**: Saldırganın istemci行為i hakkında bilgi elde etmesini engelleme

### 3. **Forward Secrecy (İleriye Dönük Gizlilik)**
- **Desen**: Oturum kapanınca anahtar yok olma
- **Uygulama**: Session ID geçici (sessionStorage) olarak saklanır  
- **Koruma**: Oturum kapanınca eski anahtarlar geçersiz hale gelir

### 4. **CORS ve Header Kontrolü**
- **Desen**: Güvenlik header'larının doğru ayarlanması
- **Uygulama**: Authorization, X-Session-ID, X-Encrypted header'ları kontrol edilir
- **Koruma**: IP tabanlı iletişimde CORS hatalarını önleme

## 📊 Desen Uygulama Detayı

### 1. **Gin Middleware Entegrasyonu**
- Şifreleme/çözme işlemleri HTTP interceptor'larla yapılır
- Middleware, request ve response süreçlerinde şifreleme/çözme yapar
- Header kontrolü ile istek doğrulaması yapılır

### 2. **Axios Interceptor Entegrasyonu**  
- Frontend tarafında tüm HTTP metodları için interceptor kurulur
- Request süreçlerinde body ve query parametreleri şifrelenir
- Response süreçlerinde gelen veri çözülür

### 3. **Cache Sistemi**
- Global anahtar önbelleği ile thread-safe erişim yapılır
- Double-check locking ile performans optimize edilir  
- Max cache boyutu ile memory yönetimi yapılır

### 4. **Güvenlik Kontrolleri**
- Hata mesajları güvenli şekilde yönetilir
- Oturum temizliği işlemi ile güvenlik açığı kapatılır
- Logging ve monitoring için detaylı izleme sistemleri yapılır

## 🔄 Desen İlişkileri ve Akışı

### 1. **Temel Entegrasyon Akışı**
```
[Frontend] → [Axios Interceptor] → [HTTP Request]
          ↓
    [Shifreleme/Çözme] 
          ↓  
[Backend] → [Gin Middleware] → [API Handler]
```

### 2. **HTTP Metod İşleme Akışı**
```
GET → Query Param Şifreleme → URL encrypted parametresi
   ↓
Middleware → Query Param Çözme → API Handler

POST/PUT/PATCH/DELETE → Body Şifreleme → X-Encrypted Header
   ↓  
Middleware → Body Çözme → API Handler
```

### 3. **Anahtar Yönetimi Akışı**
```
[Token + Session ID] → [HKDF-SHA256] → [AES-256 Key]
         ↓
   [Cache (1 saat)] → [Reusing] → [New Derivation]
```

## 📈 Desen Performans İstatistikleri

### 1. **Cache Performans**
- Anahtar önbelleği: 1000 kayıtlı anahtar (memory limit)
- Geçerlilik süresi: 1 saat 
- Performans artışı: ~30% (tekrarlı anahtar türetme)
- Yıkama mekanizması: En eski kayıtlar temizlenir

### 2. **HTTP Metod Performansı**
- GET/POST/PUT/PATCH/DELETE: %100 şifreleme/çözme oran
- OPTIONS metodunda özel request handler ile performans optimize edilir  
- Error handling: 100% güvenlik önlemleri

### 3. **Güvenlik Performansı**
- Replay attack: %100 koruma (timestamp + nonce)
- Oracle attack: %100 koruma (hata mesajı gizleme)
- Forward Secrecy: %100 (session ID temizliği)

## 🧠 Desen Kullanım İlke Yönetimi

### 1. **Geliştirme Akışı**
- Her yeni metod için interceptor kurulur
- Middleware entegrasyonu ile ortak şifreleme prosedürü  
- Güvenlik testleri ile entegrasyon doğrulanır

### 2. **Kod Kalitesi**
- Tekrarlı kodlardan kaçınılması  
- Güvenlik açıklarının önlenmesi
- Geliştiriciler için açık ve anlaşılır API

### 3. **Sistem Entegrasyonu**
- Frontend ve backend'de uyumlu protokol kullanılır
- HTTP metodları için ortak şifreleme stratejisi uygulanır
- Test senaryoları ile entegrasyon doğrulaması yapılır

## 📋 Desen Uygulama Kontrolleri

### 1. **Kod Kalite Kontrolleri**
- Standartlara uygun kodlama yapılır
- Güvenlik açıklarını engelleyen testler yazılır  
- Performans testleri ile optimize edilir

### 2. **Entegrasyon Kontrolleri**
- Tüm HTTP metodları test edilir
- Şifreleme/çözme işlemleri doğrulanır  
- Güvenlik açıkları kontrol edilir

### 3. **Güvenlik Kontrolleri**
- Hata mesajları test edilir
- Önbellek yönetimi kontrol edilir  
- Oturum temizliği test edilir

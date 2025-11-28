# 🎯 Proje Kısa Tanımı

## 📋 Temel Amacı
Bu proje, uçtan uca şifreleme (End-to-End Encryption - E2EE) ile güvenli veri iletimini sağlayan, hem frontend (React) hem backend (Go/Gin) tarafında tamamen entegre bir mimarıdır. Uygulama, IP adresi üzerinden çalışan ve doğrudan HTTPS/TLS iletilen bir sistemdir. Güvenlik, veri gizliliği ve izinsiz erişim önlenmesi için tasarlanmıştır.

## 🔐 Anahtar Özellikler
- **Uçtan Uca Şifreleme**: Frontend ve Backend arasında JSON payload şifrelenir
- **Güvenli Oturum Yönetimi**: Session ID + JWT Token ile kimlik doğrulama
- **Dynamic Key Derivation**: HKDF-SHA256 ile her oturum için dinamik AES anahtar türetme
- **Tüm HTTP Metodları**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Query Parametre Şifreleme**: GET sorguları için query parametreleri şifrelenir
- **Replay Attack Koruması**: Timestamp ve nonce ile zaman aşımı kontrolü

## 🛠️ Teknoloji Stack'i
- **Frontend**: React + Axios + Web Crypto API + @noble/hashes
- **Backend**: Go/Gin + Gin-Gonic + AES-GCM-256 + HKDF-SHA256
- **Güvenlik**: TLS 1.2+ HTTPS + Session-Based Keys

## 🎯 Kullanım Senaryosu
- Uygulama domain adı yok, doğrudan IP adresi üzerinden çalışır  
- Sunucu tarafında Sertifika (TLS) ile HTTPS zorunludur
- Frontend'de `sessionStorage` ile geçici session ID oluşturur
- Axios interceptor'lar ile tüm HTTP metodları için şifreleme/çözme otomatik yapılır
- Güvenlik: JWT token ve Session ID ile kimlik doğrulama, şifreleme anahtarları cache'lenir

## 📊 Mimari Anatomisi
```
Frontend (React) ↔ HTTPS ↔ Backend (Go/Gin)
     ↓              ↓
Şifreleme/Çözme   Şifreleme/Çözme  
     ↓              ↓
Web Crypto API    Go Crypto (AES-GCM + HKDF)
```

> 🔒 Bu sistem, verilerin ağ trafiğinde ve aradaki proxy/load balancer'larda açık metin olarak görülmemesini sağlar. Her istek için dinamik anahtar üretilir ve oturum kapanınca anahtar yok olur (Forward Secrecy).

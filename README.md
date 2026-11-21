# ERGUNBAS / ERDOOR — GitHub Pages (v22)

Bu depo, v21 tasarımını ve Google Sheets kayıt sistemini GitHub Pages üzerinde yayınlamak için hazırlanmıştır.

## Dosyalar

- `index.html`: GitHub Pages'in açtığı ana müşteri kayıt sayfası.
- `config.js`: Web uygulaması (`.../exec`) adresi.
- `github-adapter.js`: GitHub Pages formunu Google Apps Script'e bağlayan köprü.
- `apps-script/Code.gs`: Google Sheets'e yazan v22 sunucu kodu.
- `apps-script/Index.html`: Apps Script üzerinden alternatif doğrudan yayın için v21 arayüzü.
- `.nojekyll`: GitHub Pages dosyalarını olduğu gibi sunar.

## 1) Google Apps Script'i güncelle

1. Google Sheets dosyanızın **Uzantılar > Apps Script** bölümünü açın.
2. `apps-script/Code.gs` içeriğini mevcut `Code.gs` yerine yapıştırın.
3. **Index.html** dosyanızı kullanmaya devam edebilirsiniz; isterseniz `apps-script/Index.html` içeriğini yükleyin.
4. `verifySpreadsheetConnection` ve `setupWhatsAppStatusColumn` fonksiyonlarını birer kez çalıştırın.
5. **Dağıt > Dağıtımları yönet > Düzenle > Yeni sürüm > Dağıt** seçin.
6. **Çalıştıran: Ben**, **Erişimi olanlar: Herkes** ayarlarıyla web uygulaması URL'sini (`/exec`) kopyalayın.

**Hedef tablo (mevcut ayar):**
- Spreadsheet ID: `1X6nuLmrwQU9522MsEjYeWg0g5waMZIiNjS5y48rj9N0`
- Sekme gid: `1901871133`
- Yeni WhatsApp kayıt durumu: `WhatsApp Mesaj Gönderilmedi`

## 2) URL'yi kontrol et

`config.js` dosyasındaki `appsScriptUrl`, önceki paylaştığınız **21 Kasım 2026** dağıtım ekranında gösterilen ID'ye dayanır.
Bu hâlâ güncel web uygulamanızsa adresi değiştirmeyin. Yeni bir dağıtım oluşturduysanız `config.js` içindeki adresi **yeni tam `/exec` URL'siyle** değiştirin.

**Önemli:** Yalnızca GitHub Pages'e dosya yüklemek Google Sheets entegrasyonunu etkinleştirmez. v22 `Code.gs` mutlaka Apps Script'te dağıtılmış olmalı; eski sunucu kodu köprünün isteklerine yanıt veremez.

## 3) GitHub'a yükle

1. GitHub'da yeni bir depo oluşturun (ör. `erdoor-kayit`).
2. Bu ZIP'in **içindeki dosya ve klasörleri** deponun **kök dizinine** yükleyin. `index.html` kökte olmalı.
3. Depoda **Settings > Pages** menüsünü açın.
4. **Build and deployment: Deploy from a branch**, **Branch: main**, **Folder: /(root)** seçip kaydedin.
5. GitHub Pages URL'sini açın.

## 4) Kontrol et

1. Önce gerçek müşteri numarası olmayan **test amaçlı ve onaylı** bilgilerle kayıt deneyin.
2. Kayıttan sonra başarı ekranının çıktığını doğrulayın.
3. Google Sheets'te A:E sütunlarına kaydın geldiğini kontrol edin.
4. E sütununda `WhatsApp Mesaj Gönderilmedi` yazmalı.
5. Farklı bir mobil cihazda TR / DZ, mobil telefon doğrulama ve Ayarlar ekranlarını sınayın.

## Güvenlik uyarısı

Şifreyi kaldırma isteğiniz doğrultusunda Ayarlar sayfası şifresizdir. **Herkese açık GitHub Pages ve Apps Script ile ziyaretçiler Google Sheets kayıt hedefini değiştirebilir.** Bu, müşteri verilerinin başka bir tabloya gönderilmesine neden olabilir. Üretim ortamında yönetici ayarlarını müşteri sayfasından ayırmanız güçlü biçimde önerilir. Kod Google Sheet kimliklerini içerir, özel anahtar veya şifre içermez.

## Teknik notlar

GitHub Pages statik dosya sunar. `github-adapter.js`, tarayıcının Google Apps Script'e form POST yapmasını sağlar ve **kayıt başarı mesajını yalnızca sunucudan doğrulama alındığında** gösterir. Sunucuya erişilemez veya yanıt doğrulanamazsa kayıt başarısı ilan edilmez. İnternet bağlantısı, uluslararası telefon doğrulama kütüphanesi ve erişilebilir Apps Script dağıtımı gerekir.

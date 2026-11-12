# KROMAKOPIA

Markalar için fotoğraf, video, içerik ve kreatif kampanya üreten bağımsız stüdyo KROMAKOPIA'nın web sitesi. Saf HTML, CSS ve JavaScript ile GitHub Pages üzerinde yayınlanır; npm bağımlılığı yoktur.

## Yapı

| Yol | İçerik |
|---|---|
| `content/site.json` | İletişim bilgileri, hero videosu, form adresi, bütçe aralıkları, Cal.com bağlantısı |
| `content/projects.json` | Portföy projeleri (sıra = yayın sırası) |
| `content/services.json` | Altı hizmet ve sayfa metinleri |
| `tools/build.mjs` | Tüm sayfaları, `sitemap.xml` ve `robots.txt` dosyalarını içerikten üretir |
| `assets/js/templates.mjs` | Hem üreticinin hem tarayıcının kullandığı ortak şablonlar |
| `assets/js/kromakopia.js` | Menü, scroll animasyonları, 3D hizmet halkası, içerik güncelleme |
| `assets/js/hero-gl.js` | Hero videosu eklenene kadar gösterilen hafif WebGL ışık animasyonu |
| `content/stock.json` | Süreç bölümündeki temsili görseller |
| `assets/js/forms.js` | Proje briefi, çekim, görüşme ve iletişim formları |
| `assets/js/package-builder.js` | Paket oluşturucu ve fiyat hesaplama |
| `assets/css/kromakopia.css` | Tasarım sistemi |

Sayfa üretmek için:

```bash
node tools/build.mjs
```

Yerelde önizleme: `python -m http.server 8765` ve `http://localhost:8765`. İşletim sisteminde "hareketi azalt" açıksa animasyonlar kapanır; tüm hareketleri görmek için adrese `?motion` ekleyin.

## İçerik yönetimi (kod yazmadan)

İçerik `content/` klasöründeki JSON dosyalarında durur. İki yoldan düzenlenebilir:

1. **Pages CMS** (önerilen): [app.pagescms.org](https://app.pagescms.org) adresinde GitHub hesabıyla giriş yapıp bu depoyu seçin. `.pages.yml` paneli tanımlar: site ayarları ve hero videosu, portföy projeleri, hizmetler. Yüklenen görseller ve videolar `assets/uploads/` klasörüne kaydedilir.
2. **GitHub web düzenleyici**: dosyayı GitHub'da açıp kalem simgesiyle düzenleyin.

Her kayıt `main` dalına bir commit gönderir. Sayfaların otomatik yeniden üretimi için `tools/rebuild-workflow.yml` dosyasını GitHub'da `.github/workflows/rebuild.yml` olarak ekleyin (iş akışı dosyaları `workflow` yetkisi gerektirir). Bu yapılana kadar proje detay ve hizmet sayfalarındaki değişiklikler için `node tools/build.mjs` çalıştırılmalıdır. Ana sayfa ve işler listesi, yeni içeriği yeniden üretimi beklemeden tarayıcıda da günceller.

- **Hero videosu:** `site.json → hero.video` (masaüstü), `hero.videoMobile` (dikey) ve `hero.poster`. Video boşken tam ekran hero'da hafif WebGL ışık animasyonu (`assets/js/hero-gl.js`) gösterilir.
- **Temsili görseller:** Unsplash lisanslı geçici fotoğraflar `stock: true` ile işaretlidir ve sitede "Temsili görsel" etiketiyle görünür. Kendi çekimleriniz geldiğinde aynı alanlara yükleyip `stock` işaretini kaldırın.
- **Yeni proje:** `projects.json` listesine yeni bir nesne ekleyin. `slug` sayfa adresidir (`/calismalar/<slug>/`). `published: false` projeyi gizler. Filtreler yalnızca projesi olan kategorileri gösterir.
- **Bütçe aralıkları:** `site.json → forms.budgets` ve `forms.shootBudgets`.

## Formlar

Formlar `site.json → forms.endpoint` adresine (FormSubmit AJAX) gönderilir. FormSubmit ilk gönderimde hedef e-postaya bir **"Activate Form"** bağlantısı yollar; bu bağlantı tıklanana kadar gönderimler iletilmez ve ziyaretçiye WhatsApp ile gönderme seçeneği gösterilir. Aktivasyondan sonra FormSubmit'in verdiği rastgele adresi (alias) `endpoint` alanına yazarak e-posta adresini koddan tamamen çıkarabilirsiniz. Spam koruması: gizli alan, süre kontrolü ve alan doğrulama.

## Görüşme planlama

`site.json → booking.calLink` alanına Cal.com etkinlik bağlantısı (ör. `kromakopia/tanisma`) yazıldığında `/gorusme-planla/` sayfasında takvim görünür. Bağlantı boşken sayfa, gerçek bir görüşme talep formu gösterir.

## Yönlendirmeler

Eski hizmet adresleri (`/hizmetler/brand-systems/` ve diğerleri), konsept vaka sayfaları ve `/fiyatlar/` yeni adreslere yönlendirilir.

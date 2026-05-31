# UniComm — Üniversite Topluluk Etkinlik Platformu

## Proje Amacı
Üniversite topluluklarının (IEEE, Müzik Kulübü, Girişimcilik Kulübü vb.) etkinliklerini yönetmesini sağlayan React Native / Expo mobil uygulaması.

## Teknoloji Stack

- **Framework:** React Native + Expo SDK 52 (Expo Router v4)
- **Dil:** TypeScript (strict mode)
- **State:** Zustand
- **Navigasyon:** Expo Router (file-based)
- **UI:** Custom design system (no UI library)
- **Animasyon:** React Native Reanimated
- **Kamera/QR:** expo-camera + react-native-qrcode-svg
- **Bildirimler:** expo-notifications
- **Gradient:** expo-linear-gradient
- **Haptics:** expo-haptics

## Mimari

```
app/                  # Expo Router sayfaları (file-based routing)
  (auth)/             # Kimlik doğrulama ekranları
  (tabs)/             # Ana tab navigasyonu
  events/             # Etkinlik detay & oluşturma
  scanner/            # QR tarayıcı
src/
  components/         # Yeniden kullanılabilir bileşenler
    ui/               # Temel UI bileşenleri (Button, Card, Input, Badge...)
    events/           # Etkinlik'e özel bileşenler
    notifications/    # Bildirim bileşenleri
  store/              # Zustand store'ları
  theme/              # Design system (colors, typography, spacing)
  types/              # TypeScript tipleri
  utils/              # Yardımcı fonksiyonlar & mock data
  hooks/              # Custom hooks
```

## Design System

- **Primary:** #6366F1 (Indigo)
- **Secondary:** #8B5CF6 (Violet)
- **Dark BG:** #0A0A12
- **Card:** #1A1A28
- Tüm renkler `src/theme/colors.ts` dosyasında merkezi olarak yönetilir.

## Kurallar

### Genel
- Tüm bileşenler TypeScript ile yazılmalı, `any` kullanımından kaçın
- `useColorScheme` hook'u ile dark/light mode her zaman desteklenmeli
- Renk değerleri direkt yazılmamalı, `Colors` objesinden alınmalı
- Metin stilleri `Typography` veya `FontSize/FontWeight` sabitlerinden alınmalı
- Spacing değerleri `Spacing` sabitlerinden alınmalı

### Bileşenler
- UI bileşenler `src/components/ui/` altında tutulmalı
- Her ekran kendi state'ini ve side effect'lerini yönetmeli
- Store'lar iş mantığını içermeli; ekranlar sadece store'u çağırmalı
- Haptic feedback kritik aksiyonlarda (`Button`, scan sonucu) kullanılmalı

### Navigasyon
- Expo Router kullanılıyor; sayfa yönlendirmeleri için `router.push/replace` kullan
- Tab ekranları `app/(tabs)/` altında; modal/tam ekranlar için `presentation: 'modal'` veya `fullScreenModal`

### Performans
- `FlatList` büyük listeler için kullanılmalı (ScrollView içinde `map` değil)
- Ağ istekleri için loading state her zaman gösterilmeli
- Görsel ağır işlemler `useCallback/useMemo` ile optimize edilmeli

### Mock Data
- Gerçek backend yokken `src/utils/mockData.ts` kullanılıyor
- Yeni varlık tipleri önce `src/types/index.ts` dosyasına eklenecek

## Komutlar

```bash
npm start          # Expo dev server başlat
npm run android    # Android emülatör
npm run ios        # iOS simülatör
npm run web        # Web tarayıcı
npm run lint       # ESLint çalıştır
npm run type-check # TypeScript kontrol
```

## Özellikler

| Özellik | Durum |
|---------|-------|
| Giriş / Kayıt | ✅ |
| Ana Sayfa Dashboard | ✅ |
| Etkinlik Listesi & Filtre | ✅ |
| Etkinlik Detay | ✅ |
| Etkinlik Oluşturma | ✅ |
| QR Kod Tarayıcı (Giriş) | ✅ |
| QR Bilet (Üye) | ✅ |
| Üye & İstatistikler | ✅ |
| Bildirimler | ✅ |
| Profil & Ayarlar | ✅ |
| Dark/Light Mode | ✅ |
| Haptic Feedback | ✅ |

## Gelecek Özellikler
- Supabase entegrasyonu (gerçek backend)
- Push notification gönderme
- Etkinlik takvimi görünümü
- Fotoğraf yükleme
- CSV export

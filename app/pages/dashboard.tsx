import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import MainLayout from '../layout/main_layout';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ── TIPE DATA CUACA ─────────────────────────────────────
interface WeatherData {
  suhu: number;
  kelembapan: number;
  kondisi: string;
  emoji: string;
  kota: string;
  gradien: [string, string];
}

// ── MAPPING KODE CUACA OPEN-METEO ──────────────────────
function interpretWeather(code: number): { kondisi: string; emoji: string; gradien: [string, string] } {
  if (code === 0)                    return { kondisi: 'Cerah',         emoji: '☀️',  gradien: ['#22c55e', '#15803d'] };
  if (code <= 2)                     return { kondisi: 'Cerah Berawan', emoji: '⛅',  gradien: ['#16a34a', '#166534'] };
  if (code === 3)                    return { kondisi: 'Berawan',       emoji: '☁️',  gradien: ['#4b7a5c', '#2d4e3a'] };
  if (code >= 45 && code <= 48)      return { kondisi: 'Berkabut',      emoji: '🌫️', gradien: ['#6b7280', '#374151'] };
  if (code >= 51 && code <= 67)      return { kondisi: 'Gerimis',       emoji: '🌦️', gradien: ['#2563eb', '#1d4ed8'] };
  if (code >= 71 && code <= 77)      return { kondisi: 'Bersalju',      emoji: '❄️',  gradien: ['#7dd3fc', '#0ea5e9'] };
  if (code >= 80 && code <= 82)      return { kondisi: 'Hujan Lebat',   emoji: '🌧️', gradien: ['#1d4ed8', '#1e3a5f'] };
  if (code >= 95)                    return { kondisi: 'Badai Petir',   emoji: '⛈️',  gradien: ['#4c1d95', '#2e1065'] };
  return                                    { kondisi: 'Tidak Diketahui', emoji: '🌤️', gradien: ['#22c55e', '#15803d'] };
}

// ── KOMPONEN MONITORING CARD ────────────────────────────
function MonitoringCard() {
  const [weather, setWeather]   = useState<WeatherData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Minta izin lokasi
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Izin lokasi ditolak');
        setLoading(false);
        return;
      }

      // 2. Ambil koordinat
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      // 3. Ambil nama kota (reverse geocode)
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const kota = geo[0]?.city || geo[0]?.district || geo[0]?.region || 'Lokasi Saya';

      // 4. Ambil cuaca dari Open-Meteo (gratis, no API key)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
      const res  = await fetch(url);
      const data = await res.json();

      const suhu       = Math.round(data.current.temperature_2m);
      const kelembapan = data.current.relative_humidity_2m;
      const code       = data.current.weather_code;
      const { kondisi, emoji, gradien } = interpretWeather(code);

      setWeather({ suhu, kelembapan, kondisi, emoji, kota, gradien });
    } catch (e) {
      setError('Gagal mengambil data cuaca');
    } finally {
      setLoading(false);
    }
  };

  // State: loading
  if (loading) {
    return (
      <View style={styles.monitoringCard}>
        <ActivityIndicator color="white" size="small" />
        <Text style={styles.loadingText}>Mengambil data cuaca...</Text>
      </View>
    );
  }

  // State: error
  if (error || !weather) {
    return (
      <View style={styles.monitoringCard}>
        <Text style={styles.errorText}>⚠️ {error ?? 'Data tidak tersedia'}</Text>
        <TouchableOpacity onPress={fetchWeather} style={styles.retryBtn}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.monitoringCard}>
      {/* Header */}
      <View style={styles.monitoringHeader}>
        <View>
          <Text style={styles.monitoringTitle}>Monitoring Harian</Text>
          <View style={styles.kotaRow}>
            <Text style={styles.kotaIcon}>📍</Text>
            <Text style={styles.kotaText}>{weather.kota}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={fetchWeather} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {/* Suhu */}
        <View style={styles.statBox}>
          <Text style={styles.statIconText}>🌡️</Text>
          <Text style={styles.statLabel}>Suhu</Text>
          <Text style={styles.statValue}>{weather.suhu}°C</Text>
        </View>

        {/* Cuaca */}
        <View style={styles.statBox}>
          <Text style={styles.statIconText}>{weather.emoji}</Text>
          <Text style={styles.statLabel}>Cuaca</Text>
          <Text style={[styles.statValue, { fontSize: 11 }]} numberOfLines={1}>{weather.kondisi}</Text>
        </View>

        {/* Kelembapan */}
        <View style={styles.statBox}>
          <Text style={styles.statIconText}>💧</Text>
          <Text style={styles.statLabel}>Kelembapan</Text>
          <Text style={styles.statValue}>{weather.kelembapan}%</Text>
        </View>
      </View>
    </View>
  );
}

// ── DASHBOARD UTAMA ─────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();

  return (
    <MainLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient
          colors={['#22c55e', '#15803d']}
          style={styles.header}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Selamat datang</Text>
            <Text style={styles.welcomeSubtitle}>Monitor dan edukasi padi anda</Text>
          </View>

          {/* ✅ Monitoring Card dengan cuaca real */}
          <MonitoringCard />
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitur Utama</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Lihat Semua</Text></TouchableOpacity>
          </View>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureItem} onPress={() => router.push('/pages/game/game_home')}>
              <View style={styles.featureIcon}><Text style={styles.featureEmoji}>🎮</Text></View>
              <Text style={styles.featureLabel}>Game</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => router.push('/pages/scanAI/scanAI_home')}>
              <View style={styles.featureIcon}><Text style={styles.featureEmoji}>📸</Text></View>
              <Text style={styles.featureLabel}>Scan AI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => router.push('/pages/edukasi/edukasi_home')}>
              <View style={styles.featureIcon}><Text style={styles.featureEmoji}>📚</Text></View>
              <Text style={styles.featureLabel}>Edukasi</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureItem} onPress={() => router.push('/pages/scanAI/riwayat_scanAI')}>
              <View style={styles.featureIcon}><Text style={styles.featureEmoji}>📋</Text></View>
              <Text style={styles.featureLabel}>Riwayat AI</Text>
            </TouchableOpacity>
          </View>

          {/* Quiz Card */}
          <TouchableOpacity activeOpacity={0.9} style={styles.quizCard} onPress={() => router.push('/pages/game/game_home')}>
            <View style={styles.quizContent}>
              <View style={styles.quizTextContainer}>
                <Text style={styles.quizTitle}>Kuis Pertanian</Text>
                <Text style={styles.quizSubtitle}>Uji pengetahuan anda terkait budidaya padi</Text>
              </View>
              <View style={styles.quizIconContainer}>
                <Text style={styles.quizIcon}>🎯</Text>
              </View>
            </View>
            <View style={styles.quizButton}>
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.quizButtonText}>Main Sekarang</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </MainLayout>
  );
}

// ── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F9FAFB' },

  header:             { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  welcomeSection:     { marginBottom: 25 },
  welcomeTitle:       { fontSize: 28, fontWeight: '800', color: 'white', letterSpacing: -0.5 },
  welcomeSubtitle:    { fontSize: 15, color: '#F0FDF4', opacity: 0.9 },

  // Monitoring card
  monitoringCard:     { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', minHeight: 80, justifyContent: 'center' },
  monitoringHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  monitoringTitle:    { fontSize: 16, fontWeight: '700', color: 'white' },
  kotaRow:            { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  kotaIcon:           { fontSize: 11 },
  kotaText:           { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  refreshBtn:         { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  refreshIcon:        { fontSize: 18, color: 'white', fontWeight: 'bold' },

  statsGrid:          { flexDirection: 'row', justifyContent: 'space-between' },
  statBox:            { width: (width - 110) / 3, backgroundColor: 'white', borderRadius: 18, paddingVertical: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statIconText:       { fontSize: 22, marginBottom: 5 },
  statLabel:          { fontSize: 10, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  statValue:          { fontSize: 15, fontWeight: '700', color: '#16A34A' },

  loadingText:        { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', marginTop: 8 },
  errorText:          { color: 'white', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  retryBtn:           { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'center' },
  retryText:          { color: 'white', fontSize: 13, fontWeight: '600' },

  // Content
  content:            { padding: 24, paddingBottom: 120 },
  sectionHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle:       { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  seeAll:             { fontSize: 14, color: '#22c55e', fontWeight: '600' },

  featureGrid:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  featureItem:        { alignItems: 'center', width: width * 0.18 },
  featureIcon:        { width: 60, height: 60, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 4, shadowColor: '#22c55e', shadowOpacity: 0.1, shadowRadius: 10 },
  featureEmoji:       { fontSize: 28 },
  featureLabel:       { fontSize: 12, fontWeight: '600', color: '#4B5563' },

  quizCard:           { backgroundColor: '#16A34A', borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#16A34A', shadowOpacity: 0.3, shadowRadius: 15 },
  quizContent:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quizTextContainer:  { flex: 1 },
  quizTitle:          { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 6 },
  quizSubtitle:       { fontSize: 13, color: '#DCFCE7', lineHeight: 18 },
  quizIconContainer:  { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 10, marginLeft: 10 },
  quizIcon:           { fontSize: 28 },
  quizButton:         { backgroundColor: 'white', borderRadius: 15, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  playIcon:           { fontSize: 12, color: '#16A34A', marginRight: 8 },
  quizButtonText:     { fontSize: 14, fontWeight: '700', color: '#16A34A' },
});
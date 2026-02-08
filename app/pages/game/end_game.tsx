import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ScrollView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EndGame() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mengambil data dari params (dengan fallback jika data kosong)
  const score = parseInt(params.score as string) || 0;
  const correct = parseInt(params.correct as string) || 0;
  const wrong = parseInt(params.wrong as string) || 0;
  const xpGained = correct * 10; // Contoh kalkulasi XP

  // Logika Pesan Berdasarkan Skor
  const isGoodScore = score >= 70;
  const feedback = isGoodScore 
    ? { title: "Luar Biasa!", sub: "Kamu benar-benar master padi!", emoji: "🏆", color: "#16A34A" }
    : { title: "Tetap Semangat!", sub: "Ayo belajar lagi dan coba lagi!", emoji: "💪", color: "#F59E0B" };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Banner Ucapan */}
        <View style={[styles.headerCard, { backgroundColor: feedback.color }]}>
          <Text style={styles.bigEmoji}>{feedback.emoji}</Text>
          <Text style={styles.titleText}>{feedback.title}</Text>
          <Text style={styles.subTitleText}>{feedback.sub}</Text>
        </View>

        {/* Kartu Skor Utama */}
        <View style={styles.scoreSection}>
          <View style={styles.mainScoreCircle}>
            <Text style={styles.labelSkor}>SKOR AKHIR</Text>
            <Text style={styles.valueSkor}>{score}</Text>
          </View>
        </View>

        {/* Statistik Detail */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{correct}</Text>
            <Text style={styles.statLabel}>Benar</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>❌</Text>
            <Text style={styles.statNumber}>{wrong}</Text>
            <Text style={styles.statLabel}>Salah</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>✨</Text>
            <Text style={styles.statNumber}>+{xpGained}</Text>
            <Text style={styles.statLabel}>Exp</Text>
          </View>
        </View>

        {/* Tombol Navigasi */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#16A34A' }]}
            onPress={() => router.replace('/pages/game/game_home')}
          >
            <Text style={styles.btnText}>SELESAI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnRetry}
            onPress={() => router.replace('/pages/game/start_game')}
          >
            <Text style={styles.btnRetryText}>Coba Lagi 🔄</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerCard: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 10,
  },
  bigEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
  },
  subTitleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  scoreSection: {
    alignItems: 'center',
    marginTop: -50, // Menumpuk sedikit ke header
  },
  mainScoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 8,
    borderColor: '#F3F4F6',
  },
  labelSkor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  valueSkor: {
    fontSize: 48,
    fontWeight: '900',
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: '30%',
    elevation: 3,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  buttonContainer: {
    paddingHorizontal: 30,
    marginTop: 40,
  },
  btnAction: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  btnRetry: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  btnRetryText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
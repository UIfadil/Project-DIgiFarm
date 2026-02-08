import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MainLayout from '../layout/main_layout';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  return (
    <MainLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#22c55e', '#15803d']} // Gradien lebih deep agar terlihat mewah
          style={styles.header}
        >
          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Selamat datang</Text>
            <Text style={styles.welcomeSubtitle}>Monitor dan edukasi padi anda</Text>
          </View>

          {/* Daily Monitoring Card */}
          <View style={styles.monitoringCard}>
            <TouchableOpacity style={styles.monitoringHeader} activeOpacity={0.7}>
              <Text style={styles.monitoringTitle}>Monitoring Harian</Text>
              {/* Pakai karakter arrow yang lebih tipis atau icon */}
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIconText}>🌡️</Text>
                </View>
                <Text style={styles.statLabel}>Suhu</Text>
                <Text style={styles.statValue}>20°C</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIconText}>☀️</Text>
                </View>
                <Text style={styles.statLabel}>Cuaca</Text>
                <Text style={styles.statValue}>Good</Text>
              </View>

              <View style={styles.statBox}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIconText}>💧</Text>
                </View>
                <Text style={styles.statLabel}>Kelembapan</Text>
                <Text style={styles.statValue}>75%</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fitur Utama</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Lihat Semua</Text></TouchableOpacity>
          </View>

          {/* Feature Grid
          <View style={styles.featureGrid}>
            {[
              { label: 'Game', emoji: '🎮', color: '#DCFCE7' },
              { label: 'Scan AI', emoji: '📸', color: '#DCFCE7' },
              { label: 'Edukasi', emoji: '📚', color: '#DCFCE7' },
              { label: 'Lainnya', emoji: '📋', color: '#DCFCE7' },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.featureItem} activeOpacity={0.8}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.featureLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View> */}

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            <TouchableOpacity
              style={styles.featureItem}
              onPress={() => router.push('/pages/game/game_home')} // Tambahkan ini
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎮</Text>
              </View>
              <Text style={styles.featureLabel}>Game</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureItem} 
              onPress={() => router.push('/pages/scanAI/scanAI_home')} // Tambahkan ini
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📸</Text>
              </View>
              <Text style={styles.featureLabel}>Scan AI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureItem} 
              onPress={() => router.push('/pages/edukasi/edukasi_home')} // Tambahkan ini
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📚</Text>
              </View>
              <Text style={styles.featureLabel}>Edukasi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.featureItem} 
              onPress={() => router.push('/pages/edukasi/edukasi_home')} // Tambahkan ini
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📋</Text>
              </View>
              <Text style={styles.featureLabel}>Lainnya</Text>
            </TouchableOpacity>
          </View>



          {/* Quiz Card */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={styles.quizCard}
            // Tambahkan baris navigasi di bawah ini
            onPress={() => router.push('/pages/game/game_home')}
          >
            <View style={styles.quizContent}>
              <View style={styles.quizTextContainer}>
                <Text style={styles.quizTitle}>Kuis Pertanian</Text>
                <Text style={styles.quizSubtitle}>
                  Uji pengetahuan anda terkait budidaya padi
                </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Background abu-abu sangat muda agar card terlihat kontras
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800', // Lebih tebal agar menonjol
    color: 'white',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#F0FDF4',
    opacity: 0.9,
  },
  monitoringCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparansi kaca (Glassmorphism)
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  monitoringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monitoringTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  arrow: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    width: (width - 110) / 3, // Kalkulasi otomatis agar responsif
    backgroundColor: 'white',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    // Shadow untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Shadow untuk Android
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 5,
  },
  statIconText: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
  },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureItem: {
    alignItems: 'center',
    width: width * 0.18,
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#22c55e',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  featureEmoji: {
    fontSize: 28,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  quizCard: {
    backgroundColor: '#16A34A',
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#16A34A',
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  quizContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quizTextContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
  },
  quizSubtitle: {
    fontSize: 13,
    color: '#DCFCE7',
    lineHeight: 18,
  },
  quizIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 10,
    marginLeft: 10,
  },
  quizIcon: {
    fontSize: 28,
  },
  quizButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  playIcon: {
    fontSize: 12,
    color: '#16A34A',
    marginRight: 8,
  },
  quizButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
});
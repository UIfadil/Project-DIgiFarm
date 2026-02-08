import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ImageBackground 
} from 'react-native';
import { useRouter } from 'expo-router';
import MainLayout from '../../layout/main_layout';

export default function LobbyGameKuis() {
  const router = useRouter();

  // Data Kategori Kuis
  const CATEGORIES = [
    { id: '1', title: 'Dasar Padi', icon: '🌱', xp: '100 XP', color: '#16A34A' },
    { id: '2', title: 'Hama & Penyakit', icon: '🐛', xp: '150 XP', color: '#EF4444' },
    { id: '3', title: 'Pupuk & Nutrisi', icon: '🧪', xp: '120 XP', color: '#3B82F6' },
    { id: '4', title: 'Masa Panen', icon: '🌾', xp: '200 XP', color: '#F59E0B' },
  ];

  return (
    <MainLayout>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Padi Quiz Master</Text>
            <Text style={styles.subtitleText}>Uji pengetahuan tanimu!</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Player Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.playerInfo}>
              <View style={styles.avatarWrapper}>
                <Text style={styles.avatarEmoji}>👨‍🌾</Text>
              </View>
              <View>
                <Text style={styles.playerName}>Petani Pro</Text>
                <Text style={styles.playerLevel}>Level 5 • Master Padi</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>1,240</Text>
                <Text style={styles.statLabel}>Total XP</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Win Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>#4</Text>
                <Text style={styles.statLabel}>Ranking</Text>
              </View>
            </View>
          </View>

          {/* Banner Main Cepat */}
          <TouchableOpacity 
            style={styles.playBanner}
            activeOpacity={0.9}
            onPress={() => router.push('/pages/game/start_game')}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Main Cepat!</Text>
              <Text style={styles.bannerSub}>Campuran semua materi</Text>
              <View style={styles.playButtonMini}>
                <Text style={styles.playButtonText}>MULAI SEKARANG</Text>
              </View>
            </View>
            <Text style={styles.bannerEmoji}>⚡</Text>
          </TouchableOpacity>

          {/* Kategori Kuis */}
          <Text style={styles.sectionTitle}>Pilih Kategori</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCard}
                activeOpacity={0.8}
                // SISTEM NAVIGASI: Mengarah ke app/pages/game/start_game.tsx
                onPress={() => router.push({
                  pathname: '/pages/game/start_game',
                  params: { 
                    categoryId: cat.id, 
                    categoryTitle: cat.title 
                  }
                })}
              >
                <View style={[styles.catIconWrapper, { backgroundColor: cat.color + '20' }]}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.catTitle}>{cat.title}</Text>
                <Text style={[styles.catXP, { color: cat.color }]}>{cat.xp}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Leaderboard Shortcut */}
          <TouchableOpacity style={styles.leaderboardBtn}>
            <Text style={styles.lbIcon}>🏆</Text>
            <Text style={styles.lbText}>Lihat Papan Peringkat</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#16A34A',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 28, color: 'white', fontWeight: 'bold' },
  titleContainer: { marginLeft: 15 },
  titleText: { fontSize: 20, fontWeight: '900', color: '#16A34A' },
  subtitleText: { fontSize: 13, color: '#6B7280' },
  
  scrollContent: { paddingBottom: 30 },

  /* Stats Card */
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    elevation: 8,
    shadowColor: '#16A34A',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    marginBottom: 20,
  },
  playerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarWrapper: {
    width: 50,
    height: 50,
    backgroundColor: '#F0FDF4',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  avatarEmoji: { fontSize: 25 },
  playerName: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  playerLevel: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 15 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#16A34A' },
  statLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase' },

  /* Play Banner */
  playBanner: {
    backgroundColor: '#16A34A',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    overflow: 'hidden',
  },
  bannerContent: { flex: 1 },
  bannerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  bannerSub: { color: '#DCFCE7', fontSize: 12, marginBottom: 10 },
  playButtonMini: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  playButtonText: { color: '#16A34A', fontWeight: '800', fontSize: 10 },
  bannerEmoji: { fontSize: 60, opacity: 0.3, position: 'absolute', right: -10 },

  /* Categories Grid */
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  catIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  catIcon: { fontSize: 24 },
  catTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
  catXP: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  /* Leaderboard Button */
  leaderboardBtn: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  lbIcon: { fontSize: 20, marginRight: 10 },
  lbText: { flex: 1, fontWeight: 'bold', color: '#92400E' },
  chevron: { fontSize: 20, color: '#F59E0B', fontWeight: 'bold' },
});
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EndGame() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Ambil data dari params yang dikirim start_game
    const skor        = parseInt(params.skor as string) || 0;
    const jumlahBenar = parseInt(params.jumlah_benar as string) || 0;
    const jumlahSalah = parseInt(params.jumlah_salah as string) || 0;
    const expDidapat  = parseInt(params.exp_didapat as string) || 0;

    const isGoodScore = skor >= 70;
    const feedback = isGoodScore
        ? { title: 'Luar Biasa!',     sub: 'Kamu benar-benar master padi!',      emoji: '🏆', color: '#16A34A' }
        : { title: 'Tetap Semangat!', sub: 'Ayo belajar lagi dan coba lagi!',     emoji: '💪', color: '#F59E0B' };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Banner Ucapan */}
                <View style={[styles.headerCard, { backgroundColor: feedback.color }]}>
                    <Text style={styles.bigEmoji}>{feedback.emoji}</Text>
                    <Text style={styles.titleText}>{feedback.title}</Text>
                    <Text style={styles.subTitleText}>{feedback.sub}</Text>
                </View>

                {/* Lingkaran Skor */}
                <View style={styles.scoreSection}>
                    <View style={styles.mainScoreCircle}>
                        <Text style={styles.labelSkor}>SKOR AKHIR</Text>
                        <Text style={styles.valueSkor}>{skor}</Text>
                        <Text style={styles.maxSkor}>/ 100</Text>
                    </View>
                </View>

                {/* Statistik */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statEmoji}>✅</Text>
                        <Text style={styles.statNumber}>{jumlahBenar}</Text>
                        <Text style={styles.statLabel}>Benar</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statEmoji}>❌</Text>
                        <Text style={styles.statNumber}>{jumlahSalah}</Text>
                        <Text style={styles.statLabel}>Salah</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statEmoji}>✨</Text>
                        <Text style={[styles.statNumber, { color: '#F59E0B' }]}>+{expDidapat}</Text>
                        <Text style={styles.statLabel}>EXP</Text>
                    </View>
                </View>

                {/* Info EXP */}
                <View style={styles.expInfoBox}>
                    <Ionicons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.expInfoText}>
                        Kamu mendapatkan <Text style={{ fontWeight: '800', color: '#F59E0B' }}>+{expDidapat} EXP</Text> dari sesi ini!
                    </Text>
                </View>

                {/* Tombol */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.btnAction, { backgroundColor: '#16A34A' }]}
                        onPress={() => router.replace('/pages/game/game_home')}
                    >
                        <Ionicons name="home-outline" size={18} color="white" />
                        <Text style={styles.btnText}>KEMBALI KE LOBBY</Text>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                        style={styles.btnRetry}
                        onPress={() => router.replace('/pages/game/start_game')}
                    >
                        <Text style={styles.btnRetryText}>Coba Lagi 🔄</Text>
                    </TouchableOpacity> */}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContent: { paddingBottom: 40 },

    headerCard: { padding: 40, alignItems: 'center', borderBottomLeftRadius: 50, borderBottomRightRadius: 50, elevation: 10 },
    bigEmoji: { fontSize: 80, marginBottom: 10 },
    titleText: { fontSize: 32, fontWeight: '900', color: 'white', textAlign: 'center' },
    subTitleText: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 5 },

    scoreSection: { alignItems: 'center', marginTop: -50 },
    mainScoreCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 8, borderColor: '#F3F4F6' },
    labelSkor: { fontSize: 11, fontWeight: 'bold', color: '#9CA3AF' },
    valueSkor: { fontSize: 48, fontWeight: '900', color: '#374151' },
    maxSkor: { fontSize: 12, color: '#9CA3AF' },

    statsContainer: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30, paddingHorizontal: 20 },
    statBox: { backgroundColor: 'white', padding: 20, borderRadius: 25, alignItems: 'center', width: '30%', elevation: 3 },
    statEmoji: { fontSize: 24, marginBottom: 5 },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
    statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

    expInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, backgroundColor: '#FFFBEB', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#F59E0B' },
    expInfoText: { flex: 1, fontSize: 13, color: '#92400E' },

    buttonContainer: { paddingHorizontal: 30, marginTop: 30 },
    btnAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, borderRadius: 20, elevation: 5 },
    btnText: { color: 'white', fontSize: 16, fontWeight: '900' },
    btnRetry: { marginTop: 15, padding: 10, alignItems: 'center' },
    btnRetryText: { color: '#6B7280', fontSize: 16, fontWeight: 'bold' },
});
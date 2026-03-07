import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
    Image // ✅ tambah
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MainLayout from '../../layout/main_layout';
import api from '../../services/api';

interface ProfilExp {
    user_id: number;
    nama: string;
    total_exp: number;
    level: number;
    nama_level: string;
    progress_pct: number;
    exp_level_ini: number;
    exp_level_next: number;
}

// ✅ tambah interface
interface UserProfil {
    foto_profil_url: string | null;
}

const LEVEL_ICON: Record<number, string> = {
    1: '🌱', 2: '📖', 3: '⚡', 4: '🔥', 5: '👑',
};

const KATEGORI_LIST = [
    { key: 'hama',            label: 'Hama',            icon: '🐛', color: '#EF4444', desc: 'Hama tanaman padi' },
    { key: 'penyakit',        label: 'Penyakit',         icon: '🍂', color: '#F59E0B', desc: 'Penyakit tanaman padi' },
    { key: 'pertanian_dasar', label: 'Pertanian Dasar',  icon: '🌾', color: '#16A34A', desc: 'Dasar-dasar pertanian padi' },
];

export default function LobbyGameKuis() {
    const router = useRouter();
    const [profil, setProfil] = useState<ProfilExp | null>(null);
    const [loading, setLoading] = useState(true);
    const [userProfil, setUserProfil] = useState<UserProfil | null>(null); // ✅ tambah

    const fetchProfil = async () => {
        try {
            const res = await api.get('/kuis/profil-exp');
            setProfil(res.data);
        } catch {
            // biarkan null
        } finally {
            setLoading(false);
        }
    };

    // ✅ tambah fetch foto profil
    const fetchUserProfil = async () => {
        try {
            const res = await api.get('/profil');
            setUserProfil(res.data);
        } catch {
            // fallback ke emoji
        }
    };

    useEffect(() => {
        fetchProfil();
        fetchUserProfil(); // ✅ panggil bersamaan
    }, []);

    const handleMain = (kategori: string) => {
        router.push({
            pathname: '/pages/game/start_game',
            params: { kategori }
        });
    };

    return (
        <MainLayout>
            <View style={styles.container}>

                {/* HEADER */}
                <View style={styles.headerWrapper}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/pages/dashboard')}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>Padi Quiz Master</Text>
                        <Text style={styles.subtitleText}>Uji pengetahuan tanimu!</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* STATS CARD */}
                    {loading ? (
                        <View style={[styles.statsCard, { alignItems: 'center', paddingVertical: 30 }]}>
                            <ActivityIndicator color="#16A34A" />
                        </View>
                    ) : (
                        <View style={styles.statsCard}>
                            {/* Player info */}
                            <View style={styles.playerInfo}>
                                {/* ✅ Avatar: foto profil atau fallback emoji */}
                                <View style={styles.avatarWrapper}>
                                    {userProfil?.foto_profil_url ? (
                                        <Image
                                            source={{ uri: userProfil.foto_profil_url }}
                                            style={styles.avatarImage}
                                        />
                                    ) : (
                                        <Text style={styles.avatarEmoji}>
                                            {LEVEL_ICON[profil?.level ?? 1]}
                                        </Text>
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.playerName}>{profil?.nama ?? 'Petani'}</Text>
                                    <Text style={styles.playerLevel}>
                                        Level {profil?.level ?? 1} • {profil?.nama_level ?? 'Pemula'}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar ke level berikutnya */}
                            {(profil?.level ?? 1) < 5 && (
                                <View style={styles.progressSection}>
                                    <View style={styles.progressLabelRow}>
                                        <Text style={styles.progressLabel}>
                                            Menuju Level {(profil?.level ?? 1) + 1}
                                        </Text>
                                        <Text style={styles.progressPct}>{profil?.progress_pct ?? 0}%</Text>
                                    </View>
                                    <View style={styles.progressBg}>
                                        <View style={[styles.progressFill, { width: `${profil?.progress_pct ?? 0}%` }]} />
                                    </View>
                                    <Text style={styles.progressExp}>
                                        {profil?.total_exp ?? 0} / {profil?.exp_level_next ?? 100} EXP
                                    </Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            {/* Stat boxes */}
                            <View style={styles.scoreRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{profil?.total_exp ?? 0}</Text>
                                    <Text style={styles.statLabel}>Total EXP</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{profil?.level ?? 1}</Text>
                                    <Text style={styles.statLabel}>Level</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Text style={styles.statValue}>{profil?.nama_level ?? 'Pemula'}</Text>
                                    <Text style={styles.statLabel}>Gelar</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* BANNER MAIN CEPAT */}
                    <TouchableOpacity
                        style={styles.playBanner}
                        activeOpacity={0.9}
                        onPress={() => handleMain('semua')}
                    >
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>Main Cepat! ⚡</Text>
                            <Text style={styles.bannerSub}>Campuran semua kategori</Text>
                            <View style={styles.playButtonMini}>
                                <Text style={styles.playButtonText}>MULAI SEKARANG</Text>
                            </View>
                        </View>
                        <Text style={styles.bannerEmoji}>⚡</Text>
                    </TouchableOpacity>

                    {/* PILIH KATEGORI */}
                    <Text style={styles.sectionTitle}>Pilih Kategori</Text>
                    <View style={styles.categoryGrid}>
                        {KATEGORI_LIST.map((cat) => (
                            <TouchableOpacity
                                key={cat.key}
                                style={styles.categoryCard}
                                activeOpacity={0.8}
                                onPress={() => handleMain(cat.key)}
                            >
                                <View style={[styles.catIconWrapper, { backgroundColor: cat.color + '20' }]}>
                                    <Text style={styles.catIcon}>{cat.icon}</Text>
                                </View>
                                <Text style={styles.catTitle}>{cat.label}</Text>
                                <Text style={[styles.catDesc, { color: cat.color }]}>{cat.desc}</Text>
                                <View style={[styles.catPlayBtn, { backgroundColor: cat.color }]}>
                                    <Text style={styles.catPlayBtnText}>Main</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* PAPAN PERINGKAT */}
                    <TouchableOpacity
                        style={styles.leaderboardBtn}
                        onPress={() => router.push('/pages/game/papan_ranking')}
                    >
                        <Text style={styles.lbIcon}>🏆</Text>
                        <Text style={styles.lbText}>Lihat Papan Peringkat</Text>
                        <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 15, paddingTop: 10 },

    headerWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { backgroundColor: '#16A34A', width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    titleContainer: { marginLeft: 15 },
    titleText: { fontSize: 20, fontWeight: '900', color: '#16A34A' },
    subtitleText: { fontSize: 13, color: '#6B7280' },

    scrollContent: { paddingBottom: 30 },

    statsCard: { backgroundColor: 'white', borderRadius: 25, padding: 20, elevation: 8, shadowColor: '#16A34A', shadowOpacity: 0.1, shadowRadius: 15, marginBottom: 20 },
    playerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

    // ✅ overflow hidden agar foto terpotong rapi
    avatarWrapper: { width: 50, height: 50, backgroundColor: '#F0FDF4', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 2, borderColor: '#86EFAC', overflow: 'hidden' },
    avatarEmoji: { fontSize: 24 },
    avatarImage: { width: 50, height: 50, borderRadius: 25 }, // ✅ tambah

    playerName: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    playerLevel: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

    progressSection: { marginBottom: 12 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressLabel: { fontSize: 11, color: '#6B7280' },
    progressPct: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
    progressBg: { height: 8, backgroundColor: '#DCFCE7', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#16A34A', borderRadius: 4 },
    progressExp: { fontSize: 10, color: '#9CA3AF', marginTop: 3, textAlign: 'right' },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 15, fontWeight: 'bold', color: '#16A34A' },
    statLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', marginTop: 2 },

    playBanner: { backgroundColor: '#16A34A', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25, overflow: 'hidden' },
    bannerContent: { flex: 1 },
    bannerTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
    bannerSub: { color: '#DCFCE7', fontSize: 12, marginBottom: 10 },
    playButtonMini: { backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start' },
    playButtonText: { color: '#16A34A', fontWeight: '800', fontSize: 10 },
    bannerEmoji: { fontSize: 60, opacity: 0.3, position: 'absolute', right: -10 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
    categoryCard: { backgroundColor: 'white', width: '48%', padding: 16, borderRadius: 20, alignItems: 'center', elevation: 3 },
    catIconWrapper: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    catIcon: { fontSize: 24 },
    catTitle: { fontSize: 14, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
    catDesc: { fontSize: 10, textAlign: 'center', marginTop: 4, marginBottom: 10 },
    catPlayBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10 },
    catPlayBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },

    leaderboardBtn: { flexDirection: 'row', backgroundColor: '#FEF3C7', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#F59E0B' },
    lbIcon: { fontSize: 20, marginRight: 10 },
    lbText: { flex: 1, fontWeight: 'bold', color: '#92400E' },
});
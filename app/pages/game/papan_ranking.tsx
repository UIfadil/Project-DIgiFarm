import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import api from '../../services/api';

interface RankingUser {
    rank: number;
    user_id: number;
    nama: string;
    total_exp: number;
    level: number;
    nama_level: string;
}

const LEVEL_CONFIG: Record<number, { color: string; bg: string; icon: string }> = {
    1: { color: '#6B7280', bg: '#F3F4F6', icon: '🌱' },
    2: { color: '#3B82F6', bg: '#EFF6FF', icon: '📖' },
    3: { color: '#8B5CF6', bg: '#F5F3FF', icon: '⚡' },
    4: { color: '#F59E0B', bg: '#FFFBEB', icon: '🔥' },
    5: { color: '#16A34A', bg: '#F0FDF4', icon: '👑' },
};

const RANK_MEDAL: Record<number, string> = {
    1: '🥇', 2: '🥈', 3: '🥉',
};

export default function PapanRanking() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [rankings, setRankings] = useState<RankingUser[]>([]);
    const [myRank, setMyRank] = useState<RankingUser | null>(null);

    const fetchRanking = async () => {
        try {
            setLoading(true);
            const res = await api.get('/kuis/ranking');
            setRankings(res.data.ranking);
            setMyRank(res.data.my_rank);
        } catch {
            // fallback kosong
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRanking(); }, []);

    const top3 = rankings.slice(0, 3);

    const renderPodium = () => {
        const order = [top3[1], top3[0], top3[2]];
        const heights = [100, 130, 80];
        const sizes = [52, 64, 48];
        const realRanks = [2, 1, 3];

        return (
            <View style={styles.podiumWrapper}>
                {order.map((user, i) => {
                    if (!user) return <View key={`podium-empty-${i}`} style={{ flex: 1 }} />;
                    const realRank = realRanks[i];
                    const lvl = LEVEL_CONFIG[user.level] || LEVEL_CONFIG[1];
                    const barColor = realRank === 1 ? '#F59E0B' : realRank === 2 ? '#9CA3AF' : '#CD7C2F';
                    return (
                        // ✅ key pakai prefix podium- agar tidak bentrok dengan list
                        <View key={`podium-${user.user_id}`} style={styles.podiumItem}>
                            <View style={[styles.podiumAvatar, {
                                width: sizes[i], height: sizes[i],
                                borderRadius: sizes[i] / 2,
                                borderColor: barColor,
                            }]}>
                                <Text style={{ fontSize: sizes[i] * 0.45 }}>👨‍🌾</Text>
                            </View>
                            <Text style={styles.podiumMedal}>{RANK_MEDAL[realRank]}</Text>
                            <Text style={styles.podiumName} numberOfLines={1}>{user.nama}</Text>
                            <Text style={styles.podiumExp}>{user.total_exp} EXP</Text>
                            <View style={[styles.podiumBar, { height: heights[i], backgroundColor: barColor }]}>
                                <Text style={styles.podiumRankNum}>#{realRank}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    // ✅ Tambah param prefix untuk bedakan key di "Posisi Kamu" vs list
    const renderRankRow = (user: RankingUser, index: number, keyPrefix: string = 'list') => {
        const lvl = LEVEL_CONFIG[user.level] || LEVEL_CONFIG[1];
        const isMe = myRank?.user_id === user.user_id;

        return (
            // ✅ key pakai prefix sehingga tidak duplikat
            <View key={`${keyPrefix}-${user.user_id}`}
                style={[styles.rankRow, index % 2 === 0 && styles.rankRowEven, isMe && styles.rankRowMe]}>

                <View style={styles.rankNoBox}>
                    <Text style={[styles.rankNo, isMe && { color: '#16A34A' }]}>#{user.rank}</Text>
                </View>

                <View style={[styles.rankAvatar, { backgroundColor: lvl.bg, borderColor: lvl.color }]}>
                    <Text style={{ fontSize: 18 }}>👨‍🌾</Text>
                </View>

                <View style={{ flex: 1 }}>
                    <View style={styles.rankNameRow}>
                        <Text style={[styles.rankName, isMe && { color: '#16A34A' }]} numberOfLines={1}>
                            {user.nama}
                        </Text>
                        {isMe && (
                            <View style={styles.meBadge}>
                                <Text style={styles.meBadgeText}>Kamu</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.rankLevelRow}>
                        <Text style={{ fontSize: 11 }}>{lvl.icon}</Text>
                        <Text style={[styles.rankLevel, { color: lvl.color }]}>{user.nama_level}</Text>
                    </View>
                </View>

                <View style={styles.rankExpBox}>
                    <Text style={[styles.rankExpValue, { color: lvl.color }]}>{user.total_exp}</Text>
                    <Text style={styles.rankExpLabel}>EXP</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>🏆 Papan Peringkat</Text>
                    <Text style={styles.headerSub}>Ranking berdasarkan total EXP</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text style={styles.loadingText}>Memuat peringkat...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* PODIUM TOP 3 */}
                    {top3.length > 0 && (
                        <View style={styles.podiumSection}>
                            {renderPodium()}
                        </View>
                    )}

                    {/* POSISI SAYA jika tidak ada di top 3 */}
                    {myRank && myRank.rank > 3 && (
                        <View style={styles.myRankSection}>
                            <Text style={styles.myRankTitle}>📍 Posisi Kamu</Text>
                            {/* ✅ prefix 'myrank' agar key tidak bentrok dengan list */}
                            {renderRankRow(myRank, 0, 'myrank')}
                        </View>
                    )}

                    {/* LIST SEMUA RANKING */}
                    <View style={styles.listSection}>
                        <Text style={styles.listTitle}>Semua Peringkat</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { width: 40 }]}>Rank</Text>
                            <Text style={[styles.tableHeaderText, { width: 40 }]}></Text>
                            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Nama</Text>
                            <Text style={[styles.tableHeaderText, { width: 60, textAlign: 'right' }]}>EXP</Text>
                        </View>

                        {rankings.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyEmoji}>🌱</Text>
                                <Text style={styles.emptyTitle}>Belum Ada Peringkat</Text>
                                <Text style={styles.emptySub}>Jadilah yang pertama menyelesaikan kuis!</Text>
                            </View>
                        ) : (
                            // ✅ prefix 'list' untuk semua item di list utama
                            rankings.map((user, i) => renderRankRow(user, i, 'list'))
                        )}
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#16A34A' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '900', color: 'white' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

    loadingBox: { alignItems: 'center', marginTop: 80, gap: 12 },
    loadingText: { color: '#9CA3AF', fontSize: 14 },

    podiumSection: { backgroundColor: '#16A34A', paddingBottom: 30, paddingTop: 10 },
    podiumWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20, gap: 8 },
    podiumItem: { alignItems: 'center', flex: 1 },
    podiumAvatar: { backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 3, marginBottom: 4 },
    podiumMedal: { fontSize: 20, marginBottom: 2 },
    podiumName: { fontSize: 11, fontWeight: '700', color: 'white', marginBottom: 2, textAlign: 'center' },
    podiumExp: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
    podiumBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 8 },
    podiumRankNum: { fontSize: 16, fontWeight: '900', color: 'white' },

    myRankSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#F0FDF4', borderRadius: 14, borderWidth: 2, borderColor: '#16A34A', padding: 12 },
    myRankTitle: { fontSize: 13, fontWeight: '700', color: '#16A34A', marginBottom: 8 },

    listSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
    listTitle: { fontSize: 14, fontWeight: '800', color: '#374151', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', paddingHorizontal: 14, paddingVertical: 8 },
    tableHeaderText: { fontSize: 10, fontWeight: '700', color: '#D1D5DB', textTransform: 'uppercase' },

    rankRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', gap: 10 },
    rankRowEven: { backgroundColor: '#FAFAFA' },
    rankRowMe: { backgroundColor: '#F0FDF4' },

    rankNoBox: { width: 40, alignItems: 'center' },
    rankNo: { fontSize: 13, fontWeight: '800', color: '#6B7280' },
    rankAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rankName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
    meBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    meBadgeText: { fontSize: 9, fontWeight: '700', color: '#16A34A' },
    rankLevelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    rankLevel: { fontSize: 11, fontWeight: '600' },
    rankExpBox: { width: 60, alignItems: 'flex-end' },
    rankExpValue: { fontSize: 14, fontWeight: '800' },
    rankExpLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '500' },

    emptyBox: { padding: 40, alignItems: 'center', gap: 8 },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
    emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Image, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MainLayout from '../../layout/main_layout';
import api from '../../services/api';

interface Edukasi {
    id: number;
    nama: string;
    kategori: string;
    deskripsi: string;
    gambar: string;
    solusi: string | null;
    video_edukasi?: { id: number }[];
}

export default function ListEdukasi() {
    const router = useRouter();
    // ✅ Terima kategori & title yang dikirim dari edukasi_home
    const { kategori, title } = useLocalSearchParams<{ kategori: string; title: string }>();

    const [list, setList] = useState<Edukasi[]>([]);
    const [filtered, setFiltered] = useState<Edukasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder teks per kategori (sama seperti versi lama)
    const searchPlaceholder =
        kategori === 'hama'            ? 'Cari hama...' :
        kategori === 'penyakit'        ? 'Cari penyakit padi...' :
        kategori === 'pertanian_dasar' ? 'Cari materi budidaya...' :
        'Cari...';

    const emptyText =
        kategori === 'hama'            ? 'Hama tidak ditemukan 🍃' :
        kategori === 'penyakit'        ? 'Penyakit tidak ditemukan 🍃' :
        'Materi tidak ditemukan 🌾';

    // ── Fetch data dari API ──
    const fetchData = async () => {
        try {
            setLoading(true);
            // GET /api/edukasi?kategori=hama  (atau penyakit / pertanian_dasar)
            const res = await api.get('/edukasi', { params: { kategori } });
            setList(res.data);
            setFiltered(res.data);
        } catch {
            setList([]);
            setFiltered([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [kategori]);

    // ── Filter pencarian lokal ──
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFiltered(list);
        } else {
            setFiltered(
                list.filter(item =>
                    item.nama.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, list]);

    // ── Helper URL gambar dari storage Laravel ──
    const getImageUri = (gambar: string) => {
        if (!gambar) return null;
        if (gambar.startsWith('http')) return gambar;
        return `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/storage/${gambar}`;
    };

    return (
        <MainLayout>
            <View style={styles.container}>

                {/* Header Section — sama persis dengan versi lama */}
                <View style={styles.headerWrapper}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        {/* ✅ Title dinamis dari params */}
                        <Text style={styles.titleText}>{title || 'Edukasi'}</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                </View>

                {/* Green Panel Area */}
                <View style={styles.greenPanel}>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <Text style={styles.searchEmoji}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={searchPlaceholder}
                                placeholderTextColor="#A5D6A7"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {/* ✅ Tombol hapus pencarian */}
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Text style={{ fontSize: 16, color: '#A5D6A7' }}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* List */}
                    {loading ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.loadingText}>Memuat data...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listPadding}
                        >
                            {filtered.length > 0 ? (
                                filtered.map((item) => {
                                    const imgUri = getImageUri(item.gambar);
                                    // Hama & penyakit: tampilan card tanpa deskripsi (seperti list_hama asli)
                                    // Pertanian dasar: tampilan card dengan deskripsi (seperti list_padi asli)
                                    const isPadi = kategori === 'pertanian_dasar';

                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={isPadi ? styles.cardPadi : styles.cardHama}
                                            activeOpacity={0.8}
                                            // ✅ Navigasi ke detail_edukasi, kirim id & nama
                                            onPress={() => router.push({
                                                pathname: '/pages/edukasi/detail_edukasi',
                                                params: { id: item.id, nama: item.nama },
                                            })}
                                        >
                                            <View style={styles.imageWrapper}>
                                                {imgUri ? (
                                                    <Image
                                                        source={{ uri: imgUri }}
                                                        style={isPadi ? styles.imagePadi : styles.imageHama}
                                                    />
                                                ) : (
                                                    <Text style={{ fontSize: 28 }}>
                                                        {kategori === 'hama' ? '🐛' : kategori === 'penyakit' ? '🦠' : '🌾'}
                                                    </Text>
                                                )}
                                            </View>

                                            {isPadi ? (
                                                // Card padi: nama + deskripsi
                                                <View style={styles.textWrapper}>
                                                    <Text style={styles.itemName}>{item.nama}</Text>
                                                    <Text style={styles.itemDesc} numberOfLines={2}>
                                                        {item.deskripsi}
                                                    </Text>
                                                </View>
                                            ) : (
                                                // Card hama/penyakit: nama saja (besar)
                                                <Text style={styles.hamaName}>{item.nama}</Text>
                                            )}

                                            <Text style={styles.chevron}>›</Text>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>{emptyText}</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

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
        marginBottom: 15,
    },
    backButton: {
        backgroundColor: '#86EFAC',
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    backIcon: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
        marginTop: -3,
    },
    titleContainer: {
        marginLeft: 15,
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#16A34A',
    },
    titleUnderline: {
        height: 3,
        backgroundColor: '#16A34A',
        width: 80,
        borderRadius: 2,
        marginTop: 2,
    },
    greenPanel: {
        flex: 1,
        backgroundColor: '#86EFAC',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 15,
    },
    searchContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
        height: 50,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    searchEmoji: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#16A34A',
        fontWeight: '600',
    },
    loadingBox: {
        alignItems: 'center',
        marginTop: 60,
        gap: 12,
    },
    loadingText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    listPadding: {
        paddingBottom: 20,
    },

    // Card hama & penyakit (hanya gambar + nama besar)
    cardHama: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    // Card pertanian dasar (gambar + nama + deskripsi)
    cardPadi: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 5,
    },

    imageWrapper: {
        width: 65,
        height: 65,
        backgroundColor: '#F0FDF4',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        overflow: 'hidden',
    },
    // Gambar hama/penyakit: contain (icon)
    imageHama: {
        width: 45,
        height: 45,
        resizeMode: 'contain',
    },
    // Gambar padi: cover (foto lahan)
    imagePadi: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    // Teks hama/penyakit
    hamaName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#16A34A',
    },

    // Teks padi
    textWrapper: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#16A34A',
    },
    itemDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },

    chevron: {
        fontSize: 24,
        color: '#86EFAC',
        fontWeight: 'bold',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
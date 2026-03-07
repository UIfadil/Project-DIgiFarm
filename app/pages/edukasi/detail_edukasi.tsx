// ============================================================
//  FILE: app/pages/edukasi/detail_edukasi.tsx
//
//  Install dependency:
//    npx expo install react-native-webview expo-video-thumbnails
// ============================================================

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as VideoThumbnails from 'expo-video-thumbnails';
import MainLayout from '../../layout/main_layout';
import api from '../../services/api';

interface VideoEdukasi {
    id: number;
    judul_video: string;
    video: string;
    tipe_video: 'link' | 'file';
    keterangan_video: string | null;
}

interface EdukasiDetail {
    id: number;
    nama: string;
    kategori: string;
    deskripsi: string;
    gambar: string;
    solusi: string | null;
    video_edukasi: VideoEdukasi[];
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getYoutubeVideoId(url: string): string | null {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,
        /youtu\.be\/([^?&]+)/,
        /youtube\.com\/shorts\/([^?&]+)/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

function getYoutubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

// HTML iframe untuk YouTube — fix error 153
function buildYoutubeHtml(videoId: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin:0; padding:0; background:#000; box-sizing:border-box; }
    body { width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; }
    iframe { width:100%; height:100%; border:none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
    allowfullscreen
  ></iframe>
</body>
</html>`;
}

// HTML video player untuk file upload
function buildVideoFileHtml(url: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; background:#000; box-sizing:border-box; }
    body { display:flex; justify-content:center; align-items:center; height:100vh; }
    video { width:100%; height:100%; object-fit:contain; }
  </style>
</head>
<body>
  <video controls autoplay playsinline>
    <source src="${url}" type="video/mp4">
    <source src="${url}" type="video/webm">
  </video>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// Komponen VideoItem
// ─────────────────────────────────────────────────────────────

interface VideoItemProps {
    item: VideoEdukasi;
    index: number;
    total: number;
    baseUrl: string;
}

function VideoItem({ item, index, total, baseUrl }: VideoItemProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbLoading, setThumbLoading] = useState(false);

    const fileUrl = item.video.startsWith('http')
        ? item.video
        : `${baseUrl}/storage/${item.video}`;

    // ✅ Generate thumbnail pakai expo-video-thumbnails (andal, tidak butuh WebView)
    useEffect(() => {
        if (item.tipe_video === 'file') {
            generateThumbnail();
        }
    }, []);

    const generateThumbnail = async () => {
        try {
            setThumbLoading(true);
            const { uri } = await VideoThumbnails.getThumbnailAsync(fileUrl, {
                time: 1000, // ambil frame di detik ke-1 (dalam ms)
                quality: 0.8,
            });
            setThumbnail(uri);
        } catch {
            // Gagal generate thumbnail — fallback ke icon film
            setThumbnail(null);
        } finally {
            setThumbLoading(false);
        }
    };

    // ── Belum diputar: tampilkan thumbnail ──
    if (!isPlaying) {
        return (
            <View style={vstyles.itemWrapper}>
                <Text style={vstyles.title}>{index + 1}. {item.judul_video}</Text>

                <TouchableOpacity
                    style={vstyles.thumbnailBox}
                    activeOpacity={0.85}
                    onPress={() => setIsPlaying(true)}
                >
                    {item.tipe_video === 'link' ? (
                        // ── YouTube: thumbnail dari CDN ──
                        (() => {
                            const videoId = getYoutubeVideoId(item.video);
                            return videoId ? (
                                <Image
                                    source={{ uri: getYoutubeThumbnail(videoId) }}
                                    style={vstyles.thumbnailImg}
                                    resizeMode="cover"
                                />
                            ) : (
                                // Link non-YouTube: fallback gelap
                                <View style={vstyles.thumbFallback}>
                                    <Text style={vstyles.thumbFallbackEmoji}>🔗</Text>
                                </View>
                            );
                        })()
                    ) : (
                        // ── File upload: thumbnail dari expo-video-thumbnails ──
                        thumbLoading ? (
                            <View style={vstyles.thumbFallback}>
                                <ActivityIndicator color="white" />
                            </View>
                        ) : thumbnail ? (
                            <Image
                                source={{ uri: thumbnail }}
                                style={vstyles.thumbnailImg}
                                resizeMode="cover"
                            />
                        ) : (
                            // Fallback kalau generate gagal
                            <View style={vstyles.thumbFallback}>
                                <Text style={vstyles.thumbFallbackEmoji}>🎬</Text>
                            </View>
                        )
                    )}

                    {/* Overlay play button di atas thumbnail */}
                    <View style={vstyles.overlay}>
                        <View style={vstyles.playBtn}>
                            <Text style={vstyles.playIcon}>▶</Text>
                        </View>
                        <View style={vstyles.labelPill}>
                            <Text style={vstyles.labelText}>
                                {item.tipe_video === 'link' ? '▶  YouTube' : '▶  Video Upload'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {item.keterangan_video
                    ? <VideoDesc text={item.keterangan_video} />
                    : null}
                {index !== total - 1 && <View style={vstyles.separator} />}
            </View>
        );
    }

    // ── Sedang diputar: WebView inline ──
    const isYoutube = item.tipe_video === 'link';
    const videoId = isYoutube ? getYoutubeVideoId(item.video) : null;

    return (
        <View style={vstyles.itemWrapper}>
            <Text style={vstyles.title}>{index + 1}. {item.judul_video}</Text>

            <View style={vstyles.playerBox}>
                <WebView
                    source={{
                        html: isYoutube && videoId
                            ? buildYoutubeHtml(videoId)
                            : isYoutube
                                ? buildVideoFileHtml(item.video) // link non-YT
                                : buildVideoFileHtml(fileUrl),   // file upload
                    }}
                    style={vstyles.webview}
                    allowsFullscreenVideo
                    javaScriptEnabled
                    domStorageEnabled
                    mediaPlaybackRequiresUserAction={false}
                    originWhitelist={['*']}
                />
                <TouchableOpacity
                    style={vstyles.closeBtn}
                    onPress={() => setIsPlaying(false)}
                >
                    <Text style={vstyles.closeBtnText}>✕  Tutup Video</Text>
                </TouchableOpacity>
            </View>

            {item.keterangan_video
                ? <VideoDesc text={item.keterangan_video} />
                : null}
            {index !== total - 1 && <View style={vstyles.separator} />}
        </View>
    );
}

function VideoDesc({ text }: { text: string }) {
    return (
        <View style={vstyles.descBox}>
            <Text style={vstyles.descTitle}>Keterangan:</Text>
            <Text style={vstyles.descText}>{text}</Text>
        </View>
    );
}

const vstyles = StyleSheet.create({
    itemWrapper: { marginBottom: 28 },

    title: {
        fontSize: 15, fontWeight: 'bold', color: '#15803D',
        alignSelf: 'flex-start', marginBottom: 10,
        backgroundColor: 'white', paddingHorizontal: 14,
        paddingVertical: 6, borderRadius: 10, elevation: 2,
    },

    // Kotak thumbnail — ukuran tetap, rapi
    thumbnailBox: {
        width: '100%', height: 210,
        borderRadius: 20, overflow: 'hidden',
        elevation: 8, borderWidth: 3, borderColor: 'white',
    },
    thumbnailImg: { width: '100%', height: '100%' },

    // Fallback saat thumbnail belum ada / gagal
    thumbFallback: {
        width: '100%', height: '100%',
        backgroundColor: '#1F2937',
        justifyContent: 'center', alignItems: 'center',
    },
    thumbFallbackEmoji: { fontSize: 48 },

    // Overlay gelap di atas thumbnail
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.30)',
        justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    playBtn: {
        width: 64, height: 64,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 32,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    },
    playIcon: { color: 'white', fontSize: 26, marginLeft: 5 },
    labelPill: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
    },
    labelText: { color: 'white', fontSize: 12, fontWeight: '700' },

    // WebView player
    playerBox: {
        width: '100%', borderRadius: 20,
        overflow: 'hidden', elevation: 8,
        borderWidth: 3, borderColor: 'white',
    },
    webview: { width: '100%', height: 220 },
    closeBtn: {
        backgroundColor: '#111827',
        paddingVertical: 10, alignItems: 'center',
    },
    closeBtnText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '600' },

    descBox: {
        backgroundColor: 'white', borderRadius: 16,
        padding: 14, marginTop: 12, elevation: 3,
    },
    descTitle: { fontSize: 13, fontWeight: 'bold', color: '#16A34A', marginBottom: 4 },
    descText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

    separator: {
        height: 2, backgroundColor: 'rgba(255,255,255,0.3)',
        marginTop: 20, width: '50%', alignSelf: 'center',
    },
});

// ─────────────────────────────────────────────────────────────
// Halaman utama
// ─────────────────────────────────────────────────────────────

export default function DetailEdukasi() {
    const router = useRouter();
    const { id, nama } = useLocalSearchParams<{ id: string; nama: string }>();

    const [mode, setMode] = useState<'buku' | 'video'>('buku');
    const [data, setData] = useState<EdukasiDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') ?? '';

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/edukasi/${id}`);
            setData(res.data);
        } catch {
            Alert.alert('Error', 'Gagal memuat detail edukasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchDetail(); }, [id]);

    const getImageUri = (gambar: string) => {
        if (!gambar) return null;
        if (gambar.startsWith('http')) return gambar;
        return `${baseUrl}/storage/${gambar}`;
    };

    return (
        <MainLayout>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.headerWrapper}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText} numberOfLines={1}>
                            {data?.nama || nama || 'Detail'}
                        </Text>
                        <View style={styles.titleUnderline} />
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#16A34A" />
                        <Text style={styles.loadingText}>Memuat materi...</Text>
                    </View>
                ) : (
                    <>
                        {/* Toggle */}
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, mode === 'buku' && styles.toggleActive]}
                                onPress={() => setMode('buku')}
                            >
                                <Text style={[styles.toggleText, mode === 'buku' && styles.textActive]}>
                                    📖 Materi
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, mode === 'video' && styles.toggleActive]}
                                onPress={() => setMode('video')}
                            >
                                <Text style={[styles.toggleText, mode === 'video' && styles.textActive]}>
                                    🎥 Video{(data?.video_edukasi?.length ?? 0) > 0
                                        ? ` (${data!.video_edukasi.length})`
                                        : ''}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Panel konten */}
                        <View style={styles.contentPanel}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {/* ── MATERI ── */}
                                {mode === 'buku' && (
                                    <View style={styles.bookPage}>
                                        <View style={styles.imageHeaderWrapper}>
                                            {data?.gambar ? (
                                                <Image
                                                    source={{ uri: getImageUri(data.gambar)! }}
                                                    style={styles.hamaImage}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Text style={{ fontSize: 60 }}>🌿</Text>
                                            )}
                                        </View>
                                        <Text style={styles.chapterTitle}>Mengenal {data?.nama}</Text>
                                        <Text style={styles.paragraph}>{data?.deskripsi}</Text>
                                        {data?.solusi ? (
                                            <>
                                                <View style={styles.divider} />
                                                <Text style={styles.subTitle}>Cara Penanganan:</Text>
                                                <View style={styles.listContainer}>
                                                    {data.solusi.split('\n').map((baris, i) =>
                                                        baris.trim() ? (
                                                            <Text key={i} style={styles.listItem}>
                                                                {baris.trim().startsWith('•')
                                                                    ? baris.trim()
                                                                    : `• ${baris.trim()}`}
                                                            </Text>
                                                        ) : null
                                                    )}
                                                </View>
                                            </>
                                        ) : null}
                                    </View>
                                )}

                                {/* ── VIDEO ── */}
                                {mode === 'video' && (
                                    <View>
                                        {(data?.video_edukasi?.length ?? 0) === 0 ? (
                                            <View style={styles.emptyVideo}>
                                                <Text style={{ fontSize: 48 }}>🎬</Text>
                                                <Text style={styles.emptyVideoText}>
                                                    Belum ada video untuk materi ini
                                                </Text>
                                            </View>
                                        ) : (
                                            data!.video_edukasi.map((item, index) => (
                                                <VideoItem
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    total={data!.video_edukasi.length}
                                                    baseUrl={baseUrl}
                                                />
                                            ))
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </>
                )}
            </View>
        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 10 },
    headerWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    backButton: { backgroundColor: '#86EFAC', width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    backIcon: { fontSize: 30, color: 'white', fontWeight: 'bold' },
    titleContainer: { marginLeft: 15, flex: 1 },
    titleText: { fontSize: 22, fontWeight: 'bold', color: '#16A34A' },
    titleUnderline: { height: 3, backgroundColor: '#16A34A', width: 60, marginTop: 2 },
    loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { color: '#6B7280', fontSize: 14 },
    toggleContainer: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 20, borderRadius: 15, padding: 5, marginBottom: 20, elevation: 2 },
    toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    toggleActive: { backgroundColor: '#16A34A' },
    toggleText: { fontWeight: 'bold', color: '#9CA3AF', fontSize: 14 },
    textActive: { color: 'white' },
    contentPanel: { flex: 1, backgroundColor: '#86EFAC', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, paddingTop: 25 },
    scrollContent: { paddingBottom: 40 },
    bookPage: { backgroundColor: 'white', borderRadius: 25, padding: 20, elevation: 4 },
    imageHeaderWrapper: { width: '100%', height: 180, backgroundColor: '#F0FDF4', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#DCFCE7' },
    hamaImage: { width: 120, height: 120 },
    chapterTitle: { fontSize: 22, fontWeight: 'bold', color: '#16A34A', marginBottom: 12 },
    paragraph: { fontSize: 15, color: '#4B5563', lineHeight: 24, textAlign: 'justify' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
    subTitle: { fontSize: 17, fontWeight: 'bold', color: '#15803D', marginBottom: 10 },
    listContainer: { paddingLeft: 5 },
    listItem: { fontSize: 15, color: '#4B5563', marginBottom: 8, lineHeight: 22 },
    emptyVideo: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyVideoText: { color: 'white', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
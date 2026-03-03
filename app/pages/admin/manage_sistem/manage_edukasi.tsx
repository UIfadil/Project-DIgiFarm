import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView,
    Alert, Image, Modal, TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VideoEdukasi {
    id: number;
    edukasi_id: number;
    judul_video: string;
    video: string;
    tipe_video: 'link' | 'file';
    keterangan_video: string | null;
}

interface Edukasi {
    id: number;
    nama: string;
    // ✅ Tambah pertanian_dasar
    kategori: 'hama' | 'penyakit' | 'pertanian_dasar';
    deskripsi: string;
    gambar: string;
    solusi: string | null;
    video_edukasi?: VideoEdukasi[];
}

type ModalType = 'edukasi' | 'video' | null;

// ✅ Helper: ambil warna badge berdasarkan kategori
const getBadgeStyle = (kategori: string) => {
    switch (kategori) {
        case 'hama':
            return { bg: '#FEE2E2', dot: '#EF4444', text: '#991B1B', label: 'Hama' };
        case 'penyakit':
            return { bg: '#DCFCE7', dot: '#16A34A', text: '#166534', label: 'Penyakit' };
        case 'pertanian_dasar':
            return { bg: '#FEF9C3', dot: '#CA8A04', text: '#854D0E', label: 'Pertanian' };
        default:
            return { bg: '#F3F4F6', dot: '#9CA3AF', text: '#374151', label: kategori };
    }
};

export default function ManageEdukasi() {
    const router = useRouter();
    const [list, setList] = useState<Edukasi[]>([]);
    const [filtered, setFiltered] = useState<Edukasi[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Modal
    const [modalType, setModalType] = useState<ModalType>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Form Edukasi
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    // ✅ Update type
    const [category, setCategory] = useState<'hama' | 'penyakit' | 'pertanian_dasar'>('penyakit');
    const [description, setDescription] = useState('');
    const [solusi, setSolusi] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    // Form Video
    const [parentEdukasiId, setParentEdukasiId] = useState<number | null>(null);
    const [parentEdukasiNama, setParentEdukasiNama] = useState('');
    const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
    const [judulVideo, setJudulVideo] = useState('');
    const [keteranganVideo, setKeteranganVideo] = useState('');
    const [tipeVideo, setTipeVideo] = useState<'link' | 'file'>('link');
    const [videoLink, setVideoLink] = useState('');
    const [videoFile, setVideoFile] = useState<{ uri: string; name: string } | null>(null);
    const [existingVideo, setExistingVideo] = useState<string | null>(null);

    // ─── FETCH ───
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/edukasi');
            setList(res.data);
            setFiltered(res.data);
        } catch {
            Alert.alert("Error", "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let result = list;
        if (search) result = result.filter(d =>
            d.nama.toLowerCase().includes(search.toLowerCase())
        );
        if (filterKategori !== 'all') result = result.filter(d => d.kategori === filterKategori);
        setFiltered(result);
    }, [search, filterKategori, list]);

    const hamaCount = list.filter(d => d.kategori === 'hama').length;
    const penyakitCount = list.filter(d => d.kategori === 'penyakit').length;
    // ✅ Tambah counter pertanian_dasar
    const pertanianCount = list.filter(d => d.kategori === 'pertanian_dasar').length;

    // ─── EDUKASI MODAL ───
    const openAddEdukasi = () => {
        setEditingId(null);
        setName(''); setCategory('penyakit'); setDescription('');
        setSolusi('');
        setImage(null); setExistingImage(null);
        setModalType('edukasi'); setModalVisible(true);
    };

    const openEditEdukasi = (item: Edukasi) => {
        setEditingId(item.id);
        setName(item.nama); setCategory(item.kategori); setDescription(item.deskripsi);
        setSolusi(item.solusi ?? '');
        setImage(null); setExistingImage(item.gambar);
        setModalType('edukasi'); setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 1,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const handleSaveEdukasi = async () => {
        if (!name.trim() || !description.trim()) {
            Alert.alert("Error", "Nama dan deskripsi wajib diisi!"); return;
        }
        if (!editingId && !image) {
            Alert.alert("Error", "Gambar wajib dipilih!"); return;
        }

        const formData = new FormData();
        formData.append('nama', name);
        formData.append('kategori', category);
        formData.append('deskripsi', description);
        if (solusi.trim()) formData.append('solusi', solusi);
        if (image) {
            const filename = image.split('/').pop() || 'image.jpg';
            formData.append('gambar', { uri: image, name: filename, type: 'image/jpeg' } as any);
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const baseURL = process.env.EXPO_PUBLIC_API_URL;
            const url = editingId
                ? `${baseURL}/admin/edukasi/${editingId}/update`
                : `${baseURL}/admin/edukasi`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                Alert.alert("Sukses", editingId ? "Data diperbarui!" : "Data ditambahkan!");
                setModalVisible(false);
                fetchData();
            } else {
                Alert.alert(`Gagal (${response.status})`, result?.message || JSON.stringify(result));
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEdukasi = (id: number, nama: string) => {
        Alert.alert("Hapus Data", `Yakin hapus "${nama}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/admin/edukasi/${id}`);
                        if (expandedId === id) setExpandedId(null);
                        fetchData();
                    } catch {
                        Alert.alert("Gagal", "Gagal menghapus data");
                    }
                }
            }
        ]);
    };

    // ─── VIDEO MODAL ───
    const openAddVideo = (item: Edukasi) => {
        setParentEdukasiId(item.id);
        setParentEdukasiNama(item.nama);
        setEditingVideoId(null);
        setJudulVideo(''); setKeteranganVideo('');
        setTipeVideo('link'); setVideoLink(''); setVideoFile(null); setExistingVideo(null);
        setModalType('video'); setModalVisible(true);
    };

    const openEditVideo = (v: VideoEdukasi, edukasiNama: string) => {
        setParentEdukasiId(v.edukasi_id);
        setParentEdukasiNama(edukasiNama);
        setEditingVideoId(v.id);
        setJudulVideo(v.judul_video);
        setKeteranganVideo(v.keterangan_video ?? '');
        setTipeVideo(v.tipe_video);
        setVideoLink(v.tipe_video === 'link' ? v.video : '');
        setVideoFile(null);
        setExistingVideo(v.tipe_video === 'file' ? v.video : null);
        setModalType('video'); setModalVisible(true);
    };

    const pickVideoFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
        if (!result.canceled && result.assets[0]) {
            setVideoFile({ uri: result.assets[0].uri, name: result.assets[0].name });
        }
    };

    const handleSaveVideo = async () => {
        if (!judulVideo.trim()) {
            Alert.alert("Error", "Judul video wajib diisi!"); return;
        }
        if (!editingVideoId && tipeVideo === 'link' && !videoLink.trim()) {
            Alert.alert("Error", "Link video wajib diisi!"); return;
        }
        if (!editingVideoId && tipeVideo === 'file' && !videoFile) {
            Alert.alert("Error", "File video wajib dipilih!"); return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const baseURL = process.env.EXPO_PUBLIC_API_URL;
            const url = editingVideoId
                ? `${baseURL}/admin/video-edukasi/${editingVideoId}/update`
                : `${baseURL}/admin/edukasi/${parentEdukasiId}/video`;

            const formData = new FormData();
            formData.append('judul_video', judulVideo);
            formData.append('tipe_video', tipeVideo);
            if (keteranganVideo.trim()) formData.append('keterangan_video', keteranganVideo);
            if (tipeVideo === 'link') {
                formData.append('video', videoLink);
            } else if (videoFile) {
                formData.append('video', { uri: videoFile.uri, name: videoFile.name, type: 'video/mp4' } as any);
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                Alert.alert("Sukses", editingVideoId ? "Video diperbarui!" : "Video ditambahkan!");
                setModalVisible(false);
                fetchData();
            } else {
                Alert.alert(`Gagal (${response.status})`, result?.message || JSON.stringify(result));
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVideo = (v: VideoEdukasi) => {
        Alert.alert("Hapus Video", `Yakin hapus "${v.judul_video}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/admin/video-edukasi/${v.id}`);
                        fetchData();
                    } catch {
                        Alert.alert("Gagal", "Gagal menghapus video");
                    }
                }
            }
        ]);
    };

    const getImageUri = (gambar: string) =>
        `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/storage/${gambar}`;

    const toggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    // ─── RENDER VIDEO ROW ───
    const renderVideoRow = (v: VideoEdukasi, index: number, edukasiNama: string) => (
        <View key={v.id} style={[styles.videoRow, index % 2 === 0 && styles.videoRowEven]}>
            <View style={styles.vColNo}>
                <Text style={styles.vCellNo}>{index + 1}</Text>
            </View>
            <View style={styles.vColInfo}>
                <Text style={styles.vCellJudul} numberOfLines={1}>{v.judul_video}</Text>
                <View style={styles.vTipeBadge}>
                    <Ionicons
                        name={v.tipe_video === 'link' ? 'link-outline' : 'cloud-upload-outline'}
                        size={10}
                        color={v.tipe_video === 'link' ? '#1D4ED8' : '#059669'}
                    />
                    <Text style={[styles.vTipeText, { color: v.tipe_video === 'link' ? '#1D4ED8' : '#059669' }]}>
                        {v.tipe_video === 'link' ? 'Link' : 'File'}
                    </Text>
                </View>
                {v.keterangan_video ? (
                    <Text style={styles.vCellKet} numberOfLines={1}>{v.keterangan_video}</Text>
                ) : null}
            </View>
            <View style={styles.vColAction}>
                <TouchableOpacity onPress={() => openEditVideo(v, edukasiNama)} style={styles.btnEdit}>
                    <Ionicons name="pencil-outline" size={12} color="#1D4ED8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteVideo(v)} style={styles.btnDel}>
                    <Ionicons name="trash-outline" size={12} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // ─── RENDER ITEM ───
    const renderItem = ({ item, index }: { item: Edukasi; index: number }) => {
        const isExpanded = expandedId === item.id;
        // ✅ Pakai helper getBadgeStyle
        const badge = getBadgeStyle(item.kategori);

        return (
            <View>
                <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <View style={styles.colNo}>
                        <Text style={styles.cellNo}>{index + 1}</Text>
                    </View>
                    <View style={styles.colImg}>
                        <Image source={{ uri: getImageUri(item.gambar) }} style={styles.tableImg} />
                    </View>
                    <View style={styles.colMain}>
                        <Text style={styles.cellName} numberOfLines={1}>{item.nama}</Text>
                        <Text style={styles.cellDesc} numberOfLines={1}>{item.deskripsi}</Text>
                        {item.solusi ? (
                            <View style={[styles.infoChip, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="bulb-outline" size={10} color="#92400E" />
                                <Text style={[styles.infoChipText, { color: '#92400E' }]} numberOfLines={1}>{item.solusi}</Text>
                            </View>
                        ) : null}
                        {(item.video_edukasi?.length ?? 0) > 0 ? (
                            <View style={[styles.infoChip, { backgroundColor: '#EFF6FF' }]}>
                                <Ionicons name="videocam-outline" size={10} color="#1D4ED8" />
                                <Text style={[styles.infoChipText, { color: '#1D4ED8' }]}>{item.video_edukasi!.length} video</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* ✅ Badge sekarang support semua 3 kategori */}
                    <View style={styles.colBadge}>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                            <View style={[styles.badgeDot, { backgroundColor: badge.dot }]} />
                            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                    </View>

                    <View style={styles.colAction}>
                        <TouchableOpacity onPress={() => toggleExpand(item.id)}
                            style={[styles.btnVideo, isExpanded && styles.btnVideoActive]}>
                            <Ionicons name={isExpanded ? 'chevron-up' : 'videocam-outline'} size={13}
                                color={isExpanded ? '#065F46' : '#059669'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openEditEdukasi(item)} style={styles.btnEdit}>
                            <Ionicons name="pencil-outline" size={13} color="#1D4ED8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteEdukasi(item.id, item.nama)} style={styles.btnDel}>
                            <Ionicons name="trash-outline" size={13} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sub-tabel Video */}
                {isExpanded && (
                    <View style={styles.videoContainer}>
                        <View style={styles.videoHeader}>
                            <Ionicons name="videocam-outline" size={13} color="#1D4ED8" />
                            <Text style={styles.videoHeaderText}>Video Edukasi: {item.nama}</Text>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={() => openAddVideo(item)} style={styles.btnAddVideo}>
                                <Ionicons name="add" size={13} color="white" />
                                <Text style={styles.btnAddVideoText}>Tambah</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.vTableHeader}>
                            <View style={styles.vColNo}><Text style={styles.vThText}>No</Text></View>
                            <View style={styles.vColInfo}><Text style={styles.vThText}>Judul & Info</Text></View>
                            <View style={styles.vColAction}><Text style={[styles.vThText, { textAlign: 'center' }]}>Aksi</Text></View>
                        </View>
                        {item.video_edukasi && item.video_edukasi.length > 0
                            ? item.video_edukasi.map((v, i) => renderVideoRow(v, i, item.nama))
                            : (
                                <View style={styles.vEmpty}>
                                    <Text style={styles.vEmptyText}>Belum ada video.</Text>
                                    <TouchableOpacity onPress={() => openAddVideo(item)}>
                                        <Text style={styles.vEmptyLink}>+ Tambah sekarang</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Database Edukasi</Text>
                    <Text style={styles.headerSub}>Manajemen data edukasi hama, penyakit, pertanian dasar padi</Text>
                </View>
                <TouchableOpacity onPress={openAddEdukasi} style={styles.addBtn}>
                    <Ionicons name="add" size={18} color="white" />
                    <Text style={styles.addBtnText}>Tambah</Text>
                </TouchableOpacity>
            </View>

            {/* ✅ SUMMARY — sekarang 4 card */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#16A34A' }]}>
                    <Text style={styles.summaryNum}>{list.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#EF4444' }]}>
                    <Text style={[styles.summaryNum, { color: '#B91C1C' }]}>{hamaCount}</Text>
                    <Text style={styles.summaryLabel}>Hama</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#16A34A' }]}>
                    <Text style={[styles.summaryNum, { color: '#166534' }]}>{penyakitCount}</Text>
                    <Text style={styles.summaryLabel}>Penyakit</Text>
                </View>
                {/* ✅ Card baru */}
                <View style={[styles.summaryCard, { borderLeftColor: '#CA8A04' }]}>
                    <Text style={[styles.summaryNum, { color: '#854D0E' }]}>{pertanianCount}</Text>
                    <Text style={styles.summaryLabel}>Pertanian</Text>
                </View>
            </View>

            {/* SEARCH & FILTER */}
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput style={styles.searchInput} placeholder="Cari nama..." placeholderTextColor="#9CA3AF"
                        value={search} onChangeText={setSearch} />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                {/* ✅ Filter chips — tambah pertanian_dasar */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {[
                            { key: 'all', label: '🌿 Semua' },
                            { key: 'hama', label: '🐛 Hama' },
                            { key: 'penyakit', label: '🍂 Penyakit' },
                            { key: 'pertanian_dasar', label: '🌾 Pertanian Dasar' }, // ✅ baru
                        ].map(({ key, label }) => (
                            <TouchableOpacity key={key} onPress={() => setFilterKategori(key)}
                                style={[styles.filterChip, filterKategori === key && styles.filterChipActive]}>
                                <Text style={[styles.filterText, filterKategori === key && styles.filterTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <Text style={styles.countText}>{filtered.length} data</Text>
                    </View>
                </ScrollView>
            </View>

            {/* TABLE */}
            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#16A34A" />
                    <Text style={styles.loadingText}>Memuat data...</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.tableHeader}>
                        <View style={styles.colNo}><Text style={styles.thText}>No</Text></View>
                        <View style={styles.colImg}><Text style={styles.thText}>Foto</Text></View>
                        <View style={styles.colMain}><Text style={styles.thText}>Info</Text></View>
                        <View style={styles.colBadge}><Text style={styles.thText}>Kategori</Text></View>
                        <View style={styles.colAction}><Text style={[styles.thText, { textAlign: 'center' }]}>Aksi</Text></View>
                    </View>
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Ionicons name="leaf-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
                                <Text style={styles.emptySub}>Coba ubah filter atau tambahkan data baru</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* MODAL */}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    <ScrollView keyboardShouldPersistTaps="handled">

                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>
                                    {modalType === 'edukasi'
                                        ? (editingId ? '✏️ Edit Edukasi' : '➕ Tambah Edukasi')
                                        : (editingVideoId ? '✏️ Edit Video' : '➕ Tambah Video')}
                                </Text>
                                <Text style={styles.modalSub}>
                                    {modalType === 'video' ? `Untuk: ${parentEdukasiNama}` : 'Isi semua informasi'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>

                            {/* ── FORM EDUKASI ── */}
                            {modalType === 'edukasi' && (
                                <>
                                    <View style={styles.sectionBox}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIcon, { backgroundColor: '#EEF2FF' }]}>
                                                <Ionicons name="information-circle-outline" size={15} color="#6366F1" />
                                            </View>
                                            <Text style={[styles.sectionTitle, { color: '#4338CA' }]}>Informasi Utama</Text>
                                        </View>

                                        <Text style={styles.label}>Foto Objek</Text>
                                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                            {image ? (
                                                <Image source={{ uri: image }} style={styles.pickedImg} />
                                            ) : existingImage ? (
                                                <>
                                                    <Image source={{ uri: getImageUri(existingImage) }} style={styles.pickedImg} />
                                                    <View style={styles.changeOverlay}>
                                                        <Ionicons name="camera" size={18} color="white" />
                                                        <Text style={styles.changeText}>Ketuk untuk ganti foto</Text>
                                                    </View>
                                                </>
                                            ) : (
                                                <View style={styles.imageEmpty}>
                                                    <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                                                    <Text style={styles.imageEmptyText}>Ketuk untuk pilih foto</Text>
                                                    <Text style={styles.imageEmptyHint}>JPG, PNG — Maks 2MB</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>

                                        <Text style={styles.label}>Nama <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                        <TextInput style={styles.input} value={name} onChangeText={setName}
                                            placeholder="Contoh: Wereng Cokelat" placeholderTextColor="#9CA3AF" />

                                        <Text style={styles.label}>Kategori <Text style={{ color: '#EF4444' }}>*</Text></Text>

                                        {/* ✅ Baris 1: Hama & Penyakit */}
                                        <View style={styles.categoryRow}>
                                            {(['hama', 'penyakit'] as const).map(cat => (
                                                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                                                    style={[styles.catOption, category === cat && styles.catOptionActive]}>
                                                    <Text style={styles.catIcon}>{cat === 'hama' ? '🐛' : '🍂'}</Text>
                                                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                                                        {cat === 'hama' ? 'Hama' : 'Penyakit'}
                                                    </Text>
                                                    {category === cat && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {/* ✅ Baris 2: Pertanian Dasar (sendiri agar tidak terlalu sempit) */}
                                        <View style={[styles.categoryRow, { marginTop: 8 }]}>
                                            <TouchableOpacity
                                                onPress={() => setCategory('pertanian_dasar')}
                                                style={[styles.catOption, category === 'pertanian_dasar' && styles.catOptionActiveYellow]}>
                                                <Text style={styles.catIcon}>🌾</Text>
                                                <Text style={[styles.catText, category === 'pertanian_dasar' && styles.catTextActiveYellow]}>
                                                    Pertanian Dasar
                                                </Text>
                                                {category === 'pertanian_dasar' && <Ionicons name="checkmark-circle" size={16} color="#CA8A04" />}
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.label}>Deskripsi <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                        <TextInput style={[styles.input, styles.textArea]} multiline value={description}
                                            onChangeText={setDescription} placeholder="Jelaskan gejala dan informasi umum..."
                                            placeholderTextColor="#9CA3AF" textAlignVertical="top" />
                                    </View>

                                    {/* Section: Solusi */}
                                    <View style={styles.sectionBox}>
                                        <View style={styles.sectionHeader}>
                                            <View style={[styles.sectionIcon, { backgroundColor: '#FFFBEB' }]}>
                                                <Ionicons name="bulb-outline" size={15} color="#F59E0B" />
                                            </View>
                                            <Text style={[styles.sectionTitle, { color: '#92400E' }]}>Solusi</Text>
                                            <Text style={styles.sectionOptional}>(Opsional)</Text>
                                        </View>
                                        <Text style={styles.label}>Solusi Pencegahan</Text>
                                        <TextInput style={[styles.input, styles.textArea]} multiline value={solusi}
                                            onChangeText={setSolusi} placeholder="Jelaskan solusi atau pencegahan..."
                                            placeholderTextColor="#9CA3AF" textAlignVertical="top" />
                                    </View>
                                </>
                            )}

                            {/* ── FORM VIDEO ── */}
                            {modalType === 'video' && (
                                <View style={styles.sectionBox}>
                                    <View style={styles.sectionHeader}>
                                        <View style={[styles.sectionIcon, { backgroundColor: '#EFF6FF' }]}>
                                            <Ionicons name="videocam-outline" size={15} color="#3B82F6" />
                                        </View>
                                        <Text style={[styles.sectionTitle, { color: '#1D4ED8' }]}>Data Video</Text>
                                    </View>

                                    <Text style={styles.label}>Judul Video <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                    <TextInput style={styles.input} value={judulVideo} onChangeText={setJudulVideo}
                                        placeholder="Contoh: Cara Mengatasi Wereng" placeholderTextColor="#9CA3AF" />

                                    <Text style={styles.label}>Tipe Video <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                    <View style={styles.categoryRow}>
                                        <TouchableOpacity onPress={() => setTipeVideo('link')}
                                            style={[styles.catOption, tipeVideo === 'link' && styles.catOptionActive]}>
                                            <Ionicons name="link-outline" size={16} color={tipeVideo === 'link' ? '#16A34A' : '#6B7280'} />
                                            <Text style={[styles.catText, tipeVideo === 'link' && styles.catTextActive]}>Link URL</Text>
                                            {tipeVideo === 'link' && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setTipeVideo('file')}
                                            style={[styles.catOption, tipeVideo === 'file' && styles.catOptionActive]}>
                                            <Ionicons name="cloud-upload-outline" size={16} color={tipeVideo === 'file' ? '#16A34A' : '#6B7280'} />
                                            <Text style={[styles.catText, tipeVideo === 'file' && styles.catTextActive]}>Upload File</Text>
                                            {tipeVideo === 'file' && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                                        </TouchableOpacity>
                                    </View>

                                    {tipeVideo === 'link' ? (
                                        <>
                                            <Text style={styles.label}>Link Video <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                            <TextInput style={styles.input} value={videoLink} onChangeText={setVideoLink}
                                                placeholder="https://youtube.com/..." placeholderTextColor="#9CA3AF"
                                                autoCapitalize="none" keyboardType="url" />
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.label}>File Video <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                            <TouchableOpacity style={styles.filePicker} onPress={pickVideoFile}>
                                                <Ionicons name="cloud-upload-outline" size={24} color="#9CA3AF" />
                                                <Text style={styles.filePickerText}>
                                                    {videoFile ? videoFile.name : (existingVideo ? '📁 Video sudah ada — ketuk untuk ganti' : 'Ketuk untuk pilih file video')}
                                                </Text>
                                                <Text style={styles.filePickerHint}>MP4, MOV, AVI — Maks 50MB</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    <Text style={styles.label}>Keterangan Video</Text>
                                    <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                        multiline value={keteranganVideo} onChangeText={setKeteranganVideo}
                                        placeholder="Deskripsi singkat isi video..." placeholderTextColor="#9CA3AF" />
                                </View>
                            )}

                            {/* TOMBOL */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnCancelText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnSave} disabled={loading}
                                    onPress={modalType === 'edukasi' ? handleSaveEdukasi : handleSaveVideo}>
                                    {loading
                                        ? <ActivityIndicator color="white" size="small" />
                                        : <>
                                            <Ionicons name="save-outline" size={16} color="white" />
                                            <Text style={styles.btnSaveText}>
                                                {(modalType === 'edukasi' ? editingId : editingVideoId)
                                                    ? 'Simpan Perubahan' : 'Simpan Data'}
                                            </Text>
                                          </>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    backBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 10 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#16A34A', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, elevation: 2 },
    addBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },

    summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
    summaryCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 10, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
    summaryNum: { fontSize: 20, fontWeight: '800', color: '#111827' },
    summaryLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },

    searchFilterContainer: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, borderRadius: 10, height: 42, gap: 8 },
    searchInput: { flex: 1, fontSize: 13, color: '#1F2937' },
    filterRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
    filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    filterTextActive: { color: '#166534', fontWeight: '700' },
    countText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginLeft: 4, alignSelf: 'center' },

    tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', paddingHorizontal: 12, paddingVertical: 10 },
    thText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: 0.5 },

    tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tableRowEven: { backgroundColor: '#F8FAFC' },

    colNo: { width: 26 },
    colImg: { width: 52 },
    colMain: { flex: 1, marginHorizontal: 8 },
    colBadge: { width: 76 },
    colAction: { width: 92, flexDirection: 'row', gap: 4, justifyContent: 'center' },

    cellNo: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },
    tableImg: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E5E7EB' },
    cellName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
    cellDesc: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    infoChip: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3, backgroundColor: '#F0FDF4', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start', maxWidth: '100%' },
    infoChipText: { fontSize: 10, color: '#166534', fontWeight: '600', flexShrink: 1 },

    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20, gap: 3, alignSelf: 'flex-start' },
    badgeDot: { width: 5, height: 5, borderRadius: 3 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    btnVideo: { backgroundColor: '#D1FAE5', padding: 7, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnVideoActive: { backgroundColor: '#6EE7B7' },
    btnEdit: { backgroundColor: '#DBEAFE', padding: 7, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnDel: { backgroundColor: '#FEE2E2', padding: 7, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

    videoContainer: { backgroundColor: '#EFF6FF', borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
    videoHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 6, backgroundColor: '#DBEAFE', borderBottomWidth: 1, borderBottomColor: '#BFDBFE' },
    videoHeaderText: { fontSize: 12, fontWeight: '700', color: '#1E40AF' },
    btnAddVideo: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1D4ED8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    btnAddVideoText: { color: 'white', fontSize: 11, fontWeight: '700' },

    vTableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingHorizontal: 12, paddingVertical: 7 },
    vThText: { fontSize: 10, fontWeight: '700', color: '#BFDBFE', textTransform: 'uppercase', letterSpacing: 0.3 },

    videoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#DBEAFE' },
    videoRowEven: { backgroundColor: '#E0F2FE' },

    vColNo: { width: 26 },
    vColInfo: { flex: 1, marginRight: 8 },
    vColAction: { width: 56, flexDirection: 'row', gap: 4, justifyContent: 'center' },

    vCellNo: { fontSize: 11, color: '#6B7280', fontWeight: '600', textAlign: 'center' },
    vCellJudul: { fontSize: 12, fontWeight: '700', color: '#1E3A8A' },
    vTipeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
    vTipeText: { fontSize: 10, fontWeight: '600' },
    vCellKet: { fontSize: 11, color: '#6B7280', marginTop: 2 },

    vEmpty: { padding: 20, alignItems: 'center', gap: 6 },
    vEmptyText: { fontSize: 12, color: '#6B7280' },
    vEmptyLink: { fontSize: 12, color: '#1D4ED8', fontWeight: '700' },

    loadingBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    loadingText: { color: '#9CA3AF', fontSize: 14 },
    emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
    emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 24, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    modalSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    closeBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 10 },
    modalBody: { padding: 16, gap: 12 },

    sectionBox: { backgroundColor: 'white', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    sectionIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    sectionTitle: { fontSize: 13, fontWeight: '800' },
    sectionOptional: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#1F2937' },
    textArea: { height: 110, lineHeight: 20 },

    imagePicker: { width: '100%', height: 170, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', overflow: 'hidden' },
    pickedImg: { width: '100%', height: '100%' },
    changeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
    changeText: { color: 'white', fontSize: 13, fontWeight: '600' },
    imageEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
    imageEmptyText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    imageEmptyHint: { fontSize: 11, color: '#9CA3AF' },

    filePicker: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', padding: 20, alignItems: 'center', gap: 6 },
    filePickerText: { fontSize: 13, color: '#6B7280', fontWeight: '600', textAlign: 'center' },
    filePickerHint: { fontSize: 11, color: '#9CA3AF' },

    categoryRow: { flexDirection: 'row', gap: 10 },
    catOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, gap: 6 },
    catOptionActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    // ✅ Style khusus pertanian_dasar (kuning)
    catOptionActiveYellow: { borderColor: '#CA8A04', backgroundColor: '#FEFCE8' },
    catIcon: { fontSize: 16 },
    catText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
    catTextActive: { color: '#166534' },
    // ✅ Teks aktif kuning
    catTextActiveYellow: { color: '#854D0E' },

    modalFooter: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 40 },
    btnCancel: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    btnCancelText: { fontWeight: '700', color: '#374151', fontSize: 14 },
    btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, backgroundColor: '#16A34A', gap: 8, elevation: 3 },
    btnSaveText: { color: 'white', fontWeight: '800', fontSize: 14 },
});
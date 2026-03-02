import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView,
    Alert, Image, Modal, TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Disease {
    id: number;
    nama: string;
    kategori: 'hama' | 'penyakit';
    deskripsi: string;
    gambar: string;
}

export default function ManageDisease() {
    const router = useRouter();
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('all');

    // State form
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'hama' | 'penyakit'>('penyakit');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);

    const fetchDiseases = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hama-penyakit');
            setDiseases(response.data);
            setFilteredDiseases(response.data);
        } catch (error) {
            console.log("Error Fetch:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDiseases(); }, []);

    useEffect(() => {
        let result = diseases;
        if (search) {
            result = result.filter(d =>
                d.nama.toLowerCase().includes(search.toLowerCase()) ||
                d.deskripsi.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterKategori !== 'all') {
            result = result.filter(d => d.kategori === filterKategori);
        }
        setFilteredDiseases(result);
    }, [search, filterKategori, diseases]);

    const hamaCount = diseases.filter(d => d.kategori === 'hama').length;
    const penyakitCount = diseases.filter(d => d.kategori === 'penyakit').length;

    const openAddModal = () => {
        setEditingId(null);
        setName(''); setCategory('penyakit'); setDescription('');
        setImage(null); setExistingImage(null);
        setModalVisible(true);
    };

    const openEditModal = (item: Disease) => {
        setEditingId(item.id);
        setName(item.nama); setCategory(item.kategori); setDescription(item.deskripsi);
        setImage(null); setExistingImage(item.gambar);
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 1,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
    };

    const handleSave = async () => {
        if (!name.trim() || !description.trim()) {
            Alert.alert("Error", "Nama dan deskripsi wajib diisi!"); return;
        }
        if (!editingId && !image) {
            Alert.alert("Error", "Gambar wajib dipilih untuk data baru!"); return;
        }

        const formData = new FormData();
        formData.append('nama', name);
        formData.append('kategori', category);
        formData.append('deskripsi', description);

        if (image) {
            const filename = image.split('/').pop() || 'image.jpg';
            formData.append('gambar', { uri: image, name: filename, type: 'image/jpeg' } as any);
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const baseURL = process.env.EXPO_PUBLIC_API_URL;
            const url = editingId
                ? `${baseURL}/admin/hama-penyakit/${editingId}/update`
                : `${baseURL}/admin/hama-penyakit`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: formData,
            });

            const result = await response.json();
            if (response.ok) {
                Alert.alert("Sukses", editingId ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!");
                setModalVisible(false);
                setName(''); setDescription(''); setImage(null); setExistingImage(null); setEditingId(null);
                fetchDiseases();
            } else {
                Alert.alert(`Gagal (${response.status})`, result?.message || JSON.stringify(result));
            }
        } catch (error: any) {
            Alert.alert("Gagal", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, nama: string) => {
        Alert.alert("Hapus Data", `Yakin ingin menghapus "${nama}"?`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/admin/hama-penyakit/${id}`);
                        fetchDiseases();
                    } catch {
                        Alert.alert("Gagal", "Gagal menghapus data");
                    }
                }
            }
        ]);
    };

    const getImageUri = (gambar: string) =>
        `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/storage/${gambar}`;

    const renderItem = ({ item, index }: { item: Disease; index: number }) => (
        <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
            <View style={styles.colNo}>
                <Text style={styles.cellNo}>{index + 1}</Text>
            </View>
            <View style={styles.colImg}>
                <Image source={{ uri: getImageUri(item.gambar) }} style={styles.tableImg} />
            </View>
            <View style={styles.colMain}>
                <Text style={styles.cellName} numberOfLines={1}>{item.nama}</Text>
                <Text style={styles.cellDesc} numberOfLines={2}>{item.deskripsi}</Text>
            </View>
            <View style={styles.colBadge}>
                <View style={[styles.badge, { backgroundColor: item.kategori === 'hama' ? '#FEE2E2' : '#DCFCE7' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: item.kategori === 'hama' ? '#EF4444' : '#16A34A' }]} />
                    <Text style={[styles.badgeText, { color: item.kategori === 'hama' ? '#991B1B' : '#166534' }]}>
                        {item.kategori === 'hama' ? 'Hama' : 'Penyakit'}
                    </Text>
                </View>
            </View>
            <View style={styles.colAction}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.btnEdit}>
                    <Ionicons name="pencil-outline" size={14} color="#1D4ED8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.nama)} style={styles.btnDel}>
                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* ─── HEADER ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Database Hama & Penyakit</Text>
                    <Text style={styles.headerSub}>Manajemen data tanaman</Text>
                </View>
                <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
                    <Ionicons name="add" size={18} color="white" />
                    <Text style={styles.addBtnText}>Tambah</Text>
                </TouchableOpacity>
            </View>

            {/* ─── SUMMARY CARDS ─── */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#16A34A' }]}>
                    <Text style={styles.summaryNum}>{diseases.length}</Text>
                    <Text style={styles.summaryLabel}>Total Data</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#EF4444' }]}>
                    <Text style={[styles.summaryNum, { color: '#B91C1C' }]}>{hamaCount}</Text>
                    <Text style={styles.summaryLabel}>Hama</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#F59E0B' }]}>
                    <Text style={[styles.summaryNum, { color: '#92400E' }]}>{penyakitCount}</Text>
                    <Text style={styles.summaryLabel}>Penyakit</Text>
                </View>
            </View>

            {/* ─── SEARCH & FILTER ─── */}
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama hama atau penyakit..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.filterRow}>
                    {[
                        { key: 'all', label: '🌿 Semua' },
                        { key: 'hama', label: '🐛 Hama' },
                        { key: 'penyakit', label: '🍂 Penyakit' },
                    ].map(({ key, label }) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setFilterKategori(key)}
                            style={[styles.filterChip, filterKategori === key && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterText, filterKategori === key && styles.filterTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={{ flex: 1 }} />
                    <Text style={styles.countText}>{filteredDiseases.length} data</Text>
                </View>
            </View>

            {/* ─── TABLE ─── */}
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
                        <View style={styles.colMain}><Text style={styles.thText}>Nama & Deskripsi</Text></View>
                        <View style={styles.colBadge}><Text style={styles.thText}>Kategori</Text></View>
                        <View style={styles.colAction}><Text style={[styles.thText, { textAlign: 'center' }]}>Aksi</Text></View>
                    </View>
                    <FlatList
                        data={filteredDiseases}
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

            {/* ─── MODAL ─── */}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{editingId ? '✏️ Edit Data' : '➕ Tambah Data Baru'}</Text>
                                <Text style={styles.modalSub}>{editingId ? 'Perbarui informasi hama/penyakit' : 'Masukkan data hama atau penyakit baru'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
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
                            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Contoh: Wereng Cokelat" placeholderTextColor="#9CA3AF" />

                            <Text style={styles.label}>Kategori <Text style={{ color: '#EF4444' }}>*</Text></Text>
                            <View style={styles.categoryRow}>
                                <TouchableOpacity onPress={() => setCategory('hama')} style={[styles.catOption, category === 'hama' && styles.catOptionActive]}>
                                    <Text style={styles.catIcon}>🐛</Text>
                                    <Text style={[styles.catText, category === 'hama' && styles.catTextActive]}>Hama</Text>
                                    {category === 'hama' && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCategory('penyakit')} style={[styles.catOption, category === 'penyakit' && styles.catOptionActive]}>
                                    <Text style={styles.catIcon}>🍂</Text>
                                    <Text style={[styles.catText, category === 'penyakit' && styles.catTextActive]}>Penyakit</Text>
                                    {category === 'penyakit' && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Deskripsi & Penanganan <Text style={{ color: '#EF4444' }}>*</Text></Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline value={description} onChangeText={setDescription} placeholder="Jelaskan gejala, penyebab, dan cara penanganan..." placeholderTextColor="#9CA3AF" textAlignVertical="top" />

                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnCancelText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
                                    {loading
                                        ? <ActivityIndicator color="white" size="small" />
                                        : <>
                                            <Ionicons name={editingId ? "save-outline" : "cloud-upload-outline"} size={16} color="white" />
                                            <Text style={styles.btnSaveText}>{editingId ? 'Simpan Perubahan' : 'Simpan Data'}</Text>
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

    summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    summaryCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
    summaryNum: { fontSize: 22, fontWeight: '800', color: '#111827' },
    summaryLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },

    searchFilterContainer: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, borderRadius: 10, height: 42, gap: 8 },
    searchInput: { flex: 1, fontSize: 13, color: '#1F2937' },
    filterRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
    filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    filterTextActive: { color: '#166534', fontWeight: '700' },
    countText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

    tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', paddingHorizontal: 12, paddingVertical: 10 },
    thText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: 0.5 },

    tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tableRowEven: { backgroundColor: '#F8FAFC' },

    colNo: { width: 28 },
    colImg: { width: 54 },
    colMain: { flex: 1, marginHorizontal: 8 },
    colBadge: { width: 80 },
    colAction: { width: 68, flexDirection: 'row', gap: 6, justifyContent: 'center' },

    cellNo: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },
    tableImg: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E5E7EB' },
    cellName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
    cellDesc: { fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 15 },

    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4, alignSelf: 'flex-start' },
    badgeDot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    btnEdit: { backgroundColor: '#DBEAFE', padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnDel: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

    loadingBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    loadingText: { color: '#9CA3AF', fontSize: 14 },
    emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
    emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 24, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    modalSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    closeBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 10 },
    modalBody: { padding: 20 },

    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 14, color: '#1F2937' },
    textArea: { height: 120, lineHeight: 20 },

    imagePicker: { width: '100%', height: 180, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', overflow: 'hidden' },
    pickedImg: { width: '100%', height: '100%' },
    changeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
    changeText: { color: 'white', fontSize: 13, fontWeight: '600' },
    imageEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
    imageEmptyText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    imageEmptyHint: { fontSize: 11, color: '#9CA3AF' },

    categoryRow: { flexDirection: 'row', gap: 10 },
    catOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, gap: 6 },
    catOptionActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    catIcon: { fontSize: 18 },
    catText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
    catTextActive: { color: '#166534' },

    modalFooter: { flexDirection: 'row', gap: 12, marginTop: 28, marginBottom: 40 },
    btnCancel: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    btnCancelText: { fontWeight: '700', color: '#374151', fontSize: 14 },
    btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, backgroundColor: '#16A34A', gap: 8, elevation: 3 },
    btnSaveText: { color: 'white', fontWeight: '800', fontSize: 14 },
});
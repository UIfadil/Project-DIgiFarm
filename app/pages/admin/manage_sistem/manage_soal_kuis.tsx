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

type Kategori = 'hama' | 'penyakit' | 'pertanian_dasar';
type JawabanBenar = 'a' | 'b' | 'c' | 'd';

interface SoalKuis {
    id: number;
    pertanyaan: string;
    gambar: string | null;
    kategori: Kategori;
    opsi_a: string;
    opsi_b: string;
    opsi_c: string;
    opsi_d: string;
    jawaban_benar: JawabanBenar;
}

const KATEGORI_CONFIG = {
    hama:            { label: 'Hama',            icon: '🐛', bg: '#FEE2E2', dot: '#EF4444', text: '#991B1B' },
    penyakit:        { label: 'Penyakit',         icon: '🍂', bg: '#DCFCE7', dot: '#16A34A', text: '#166534' },
    pertanian_dasar: { label: 'Pertanian Dasar',  icon: '🌾', bg: '#FEF9C3', dot: '#CA8A04', text: '#854D0E' },
};

const JAWABAN_LABEL: Record<JawabanBenar, string> = {
    a: 'A', b: 'B', c: 'C', d: 'D',
};

export default function ManageSoalKuis() {
    const router = useRouter();
    const [list, setList] = useState<SoalKuis[]>([]);
    const [filtered, setFiltered] = useState<SoalKuis[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterKategori, setFilterKategori] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pertanyaan, setPertanyaan] = useState('');
    const [kategori, setKategori] = useState<Kategori>('hama');
    const [opsiA, setOpsiA] = useState('');
    const [opsiB, setOpsiB] = useState('');
    const [opsiC, setOpsiC] = useState('');
    const [opsiD, setOpsiD] = useState('');
    const [jawabanBenar, setJawabanBenar] = useState<JawabanBenar>('a');
    const [image, setImage] = useState<string | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [hapusGambar, setHapusGambar] = useState(false);

    // ─── FETCH ───
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/soal-kuis');
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
            d.pertanyaan.toLowerCase().includes(search.toLowerCase())
        );
        if (filterKategori !== 'all') result = result.filter(d => d.kategori === filterKategori);
        setFiltered(result);
    }, [search, filterKategori, list]);

    // Count per kategori
    const hamaCount      = list.filter(d => d.kategori === 'hama').length;
    const penyakitCount  = list.filter(d => d.kategori === 'penyakit').length;
    const pertanianCount = list.filter(d => d.kategori === 'pertanian_dasar').length;

    // ─── MODAL ───
    const resetForm = () => {
        setEditingId(null);
        setPertanyaan(''); setKategori('hama');
        setOpsiA(''); setOpsiB(''); setOpsiC(''); setOpsiD('');
        setJawabanBenar('a');
        setImage(null); setExistingImage(null); setHapusGambar(false);
    };

    const openAdd = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEdit = (item: SoalKuis) => {
        setEditingId(item.id);
        setPertanyaan(item.pertanyaan);
        setKategori(item.kategori);
        setOpsiA(item.opsi_a);
        setOpsiB(item.opsi_b);
        setOpsiC(item.opsi_c);
        setOpsiD(item.opsi_d);
        setJawabanBenar(item.jawaban_benar);
        setImage(null);
        setExistingImage(item.gambar);
        setHapusGambar(false);
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setHapusGambar(false);
        }
    };

    const handleRemoveImage = () => {
        Alert.alert("Hapus Gambar", "Yakin ingin menghapus gambar soal ini?", [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus", style: "destructive", onPress: () => {
                    setImage(null);
                    setExistingImage(null);
                    setHapusGambar(true);
                }
            }
        ]);
    };

    const handleSave = async () => {
        if (!pertanyaan.trim()) { Alert.alert("Error", "Pertanyaan wajib diisi!"); return; }
        if (!opsiA.trim() || !opsiB.trim() || !opsiC.trim() || !opsiD.trim()) {
            Alert.alert("Error", "Semua opsi jawaban wajib diisi!"); return;
        }

        const formData = new FormData();
        formData.append('pertanyaan', pertanyaan);
        formData.append('kategori', kategori);
        formData.append('opsi_a', opsiA);
        formData.append('opsi_b', opsiB);
        formData.append('opsi_c', opsiC);
        formData.append('opsi_d', opsiD);
        formData.append('jawaban_benar', jawabanBenar);
        if (hapusGambar) formData.append('hapus_gambar', 'true');
        if (image) {
            const filename = image.split('/').pop() || 'image.jpg';
            formData.append('gambar', { uri: image, name: filename, type: 'image/jpeg' } as any);
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const baseURL = process.env.EXPO_PUBLIC_API_URL;
            const url = editingId
                ? `${baseURL}/admin/soal-kuis/${editingId}/update`
                : `${baseURL}/admin/soal-kuis`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                Alert.alert("Sukses", editingId ? "Soal diperbarui!" : "Soal ditambahkan!");
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

    const handleDelete = (id: number, pertanyaan: string) => {
        Alert.alert("Hapus Soal", `Yakin hapus soal ini?\n"${pertanyaan.substring(0, 50)}..."`, [
            { text: "Batal", style: "cancel" },
            {
                text: "Hapus", style: "destructive", onPress: async () => {
                    try {
                        await api.delete(`/admin/soal-kuis/${id}`);
                        fetchData();
                    } catch {
                        Alert.alert("Gagal", "Gagal menghapus soal");
                    }
                }
            }
        ]);
    };

    const getImageUri = (gambar: string) =>
        `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/storage/${gambar}`;

    // ─── RENDER ITEM ───
    const renderItem = ({ item, index }: { item: SoalKuis; index: number }) => {
        const kat = KATEGORI_CONFIG[item.kategori];
        return (
            <View style={[styles.card, index % 2 === 0 && styles.cardEven]}>
                {/* Nomor + Kategori Badge */}
                <View style={styles.cardTop}>
                    <View style={styles.noBox}>
                        <Text style={styles.noText}>{index + 1}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: kat.bg }]}>
                        <Text style={styles.badgeIcon}>{kat.icon}</Text>
                        <Text style={[styles.badgeText, { color: kat.text }]}>{kat.label}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    {/* Jawaban benar */}
                    <View style={styles.jawabanBadge}>
                        <Text style={styles.jawabanLabel}>Jwb:</Text>
                        <Text style={styles.jawabanValue}>{JAWABAN_LABEL[item.jawaban_benar]}</Text>
                    </View>
                    {/* Aksi */}
                    <TouchableOpacity onPress={() => openEdit(item)} style={styles.btnEdit}>
                        <Ionicons name="pencil-outline" size={14} color="#1D4ED8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.pertanyaan)} style={styles.btnDel}>
                        <Ionicons name="trash-outline" size={14} color="#DC2626" />
                    </TouchableOpacity>
                </View>

                {/* Gambar soal jika ada */}
                {item.gambar ? (
                    <Image
                        source={{ uri: getImageUri(item.gambar) }}
                        style={styles.soalImage}
                        resizeMode="cover"
                    />
                ) : null}

                {/* Pertanyaan */}
                <Text style={styles.pertanyaanText}>{item.pertanyaan}</Text>

                {/* Opsi jawaban */}
                <View style={styles.opsiContainer}>
                    {(['a', 'b', 'c', 'd'] as JawabanBenar[]).map(key => {
                        const opsiText = key === 'a' ? item.opsi_a : key === 'b' ? item.opsi_b : key === 'c' ? item.opsi_c : item.opsi_d;
                        const isBenar = item.jawaban_benar === key;
                        return (
                            <View key={key} style={[styles.opsiRow, isBenar && styles.opsiRowBenar]}>
                                <View style={[styles.opsiHuruf, isBenar && styles.opsiHurufBenar]}>
                                    <Text style={[styles.opsiHurufText, isBenar && styles.opsiHurufTextBenar]}>
                                        {key.toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={[styles.opsiText, isBenar && styles.opsiTextBenar]} numberOfLines={2}>
                                    {opsiText}
                                </Text>
                                {isBenar && <Ionicons name="checkmark-circle" size={16} color="#16A34A" />}
                            </View>
                        );
                    })}
                </View>
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
                    <Text style={styles.headerTitle}>Bank Soal Kuis</Text>
                    <Text style={styles.headerSub}>Manajemen soal pilihan ganda</Text>
                </View>
                <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
                    <Ionicons name="add" size={18} color="white" />
                    <Text style={styles.addBtnText}>Tambah</Text>
                </TouchableOpacity>
            </View>

            {/* SUMMARY */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#6366F1' }]}>
                    <Text style={styles.summaryNum}>{list.length}</Text>
                    <Text style={styles.summaryLabel}>Total Soal</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#EF4444' }]}>
                    <Text style={[styles.summaryNum, { color: '#B91C1C' }]}>{hamaCount}</Text>
                    <Text style={styles.summaryLabel}>Hama</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#16A34A' }]}>
                    <Text style={[styles.summaryNum, { color: '#166534' }]}>{penyakitCount}</Text>
                    <Text style={styles.summaryLabel}>Penyakit</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#CA8A04' }]}>
                    <Text style={[styles.summaryNum, { color: '#854D0E' }]}>{pertanianCount}</Text>
                    <Text style={styles.summaryLabel}>Pertanian</Text>
                </View>
            </View>

            {/* SEARCH & FILTER */}
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput style={styles.searchInput} placeholder="Cari pertanyaan..."
                        placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {[
                            { key: 'all', label: '📚 Semua' },
                            { key: 'hama', label: '🐛 Hama' },
                            { key: 'penyakit', label: '🍂 Penyakit' },
                            { key: 'pertanian_dasar', label: '🌾 Pertanian Dasar' },
                        ].map(({ key, label }) => (
                            <TouchableOpacity key={key} onPress={() => setFilterKategori(key)}
                                style={[styles.filterChip, filterKategori === key && styles.filterChipActive]}>
                                <Text style={[styles.filterText, filterKategori === key && styles.filterTextActive]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        <Text style={styles.countText}>{filtered.length} soal</Text>
                    </View>
                </ScrollView>
            </View>

            {/* LIST SOAL */}
            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Memuat soal...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>Belum Ada Soal</Text>
                            <Text style={styles.emptySub}>Ketuk tombol Tambah untuk menambah soal baru</Text>
                        </View>
                    }
                />
            )}

            {/* ═══ MODAL FORM ═══ */}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                    <ScrollView keyboardShouldPersistTaps="handled">

                        {/* Header Modal */}
                        <View style={styles.modalHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.modalTitle}>
                                    {editingId ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}
                                </Text>
                                <Text style={styles.modalSub}>Isi pertanyaan dan semua opsi jawaban</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>

                            {/* ── Section: Pertanyaan ── */}
                            <View style={styles.sectionBox}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIcon, { backgroundColor: '#EEF2FF' }]}>
                                        <Ionicons name="help-circle-outline" size={15} color="#6366F1" />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: '#4338CA' }]}>Pertanyaan</Text>
                                </View>

                                {/* Kategori */}
                                <Text style={styles.label}>Kategori <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                <View style={styles.categoryRow}>
                                    {(['hama', 'penyakit'] as Kategori[]).map(cat => {
                                        const cfg = KATEGORI_CONFIG[cat];
                                        return (
                                            <TouchableOpacity key={cat} onPress={() => setKategori(cat)}
                                                style={[styles.catOption, kategori === cat && { borderColor: cfg.dot, backgroundColor: cfg.bg }]}>
                                                <Text style={styles.catIcon}>{cfg.icon}</Text>
                                                <Text style={[styles.catText, kategori === cat && { color: cfg.text, fontWeight: '700' }]}>
                                                    {cfg.label}
                                                </Text>
                                                {kategori === cat && <Ionicons name="checkmark-circle" size={14} color={cfg.dot} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <View style={[styles.categoryRow, { marginTop: 8 }]}>
                                    <TouchableOpacity onPress={() => setKategori('pertanian_dasar')}
                                        style={[styles.catOption, kategori === 'pertanian_dasar' && { borderColor: '#CA8A04', backgroundColor: '#FEF9C3' }]}>
                                        <Text style={styles.catIcon}>🌾</Text>
                                        <Text style={[styles.catText, kategori === 'pertanian_dasar' && { color: '#854D0E', fontWeight: '700' }]}>
                                            Pertanian Dasar
                                        </Text>
                                        {kategori === 'pertanian_dasar' && <Ionicons name="checkmark-circle" size={14} color="#CA8A04" />}
                                    </TouchableOpacity>
                                </View>

                                {/* Gambar soal (opsional) */}
                                <Text style={styles.label}>Gambar Soal <Text style={styles.optional}>(Opsional)</Text></Text>
                                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.pickedImg} />
                                    ) : existingImage && !hapusGambar ? (
                                        <Image source={{ uri: getImageUri(existingImage) }} style={styles.pickedImg} />
                                    ) : (
                                        <View style={styles.imageEmpty}>
                                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                                            <Text style={styles.imageEmptyText}>Ketuk untuk pilih gambar</Text>
                                            <Text style={styles.imageEmptyHint}>JPG, PNG — Opsional</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                {/* Tombol hapus gambar jika ada */}
                                {(image || (existingImage && !hapusGambar)) && (
                                    <TouchableOpacity onPress={handleRemoveImage} style={styles.btnHapusGambar}>
                                        <Ionicons name="trash-outline" size={14} color="#DC2626" />
                                        <Text style={styles.btnHapusGambarText}>Hapus Gambar</Text>
                                    </TouchableOpacity>
                                )}

                                {/* Teks pertanyaan */}
                                <Text style={styles.label}>Teks Pertanyaan <Text style={{ color: '#EF4444' }}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    multiline value={pertanyaan} onChangeText={setPertanyaan}
                                    placeholder="Tulis pertanyaan di sini..."
                                    placeholderTextColor="#9CA3AF" textAlignVertical="top"
                                />
                            </View>

                            {/* ── Section: Opsi Jawaban ── */}
                            <View style={styles.sectionBox}>
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.sectionIcon, { backgroundColor: '#F0FDF4' }]}>
                                        <Ionicons name="list-outline" size={15} color="#16A34A" />
                                    </View>
                                    <Text style={[styles.sectionTitle, { color: '#166534' }]}>Opsi Jawaban</Text>
                                    <Text style={styles.sectionOptional}>— pilih yang benar</Text>
                                </View>

                                {([
                                    { key: 'a' as JawabanBenar, value: opsiA, setter: setOpsiA },
                                    { key: 'b' as JawabanBenar, value: opsiB, setter: setOpsiB },
                                    { key: 'c' as JawabanBenar, value: opsiC, setter: setOpsiC },
                                    { key: 'd' as JawabanBenar, value: opsiD, setter: setOpsiD },
                                ]).map(({ key, value, setter }) => {
                                    const isBenar = jawabanBenar === key;
                                    return (
                                        <View key={key} style={styles.opsiInputRow}>
                                            {/* Tombol pilih jawaban benar */}
                                            <TouchableOpacity
                                                onPress={() => setJawabanBenar(key)}
                                                style={[styles.opsiHurufInput, isBenar && styles.opsiHurufInputActive]}>
                                                <Text style={[styles.opsiHurufInputText, isBenar && styles.opsiHurufInputTextActive]}>
                                                    {key.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                            {/* Input opsi */}
                                            <TextInput
                                                style={[styles.opsiInputField, isBenar && styles.opsiInputFieldActive]}
                                                value={value} onChangeText={setter}
                                                placeholder={`Opsi ${key.toUpperCase()}...`}
                                                placeholderTextColor="#9CA3AF"
                                            />
                                            {isBenar && (
                                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" style={{ marginLeft: 6 }} />
                                            )}
                                        </View>
                                    );
                                })}
                                <View style={styles.jawabanHint}>
                                    <Ionicons name="information-circle-outline" size={14} color="#6366F1" />
                                    <Text style={styles.jawabanHintText}>
                                        Ketuk huruf (A/B/C/D) untuk menandai jawaban yang benar
                                    </Text>
                                </View>
                            </View>

                            {/* TOMBOL */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnCancelText}>Batal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
                                    {loading
                                        ? <ActivityIndicator color="white" size="small" />
                                        : <>
                                            <Ionicons name="save-outline" size={16} color="white" />
                                            <Text style={styles.btnSaveText}>
                                                {editingId ? 'Simpan Perubahan' : 'Simpan Soal'}
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
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, elevation: 2 },
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
    filterChipActive: { backgroundColor: '#EEF2FF', borderColor: '#6366F1' },
    filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    filterTextActive: { color: '#4338CA', fontWeight: '700' },
    countText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginLeft: 4, alignSelf: 'center' },

    // Card soal
    card: { backgroundColor: 'white', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
    cardEven: { backgroundColor: '#FAFAFA' },

    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    noBox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
    noText: { fontSize: 11, fontWeight: '800', color: '#6366F1' },

    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, gap: 4 },
    badgeIcon: { fontSize: 11 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    jawabanBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    jawabanLabel: { fontSize: 10, color: '#6B7280' },
    jawabanValue: { fontSize: 12, fontWeight: '800', color: '#16A34A' },

    btnEdit: { backgroundColor: '#DBEAFE', padding: 7, borderRadius: 8 },
    btnDel: { backgroundColor: '#FEE2E2', padding: 7, borderRadius: 8 },

    soalImage: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10, backgroundColor: '#F3F4F6' },
    pertanyaanText: { fontSize: 14, fontWeight: '600', color: '#1F2937', lineHeight: 20, marginBottom: 10 },

    opsiContainer: { gap: 6 },
    opsiRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
    opsiRowBenar: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
    opsiHuruf: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
    opsiHurufBenar: { backgroundColor: '#16A34A' },
    opsiHurufText: { fontSize: 11, fontWeight: '800', color: '#374151' },
    opsiHurufTextBenar: { color: 'white' },
    opsiText: { flex: 1, fontSize: 12, color: '#374151' },
    opsiTextBenar: { color: '#166534', fontWeight: '600' },

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
    sectionOptional: { fontSize: 11, color: '#9CA3AF' },

    label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 12 },
    optional: { fontSize: 11, color: '#9CA3AF', fontWeight: '400' },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#1F2937' },
    textArea: { height: 100, lineHeight: 20 },

    imagePicker: { width: '100%', height: 150, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', overflow: 'hidden' },
    pickedImg: { width: '100%', height: '100%' },
    imageEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
    imageEmptyText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
    imageEmptyHint: { fontSize: 11, color: '#9CA3AF' },
    btnHapusGambar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-end' },
    btnHapusGambarText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },

    categoryRow: { flexDirection: 'row', gap: 10 },
    catOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, gap: 5 },
    catIcon: { fontSize: 14 },
    catText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },

    // Opsi jawaban di form
    opsiInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    opsiHurufInput: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB' },
    opsiHurufInputActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
    opsiHurufInputText: { fontSize: 14, fontWeight: '800', color: '#374151' },
    opsiHurufInputTextActive: { color: 'white' },
    opsiInputField: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1F2937' },
    opsiInputFieldActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    jawabanHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#EEF2FF', padding: 10, borderRadius: 8 },
    jawabanHintText: { flex: 1, fontSize: 11, color: '#4338CA' },

    modalFooter: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 40 },
    btnCancel: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    btnCancelText: { fontWeight: '700', color: '#374151', fontSize: 14 },
    btnSave: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, backgroundColor: '#6366F1', gap: 8, elevation: 3 },
    btnSaveText: { color: 'white', fontWeight: '800', fontSize: 14 },
});
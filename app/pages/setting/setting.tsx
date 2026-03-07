import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Switch, Image, Modal, TextInput, ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainLayout from '../../layout/main_layout';
import api from '../../services/api';

interface UserProfil {
    id: number;
    name: string;
    email: string;
    foto_profil_url: string | null; // dari accessor di model
}

export default function PengaturanAplikasi() {
    const router = useRouter();

    const [user, setUser] = useState<UserProfil | null>(null);
    const [loadingProfil, setLoadingProfil] = useState(true);

    // State switch
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // State modal edit profil
    const [editVisible, setEditVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhoto, setEditPhoto] = useState<string | null>(null); // URI lokal baru
    const [saving, setSaving] = useState(false);

    // ── Fetch profil ──
    const fetchProfil = async () => {
        try {
            setLoadingProfil(true);
            const res = await api.get('/profil');
            setUser(res.data);
        } catch {
            // Gagal ambil profil — tidak perlu alert
        } finally {
            setLoadingProfil(false);
        }
    };

    useEffect(() => { fetchProfil(); }, []);

    // ── Buka modal edit profil ──
    const openEdit = () => {
        setEditName(user?.name ?? '');
        setEditPhoto(null);
        setEditVisible(true);
    };

    // ── Pilih foto dari galeri ──
    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // square crop untuk foto profil
            quality: 0.8,
        });
        if (!result.canceled) {
            setEditPhoto(result.assets[0].uri);
        }
    };

    // ── Simpan perubahan profil ──
    const handleSave = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Nama tidak boleh kosong');
            return;
        }
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('userToken');
            const baseURL = process.env.EXPO_PUBLIC_API_URL;

            const formData = new FormData();
            formData.append('name', editName.trim());

            if (editPhoto) {
                const filename = editPhoto.split('/').pop() || 'foto.jpg';
                formData.append('foto_profil', {
                    uri: editPhoto,
                    name: filename,
                    type: 'image/jpeg',
                } as any);
            }

            const response = await fetch(`${baseURL}/profil/update`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();
            console.log('Response profil:', JSON.stringify(result));
            if (response.ok) {
                setUser(result);
                setEditVisible(false);
                Alert.alert('Berhasil', 'Profil berhasil diperbarui');
            } else {
                Alert.alert('Gagal', result?.message ?? 'Terjadi kesalahan');
            }
        } catch {
            Alert.alert('Gagal', 'Tidak dapat menyimpan perubahan');
        } finally {
            setSaving(false);
        }
    };

    // ── Keluar akun ──
    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch {
            // Lanjut logout meski API gagal
        } finally {
            await AsyncStorage.removeItem('userToken');
            router.replace('/pages/autentikasi/login');
        }
    };

    const confirmLogout = () => {
        Alert.alert(
            'Keluar Akun',
            'Yakin ingin keluar dari akun ini?',
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Keluar', style: 'destructive', onPress: handleLogout },
            ]
        );
    };

    // ── Komponen SettingItem ──
    const SettingItem = ({ icon, title, subtitle, onPress, isSwitch, value, onValueChange, isDestructive }: any) => (
        <TouchableOpacity
            style={styles.settingCard}
            onPress={onPress}
            disabled={isSwitch}
            activeOpacity={0.7}
        >
            <View style={[styles.iconWrapper, isDestructive && styles.destructiveIconBg]}>
                <Text style={styles.settingIcon}>{icon}</Text>
            </View>
            <View style={styles.textWrapper}>
                <Text style={[styles.settingTitle, isDestructive && styles.destructiveText]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                    thumbColor={value ? '#16A34A' : '#F3F4F6'}
                />
            ) : (
                <Text style={styles.chevron}>›</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <MainLayout>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.headerWrapper}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>Pengaturan</Text>
                        <View style={styles.titleUnderline} />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        {loadingProfil ? (
                            <View style={styles.avatarPlaceholder}>
                                <ActivityIndicator color="#16A34A" />
                            </View>
                        ) : (
                            // ✅ Foto dari API, fallback ke inisial nama
                            user?.foto_profil_url ? (
                                <Image
                                    source={{ uri: user.foto_profil_url }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.avatarInitial}>
                                    <Text style={styles.avatarInitialText}>
                                        {user?.name?.charAt(0).toUpperCase() ?? '?'}
                                    </Text>
                                </View>
                            )
                        )}
                        <View style={styles.profileInfo}>
                            {/* ✅ Nama dari API */}
                            <Text style={styles.userName}>
                                {loadingProfil ? '...' : (user?.name ?? '-')}
                            </Text>
                            {/* ✅ Email dari API */}
                            <Text style={styles.userEmail}>
                                {loadingProfil ? '...' : (user?.email ?? '-')}
                            </Text>
                            <TouchableOpacity style={styles.editProfileBtn} onPress={openEdit}>
                                <Text style={styles.editProfileText}>✏️ Edit Profil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Informasi */}
                    <View style={styles.sectionGroup}>
                        <Text style={styles.sectionLabel}>Informasi</Text>
                        <SettingItem icon="📖" title="Panduan Penggunaan" onPress={() => {}} />
                        <SettingItem icon="🛡️" title="Kebijakan Privasi" onPress={() => {}} />
                    </View>

                    {/* Keluar */}
                    <View style={styles.sectionGroup}>
                        <SettingItem
                            icon="🚪"
                            title="Keluar Akun"
                            isDestructive
                            onPress={confirmLogout}
                        />
                    </View>

                    <Text style={styles.versionText}>Versi Aplikasi 1.0.24</Text>
                </ScrollView>
            </View>

            {/* ── Modal Edit Profil ── */}
            <Modal visible={editVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>

                        <Text style={styles.modalTitle}>Edit Profil</Text>

                        {/* Preview foto */}
                        <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhoto}>
                            {editPhoto ? (
                                <Image source={{ uri: editPhoto }} style={styles.photoPreview} />
                            ) : user?.foto_profil_url ? (
                                <Image source={{ uri: user.foto_profil_url }} style={styles.photoPreview} />
                            ) : (
                                <View style={styles.photoEmpty}>
                                    <Text style={styles.photoEmptyEmoji}>📷</Text>
                                    <Text style={styles.photoEmptyText}>Ketuk untuk ganti foto</Text>
                                </View>
                            )}
                            {/* Overlay kamera */}
                            <View style={styles.cameraOverlay}>
                                <Text style={{ fontSize: 18 }}>📷</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Input nama */}
                        <Text style={styles.inputLabel}>Nama</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Masukkan nama lengkap"
                            placeholderTextColor="#9CA3AF"
                        />

                        {/* Tombol aksi */}
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={styles.btnCancel}
                                onPress={() => setEditVisible(false)}
                            >
                                <Text style={styles.btnCancelText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnSave}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="white" size="small" />
                                    : <Text style={styles.btnSaveText}>Simpan</Text>
                                }
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </MainLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', paddingHorizontal: 15, paddingTop: 10 },
    headerWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { backgroundColor: '#86EFAC', width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    backIcon: { fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: -3 },
    titleContainer: { marginLeft: 15 },
    titleText: { fontSize: 22, fontWeight: 'bold', color: '#16A34A' },
    titleUnderline: { height: 3, backgroundColor: '#16A34A', width: 60, borderRadius: 2, marginTop: 2 },
    scrollContent: { paddingBottom: 30 },

    // Profile card
    profileCard: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 25, alignItems: 'center', marginBottom: 25, elevation: 4 },
    profileImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E5E7EB' },
    avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#86EFAC', justifyContent: 'center', alignItems: 'center' },
    avatarInitialText: { fontSize: 28, fontWeight: '800', color: 'white' },
    profileInfo: { marginLeft: 15, flex: 1 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
    userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    editProfileBtn: { backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#86EFAC' },
    editProfileText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },

    // Settings
    sectionGroup: { marginBottom: 25 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginLeft: 10, marginBottom: 10, textTransform: 'uppercase' },
    settingCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 18, alignItems: 'center', marginBottom: 8 },
    iconWrapper: { width: 40, height: 40, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    settingIcon: { fontSize: 18 },
    textWrapper: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
    settingSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
    chevron: { fontSize: 22, color: '#D1D5DB', fontWeight: 'bold' },
    destructiveIconBg: { backgroundColor: '#FEF2F2' },
    destructiveText: { color: '#EF4444' },
    versionText: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 10 },

    // Modal edit profil
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 20 },

    photoPickerBtn: { alignSelf: 'center', marginBottom: 20, position: 'relative' },
    photoPreview: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#86EFAC' },
    photoEmpty: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#86EFAC', borderStyle: 'dashed' },
    photoEmptyEmoji: { fontSize: 28 },
    photoEmptyText: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
    cameraOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#16A34A', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },

    inputLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#1F2937', marginBottom: 20 },

    modalBtnRow: { flexDirection: 'row', gap: 12 },
    btnCancel: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    btnCancelText: { fontWeight: '700', color: '#374151', fontSize: 14 },
    btnSave: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#16A34A' },
    btnSaveText: { fontWeight: '800', color: 'white', fontSize: 14 },
});
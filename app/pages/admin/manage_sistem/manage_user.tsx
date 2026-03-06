import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
    ActivityIndicator, TextInput, SafeAreaView
} from 'react-native';
import api from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConfirmDialog from '../../../components/ConfirmModal';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    created_at?: string;
}

export default function ManageUsers() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch {
            Alert.alert("Error", "Gagal mengambil data user");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        let result = users;
        if (search) {
            result = result.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterRole !== 'all') {
            result = result.filter(u => u.role === filterRole);
        }
        setFilteredUsers(result);
    }, [search, filterRole, users]);

    const handleDelete = (id: number, name: string) => {
        showConfirm({
            visible: true,
            title: 'Hapus User',
            message: `Yakin ingin menghapus "${name}"?`,
            confirmText: 'Hapus',
            confirmColor: '#DC2626',
            icon: 'trash-outline',
            iconColor: '#DC2626',
            onConfirm: async () => {
                hideConfirm();
                try {
                    await api.delete(`/admin/users/${id}`);
                    fetchUsers();
                } catch {
                    // gunakan console.error atau state error, bukan Alert
                    console.error("Gagal menghapus user");
                }
            },
        });
    };

    const toggleRole = (id: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        showConfirm({
            visible: true,
            title: 'Ubah Role',
            message: `Jadikan ${newRole === 'admin' ? 'Admin' : 'User biasa'}?`,
            confirmText: 'Ya, Ubah',
            confirmColor: '#16A34A',
            icon: 'swap-horizontal-outline',
            iconColor: '#16A34A',
            onConfirm: async () => {
                hideConfirm();
                setTogglingId(id);
                try {
                    await api.put(`/admin/users/${id}/role`, { role: newRole });
                    fetchUsers();
                } catch {
                    console.error("Gagal mengubah role");
                } finally {
                    setTogglingId(null);
                }
            },
        });
    };

    // Hitung summary
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    const getInitial = (name: string) => name?.charAt(0).toUpperCase() ?? '?';
    const getAvatarColor = (role: string) => role === 'admin' ? '#FEE2E2' : '#DBEAFE';
    const getAvatarTextColor = (role: string) => role === 'admin' ? '#B91C1C' : '#1E40AF';

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderItem = ({ item, index }: { item: User; index: number }) => (
        <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
            {/* No */}
            <View style={styles.colNo}>
                <Text style={styles.cellNo}>{index + 1}</Text>
            </View>

            {/* Avatar + Info */}
            <View style={styles.colUser}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.role) }]}>
                    <Text style={[styles.avatarText, { color: getAvatarTextColor(item.role) }]}>
                        {getInitial(item.name)}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                </View>
            </View>

            {/* Role Badge */}
            <View style={styles.colRole}>
                <View style={[
                    styles.roleBadge,
                    { backgroundColor: item.role === 'admin' ? '#FEE2E2' : '#DBEAFE' }
                ]}>
                    <View style={[
                        styles.roleDot,
                        { backgroundColor: item.role === 'admin' ? '#EF4444' : '#3B82F6' }
                    ]} />
                    <Text style={[
                        styles.roleText,
                        { color: item.role === 'admin' ? '#991B1B' : '#1E40AF' }
                    ]}>
                        {item.role === 'admin' ? 'Admin' : 'User'}
                    </Text>
                </View>
            </View>

            {/* Tanggal */}
            <View style={styles.colDate}>
                <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>

            {/* Aksi */}
            <View style={styles.colAction}>
                <TouchableOpacity
                    onPress={() => toggleRole(item.id, item.role)}
                    style={[styles.btnRole, { opacity: togglingId === item.id ? 0.5 : 1 }]}
                    disabled={togglingId === item.id}
                >
                    {togglingId === item.id
                        ? <ActivityIndicator size={12} color="#16A34A" />
                        : <Ionicons name="swap-horizontal-outline" size={14} color="#16A34A" />
                    }
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.btnDel}>
                    <Ionicons name="trash-outline" size={14} color="#DC2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const [confirmDialog, setConfirmDialog] = useState<{
        visible: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        icon?: any;
        iconColor?: string;
        confirmText?: string;
        confirmColor?: string;
    }>({ visible: false, title: '', message: '', onConfirm: () => {} });
    const showConfirm = (config: typeof confirmDialog) => setConfirmDialog(config);
    const hideConfirm = () => setConfirmDialog(prev => ({ ...prev, visible: false }));

    return (
        <SafeAreaView style={styles.container}>

            {/* ─── HEADER ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Kelola Pengguna</Text>
                    <Text style={styles.headerSub}>Manajemen akun & role pengguna</Text>
                </View>
            </View>

            {/* ─── SUMMARY CARDS ─── */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { borderLeftColor: '#6366F1' }]}>
                    <Text style={styles.summaryNum}>{users.length}</Text>
                    <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#EF4444' }]}>
                    <Text style={[styles.summaryNum, { color: '#B91C1C' }]}>{adminCount}</Text>
                    <Text style={styles.summaryLabel}>Admin</Text>
                </View>
                <View style={[styles.summaryCard, { borderLeftColor: '#3B82F6' }]}>
                    <Text style={[styles.summaryNum, { color: '#1E40AF' }]}>{userCount}</Text>
                    <Text style={styles.summaryLabel}>User</Text>
                </View>
            </View>

            {/* ─── SEARCH & FILTER ─── */}
            <View style={styles.searchFilterContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari nama atau email..."
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
                        { key: 'all', label: '👥 Semua' },
                        { key: 'admin', label: '🔴 Admin' },
                        { key: 'user', label: '🔵 User' },
                    ].map(({ key, label }) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setFilterRole(key)}
                            style={[styles.filterChip, filterRole === key && styles.filterChipActive]}
                        >
                            <Text style={[styles.filterText, filterRole === key && styles.filterTextActive]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={{ flex: 1 }} />
                    <Text style={styles.countText}>{filteredUsers.length} akun</Text>
                </View>
            </View>

            {/* ─── TABLE ─── */}
            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#16A34A" />
                    <Text style={styles.loadingText}>Memuat data pengguna...</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.colNo}><Text style={styles.thText}>No</Text></View>
                        <View style={styles.colUser}><Text style={styles.thText}>Pengguna</Text></View>
                        <View style={styles.colRole}><Text style={styles.thText}>Role</Text></View>
                        <View style={styles.colDate}><Text style={styles.thText}>Bergabung</Text></View>
                        <View style={styles.colAction}><Text style={[styles.thText, { textAlign: 'center' }]}>Aksi</Text></View>
                    </View>

                    <FlatList
                        data={filteredUsers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>Tidak Ada Pengguna</Text>
                                <Text style={styles.emptySub}>Coba ubah filter atau kata kunci pencarian</Text>
                            </View>
                        }
                    />
                </View>
            )}
            <ConfirmDialog
                visible={confirmDialog.visible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                confirmColor={confirmDialog.confirmColor}
                icon={confirmDialog.icon}
                iconColor={confirmDialog.iconColor}
                onConfirm={confirmDialog.onConfirm}
                onCancel={hideConfirm}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
        elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    },
    backBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 10 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
    headerSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },

    // Summary Cards
    summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    summaryCard: {
        flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 12,
        borderLeftWidth: 4, elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 },
    },
    summaryNum: { fontSize: 22, fontWeight: '800', color: '#111827' },
    summaryLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },

    // Search & Filter
    searchFilterContainer: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, borderRadius: 10, height: 42, gap: 8 },
    searchInput: { flex: 1, fontSize: 13, color: '#1F2937' },
    filterRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center', gap: 8 },
    filterChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
    filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    filterTextActive: { color: '#166534', fontWeight: '700' },
    countText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

    // Table Header
    tableHeader: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingHorizontal: 12, paddingVertical: 10,
    },
    thText: { fontSize: 11, fontWeight: '700', color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Table Rows
    tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    tableRowEven: { backgroundColor: '#F8FAFC' },

    colNo: { width: 28 },
    colUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 8 },
    colRole: { width: 80 },
    colDate: { width: 80 },
    colAction: { width: 68, flexDirection: 'row', gap: 6, justifyContent: 'center' },

    cellNo: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },

    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 15, fontWeight: '800' },
    userName: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
    userEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

    roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, gap: 4, alignSelf: 'flex-start' },
    roleDot: { width: 6, height: 6, borderRadius: 3 },
    roleText: { fontSize: 11, fontWeight: '700' },

    dateText: { fontSize: 11, color: '#9CA3AF' },

    btnRole: { backgroundColor: '#DCFCE7', padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    btnDel: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

    // Loading & Empty
    loadingBox: { alignItems: 'center', marginTop: 60, gap: 12 },
    loadingText: { color: '#9CA3AF', fontSize: 14 },
    emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
    emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
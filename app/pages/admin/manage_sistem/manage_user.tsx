import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  TextInput,
  SafeAreaView
} from 'react-native';
import api from '../../../services/api'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user'; // Membatasi hanya boleh dua kata ini
  created_at?: string;    // Tanda tanya (?) berarti opsional/boleh tidak ada
}

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, admin, user

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi Search dan Filter
  useEffect(() => {
    let result = users;

    // Filter berdasarkan search
    if (search) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter berdasarkan role
    if (filterRole !== 'all') {
      result = result.filter(u => u.role === filterRole);
    }

    setFilteredUsers(result);
  }, [search, filterRole, users]);

  const handleDelete = (id: number) => {
    Alert.alert("Hapus User", "Yakin ingin menghapus user ini?", [
      { text: "Batal" },
      { text: "Hapus", style: 'destructive', onPress: async () => {
          await api.delete(`/admin/users/${id}`);
          fetchUsers();
        }
      }
    ]);
  };

  const toggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      Alert.alert("Gagal", "Gagal mengubah role");
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, { flex: 2 }]}>Pengguna</Text>
      <Text style={[styles.headerCell, { flex: 1 }]}>Role</Text>
      <Text style={[styles.headerCell, { flex: 1, textAlign: 'right' }]}>Aksi</Text>
    </View>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.tableRow}>
      <View style={{ flex: 2 }}>
        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#FEE2E2' : '#DBEAFE' }]}>
          <Text style={{ color: item.role === 'admin' ? '#B91C1C' : '#1E40AF', fontSize: 10, fontWeight: 'bold' }}>
            {item.role.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => toggleRole(item.id, item.role)} style={styles.iconBtn}>
          <Ionicons name="swap-horizontal" size={18} color="#16A34A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tombol Kembali & Judul */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Pengguna</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Cari nama atau email..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'admin', 'user'].map((r) => (
          <TouchableOpacity 
            key={r} 
            onPress={() => setFilterRole(r)}
            style={[styles.filterBtn, filterRole === r && styles.filterBtnActive]}
          >
            <Text style={[styles.filterBtnText, filterRole === r && styles.filterBtnTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#16A34A" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.tableBox}>
          {renderHeader()}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUserItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Data tidak ditemukan</Text>}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    marginHorizontal: 20, 
    paddingHorizontal: 15, 
    borderRadius: 12,
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  searchInput: { flex: 1, fontSize: 14 },

  filterContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: 15, marginBottom: 10 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, marginRight: 8, backgroundColor: '#E5E7EB' },
  filterBtnActive: { backgroundColor: '#16A34A' },
  filterBtnText: { fontSize: 12, color: '#4B5563', fontWeight: 'bold' },
  filterBtnTextActive: { color: 'white' },

  tableBox: { flex: 1, backgroundColor: 'white', margin: 20, borderRadius: 15, elevation: 3, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerCell: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },
  
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  userName: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
  userEmail: { fontSize: 12, color: '#9CA3AF' },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  
  actionButtons: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  iconBtn: { marginLeft: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#9CA3AF' }
});
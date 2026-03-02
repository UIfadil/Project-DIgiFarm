import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AdminHome() {
    const router = useRouter();
    const [totalUser, setTotalUser] = useState('0');
    const [loading, setLoading] = useState(true)

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/admin/users');
            // Karena /admin/users mengembalikan array user, kita ambil panjang array-nya
            const count = response.data.length;
            setTotalUser(count.toString());
        } catch (error) {
            console.error("Gagal mengambil statistik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const handleLogout = () => {
        // Di sini Anda bisa menghapus session/token jika ada
        router.replace('/pages/autentikasi/login');
    };

    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000); // Update setiap 1 detik

    return () => clearInterval(timer); // Membersihkan interval saat komponen tidak dipakai
    }, []);

    // Formatter untuk tanggal Indonesia
    const formattedDate = currentDateTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Formatter untuk jam (opsional jika ingin menampilkan waktu)
    const formattedTime = currentDateTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

  // Data Mockup Statistik
  const stats = [
        { label: 'Total User', value: totalUser, icon: 'people', color: '#3B82F6' },
        { label: 'Total Penyakit', value: '84', icon: 'medkit-outline', color: '#10B981' },
        { label: 'Total Hama', value: '12', icon: 'bug', color: '#EF4444' },
        { label: 'Total Edukasi', value: '45', icon: 'book', color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
            <Text style={styles.helloText}>Halo, Admin Utama</Text>
            {/* Menampilkan Hari, Tanggal, dan Jam secara Real-time */}
            <Text style={styles.dateText}>{formattedDate} • {formattedTime}</Text>
        </View>

        {/* Statistik Grid */}
        <View style={styles.statsGrid}>
          {stats.map((item, index) => (
                <View key={index} style={styles.statCard}>
                <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                {/* Tampilkan Loading kecil jika data belum ada */}
                {loading && item.label === 'Total User' ? (
                  <ActivityIndicator size="small" color={item.color} />
                ) : (
                  <Text style={styles.statValue}>{item.value}</Text>
                )}
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

        {/* Menu Manajemen */}
        <Text style={styles.sectionTitle}>Manajemen Sistem</Text>

        <View style={styles.menuContainer}>
          <MenuButton 
            title="Kelola Pengguna" 
            icon="people-circle" 
            color="#4B5563" 
            onPress={() => router.push('/pages/admin/manage_sistem/manage_user')} // Jalur Route Anda
          />
          
          <MenuButton 
            title="Database Hama/Penyakit" 
            icon="flask" 
            color="#4B5563" 
            onPress={() => router.push('/pages/admin/manage_sistem/manage_hama_penyakit')}
          />
          
          <MenuButton 
            title="Database Edukasi" 
            icon="book" 
            color="#4B5563" 
            onPress={() => alert('Fitur Database Edukasi sedang disiapkan')}
          />
          
          <MenuButton 
            title="Database Kuis" 
            icon="reader-outline" 
            color="#4B5563" 
            onPress={() => alert('Fitur Database Kuis sedang disiapkan')}
          />
        </View>

        {/* Tambahkan Tombol Logout di bawah sini */}
        <TouchableOpacity 
          style={styles.btnLogout} 
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <View style={styles.btnLogoutContent}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.btnLogoutText}>Keluar dari Panel Admin</Text>
          </View>
        </TouchableOpacity>

        {/* Aktivitas Terbaru */}
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        <View style={styles.recentActivity}>
          {[1, 2, 3].map((_, i) => (
            <View key={i} style={styles.activityItem}>
              <Ionicons name="notifications" size={20} color="#9CA3AF" />
              <View style={styles.activityTextContent}>
                <Text style={styles.activityTitle}>User #882 melakukan Scan</Text>
                <Text style={styles.activityTime}>2 menit yang lalu</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Komponen Kecil untuk Tombol Menu
const MenuButton = ({ title, icon, color, onPress }: { title: string, icon: string, color: string, onPress?: () => void }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuInner}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20 },
  welcomeSection: { marginBottom: 25 },
  helloText: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  dateText: { color: '#6B7280', fontSize: 14 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { 
    backgroundColor: 'white', 
    width: '48%', 
    padding: 15, 
    borderRadius: 20, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15, marginTop: 10 },
  
  menuContainer: { backgroundColor: 'white', borderRadius: 20, padding: 10, marginBottom: 20 },
  menuButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuInner: { flexDirection: 'row', alignItems: 'center' },
  menuText: { marginLeft: 15, fontWeight: '600', color: '#374151' },

  btnLogout: {
    marginTop: 30,
    backgroundColor: '#FEE2E2',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 40,
  },
  btnLogoutContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLogoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },

  recentActivity: { backgroundColor: 'white', borderRadius: 20, padding: 15 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  activityTextContent: { marginLeft: 15 },
  activityTitle: { fontSize: 14, color: '#374151', fontWeight: '500' },
  activityTime: { fontSize: 12, color: '#9CA3AF' },
});
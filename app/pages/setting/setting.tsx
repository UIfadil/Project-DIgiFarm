import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import MainLayout from '../../layout/main_layout';

export default function PengaturanAplikasi() {
  const router = useRouter();
  
  // State untuk switch toggle
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fungsi helper untuk merender item menu
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
          trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
          thumbColor={value ? "#16A34A" : "#F3F4F6"}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <MainLayout>
      <View style={styles.container}>
        
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Pengaturan</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Section */}
          <View style={styles.profileCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Petani Muda</Text>
              <Text style={styles.userEmail}>petanimuda@padi.com</Text>
              <TouchableOpacity style={styles.editProfileBtn}>
                <Text style={styles.editProfileText}>Edit Profil</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Groups */}
          <View style={styles.sectionGroup}>
            <Text style={styles.sectionLabel}>Aplikasi</Text>
            <SettingItem 
              icon="🔔" 
              title="Notifikasi" 
              subtitle="Peringatan hama & jadwal pupuk"
              isSwitch={true}
              value={isNotificationEnabled}
              onValueChange={setIsNotificationEnabled}
            />
            <SettingItem 
              icon="🌙" 
              title="Mode Gelap" 
              isSwitch={true}
              value={isDarkMode}
              onValueChange={setIsDarkMode}
            />
          </View>

          <View style={styles.sectionGroup}>
            <Text style={styles.sectionLabel}>Informasi</Text>
            <SettingItem 
              icon="📖" 
              title="Panduan Penggunaan" 
              onPress={() => {}} 
            />
            <SettingItem 
              icon="🛡️" 
              title="Kebijakan Privasi" 
              onPress={() => {}} 
            />
          </View>

          {/* Keluar Akun Section */}
          <View style={styles.sectionGroup}>
            <SettingItem 
              icon="🚪" 
              title="Keluar Akun" 
              isDestructive={true}
              onPress={() => router.push('/pages/autentikasi/login')} 
            />
          </View>

          <View style={styles.sectionGroup}>
            <SettingItem 
              icon="🚪" 
              title="Tombol sementara ke halaman admin" 
              isDestructive={true}
              onPress={() => router.push('/pages/admin/admin_home')} 
            />
          </View>

          <Text style={styles.versionText}>Versi Aplikasi 1.0.24</Text>
        </ScrollView>
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#86EFAC',
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  backIcon: { fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: -3 },
  titleContainer: { marginLeft: 15 },
  titleText: { fontSize: 22, fontWeight: 'bold', color: '#16A34A' },
  titleUnderline: { height: 3, backgroundColor: '#16A34A', width: 60, borderRadius: 2, marginTop: 2 },
  
  scrollContent: { paddingBottom: 30 },

  /* Profile Card */
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E5E7EB',
  },
  profileInfo: { marginLeft: 15, flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  editProfileBtn: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  editProfileText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },

  /* Settings Items */
  sectionGroup: { marginBottom: 25 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    marginLeft: 10,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingIcon: { fontSize: 18 },
  textWrapper: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  settingSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  chevron: { fontSize: 22, color: '#D1D5DB', fontWeight: 'bold' },
  
  /* Destructive Style */
  destructiveIconBg: { backgroundColor: '#FEF2F2' },
  destructiveText: { color: '#EF4444' },

  versionText: {
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 10,
  },
});
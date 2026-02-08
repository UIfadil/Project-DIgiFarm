import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MainLayout from '../../layout/main_layout';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function EdukasiHome() {
    const router = useRouter();
  const menuEdukasi = [
    {
      id: 1,
      title: 'Edukasi pertanian padi dasar',
      icon: '🌱', // Kamu bisa ganti dengan <Image /> jika ada aset gambar
      path: '/pages/edukasi/edukasi_padi/list_edukasi_padi',
    },
    {
      id: 2,
      title: 'Edukasi hama padi',
      icon: '🐛',
      path: '/pages/edukasi/edukasi_hama/list_edukasi_hama',
    },
    {
      id: 3,
      title: 'Edukasi penyakit padi',
      icon: '🦠',
      path: '/pages/edukasi/edukasi_penyakit/list_edukasi_penyakit',
    },
  ];

  return (
    <MainLayout>
      <View style={styles.container}>
        {/* Kontrol Atas: Back Button & Judul */}
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()} // Berfungsi kembali ke halaman sebelumnya
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleWrapper}>
            <Text style={styles.titleText}>Edukasi</Text>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Container Utama */}
        <View style={styles.mainContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollPadding}
          >
            {menuEdukasi.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card} 
                activeOpacity={0.8}
                // LOGIKA NAVIGASI DI SINI
                onPress={() => item.path && router.push(item.path as any)}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.emoji}>{item.icon}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Latar belakang abu-abu terang agar kontras
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#86EFAC', // Hijau muda soft
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  backIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -4, // Adjust posisi arrow agar center secara visual
  },
  titleWrapper: {
    marginLeft: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  underline: {
    height: 3,
    backgroundColor: '#16A34A',
    width: '100%',
    borderRadius: 2,
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#86EFAC', // Hijau muda sesuai referensi gambar
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30, // Opsional jika ingin melengkung di bawah
    borderBottomRightRadius: 30,
    padding: 20,
    marginBottom: 20,
  },
  scrollPadding: {
    paddingTop: 10,
  },
  card: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
    lineHeight: 20,
  },
});
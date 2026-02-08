import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MainLayout from '../../../layout/main_layout';

const { width } = Dimensions.get('window');

// Data Video - Kamu bisa tambah data di sini
const VIDEO_DATA = [
  {
    id: '1',
    title: 'Tutorial Penanganan Utama',
    desc: 'Dalam video ini, kita akan mempelajari siklus hidup hama dan langkah-langkah praktis untuk membasminya tanpa merusak ekosistem sawah.',
  },
  {
    id: '2',
    title: 'Pembuatan Pestisida Nabati',
    desc: 'Langkah demi langkah membuat cairan pembasmi dari bahan alami seperti daun mimba dan bawang putih yang efektif serta murah meriah.',
  },
  {
    id: '3',
    title: 'Pencegahan Sejak Dini',
    desc: 'Cara memantau lahan di pagi hari untuk mendeteksi keberadaan larva sebelum menjadi serangan hama yang besar.',
  },
];

export default function DetailHama() {
  const router = useRouter();
  const { name, image } = useLocalSearchParams(); 
  const [mode, setMode] = useState<'buku' | 'video'>('buku');

  return (
    <MainLayout>
      <View style={styles.container}>
        
        {/* Header: Back & Nama Hama */}
        <View style={styles.headerWrapper}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{name || 'Detail Hama'}</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        {/* Toggle Mode: Buku vs Video */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'buku' && styles.toggleActive]} 
            onPress={() => setMode('buku')}
          >
            <Text style={[styles.toggleText, mode === 'buku' && styles.textActive]}>📖 Materi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, mode === 'video' && styles.toggleActive]} 
            onPress={() => setMode('video')}
          >
            <Text style={[styles.toggleText, mode === 'video' && styles.textActive]}>🎥 Video</Text>
          </TouchableOpacity>
        </View>

        {/* Panel Konten Utama */}
        <View style={styles.contentPanel}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            {mode === 'buku' ? (
              <View style={styles.bookPage}>
                <View style={styles.imageHeaderWrapper}>
                  <Image 
                    source={{ uri: image as string || 'https://cdn-icons-png.flaticon.com/128/10578/10578952.png' }} 
                    style={styles.hamaImage} 
                  />
                </View>

                <Text style={styles.chapterTitle}>Mengenal {name}</Text>
                <Text style={styles.paragraph}>
                  {name} adalah salah satu kendala utama dalam pertanian padi. 
                  Hama ini biasanya menyerang pada bagian batang atau daun, menyebabkan 
                  penurunan hasil panen secara signifikan jika tidak ditangani dengan cepat.
                </Text>
                
                <View style={styles.divider} />

                <Text style={styles.subTitle}>Cara Penanganan:</Text>
                <View style={styles.listContainer}>
                  <Text style={styles.listItem}>• Gunakan pestisida alami dari daun mimba.</Text>
                  <Text style={styles.listItem}>• Atur pola irigasi agar tidak terlalu lembab.</Text>
                  <Text style={styles.listItem}>• Lakukan rotasi tanaman secara berkala.</Text>
                  <Text style={styles.listItem}>• Pasang perangkap fisik di sekitar sawah.</Text>
                </View>
              </View>
            ) : (
              /* --- MODE VIDEO: SCROLLABLE DENGAN DESAIN BESAR --- */
              <View style={styles.videoPage}>
                {VIDEO_DATA.map((item, index) => (
                  <View key={item.id} style={styles.videoItemContainer}>
                    <Text style={styles.videoSectionTitle}>{index + 1}. {item.title}</Text>
                    
                    <TouchableOpacity style={styles.videoPlaceholder} activeOpacity={0.9}>
                      <View style={styles.playButtonCircle}>
                        <Text style={styles.playEmoji}>▶️</Text>
                      </View>
                      <Text style={styles.videoInnerTitle}>Putar Video {index + 1}</Text>
                    </TouchableOpacity>

                    <View style={styles.videoDescriptionBox}>
                      <Text style={styles.videoDescTitle}>Keterangan:</Text>
                      <Text style={styles.videoDescText}>{item.desc}</Text>
                    </View>
                    
                    {/* Pembatas antar video (opsional) */}
                    {index !== VIDEO_DATA.length - 1 && <View style={styles.videoSeparator} />}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 10 },
  headerWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backButton: { backgroundColor: '#86EFAC', width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  backIcon: { fontSize: 30, color: 'white', fontWeight: 'bold' },
  titleContainer: { marginLeft: 15 },
  titleText: { fontSize: 22, fontWeight: 'bold', color: '#16A34A' },
  titleUnderline: { height: 3, backgroundColor: '#16A34A', width: 60, marginTop: 2 },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 20, borderRadius: 15, padding: 5, marginBottom: 20, elevation: 2 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  toggleActive: { backgroundColor: '#16A34A' },
  toggleText: { fontWeight: 'bold', color: '#9CA3AF', fontSize: 14 },
  textActive: { color: 'white' },

  contentPanel: { flex: 1, backgroundColor: '#86EFAC', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 20, paddingTop: 25 },
  scrollContent: { paddingBottom: 40 },
  
  // Gaya Buku
  bookPage: { backgroundColor: 'white', borderRadius: 25, padding: 20, elevation: 4 },
  imageHeaderWrapper: { width: '100%', height: 180, backgroundColor: '#F0FDF4', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#DCFCE7' },
  hamaImage: { width: 120, height: 120, resizeMode: 'contain' },
  chapterTitle: { fontSize: 22, fontWeight: 'bold', color: '#16A34A', marginBottom: 12 },
  paragraph: { fontSize: 15, color: '#4B5563', lineHeight: 24, textAlign: 'justify' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  subTitle: { fontSize: 17, fontWeight: 'bold', color: '#15803D', marginBottom: 10 },
  listContainer: { paddingLeft: 5 },
  listItem: { fontSize: 15, color: '#4B5563', marginBottom: 8, lineHeight: 22 },

  // Gaya Video (Card Besar)
  videoPage: { width: '100%' },
  videoItemContainer: { marginBottom: 30 }, // Jarak antar item video
  videoSectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#15803D', 
    alignSelf: 'flex-start', 
    marginBottom: 10,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 2
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#1F2937',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    borderWidth: 4,
    borderColor: 'white',
  },
  playButtonCircle: { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  playEmoji: { fontSize: 35, marginLeft: 5 },
  videoInnerTitle: { color: 'white', marginTop: 10, fontWeight: 'bold', fontSize: 14 },
  videoDescriptionBox: { width: '100%', backgroundColor: 'white', borderRadius: 20, padding: 15, marginTop: 15, elevation: 3 },
  videoDescTitle: { fontSize: 14, fontWeight: 'bold', color: '#16A34A', marginBottom: 4 },
  videoDescText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  videoSeparator: { height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 25, width: '50%', alignSelf: 'center' }
});
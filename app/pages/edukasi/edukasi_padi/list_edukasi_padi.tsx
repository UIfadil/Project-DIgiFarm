import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import MainLayout from '../../../layout/main_layout';

// Data Edukasi Budidaya Padi
const DATA_EDUKASI_PADI = [
  { 
    id: '1', 
    name: 'Mengenal Tanaman Padi', 
    desc: 'Apa itu padi dan klasifikasinya',
    image: 'https://images.unsplash.com/photo-1536630596251-b12ba0d7f7dd?w=400' 
  },
  { 
    id: '2', 
    name: 'Persiapan Lahan', 
    desc: 'Cara membajak dan mengolah tanah',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' 
  },
  { 
    id: '3', 
    name: 'Pemilihan Benih Unggul', 
    desc: 'Ciri-ciri benih padi berkualitas',
    image: 'https://images.unsplash.com/photo-1535242208474-9a28972a0d08?w=400' 
  },
  { 
    id: '4', 
    name: 'Proses Penanaman (Tandur)', 
    desc: 'Teknik menanam bibit yang benar',
    image: 'https://images.unsplash.com/photo-1590001158193-79013bd475e1?w=400' 
  },
  { 
    id: '5', 
    name: 'Perawatan & Irigasi', 
    desc: 'Pengaturan air dan pemupukan',
    image: 'https://images.unsplash.com/photo-1563510330-2a9453c57516?w=400' 
  },
  { 
    id: '6', 
    name: 'Masa Panen', 
    desc: 'Cara panen dan penanganan pasca panen',
    image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?w=400' 
  },
];

export default function EdukasiPadi() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Logika Filter
  const filteredEdukasi = DATA_EDUKASI_PADI.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Text style={styles.titleText}>Edukasi Padi</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        {/* Green Panel Area */}
        <View style={styles.greenPanel}>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.searchEmoji}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari materi budidaya..."
                placeholderTextColor="#A5D6A7"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* List Materi (Scrollable) */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
          >
            {filteredEdukasi.length > 0 ? (
              filteredEdukasi.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: '/pages/edukasi/edukasi_padi/detail_edukasi_padi',
                    params: { name: item.name, image: item.image }
                  })}
                >
                  <View style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: item.image }} 
                      style={styles.mainImage} 
                    />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDesc}>{item.desc}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Materi tidak ditemukan 🌾</Text>
              </View>
            )}
          </ScrollView>
        </View>
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
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: '#86EFAC',
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  backIcon: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginTop: -3,
  },
  titleContainer: {
    marginLeft: 15,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  titleUnderline: {
    height: 3,
    backgroundColor: '#16A34A',
    width: 70,
    borderRadius: 2,
    marginTop: 2,
  },
  greenPanel: {
    flex: 1,
    backgroundColor: '#86EFAC',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 15,
  },
  searchContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: 50,
    elevation: 4,
  },
  searchEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#16A34A',
    fontWeight: '600',
  },
  listPadding: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 5,
  },
  imageWrapper: {
    width: 65,
    height: 65,
    backgroundColor: '#F0FDF4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textWrapper: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
  },
  itemDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#86EFAC',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
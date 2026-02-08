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

// Mock Data Hama
const DATA_HAMA = [
  { id: '1', name: 'Tikus', image: 'https://cdn-icons-png.flaticon.com/128/11879/11879957.png' },
  { id: '2', name: 'Keong', image: 'https://cdn-icons-png.flaticon.com/128/1717/1717833.png' },
  { id: '3', name: 'Belalang', image: 'https://cdn-icons-png.flaticon.com/128/2233/2233787.png' },
  { id: '4', name: 'Wereng', image: 'https://cdn-icons-png.flaticon.com/128/6961/6961487.png' },
  { id: '5', name: 'Ulat', image: 'https://cdn-icons-png.flaticon.com/128/10578/10578952.png' },
  { id: '6', name: 'Walang Sangit', image: 'https://cdn-icons-png.flaticon.com/128/3186/3186092.png' },
];

export default function EdukasiHama() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Logika Filter
  const filteredHama = DATA_HAMA.filter((hama) =>
    hama.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Text style={styles.titleText}>Edukasi Hama</Text>
            <View style={styles.titleUnderline} />
          </View>
        </View>

        {/* Green Panel Area */}
        <View style={styles.greenPanel}>
          
          {/* Search / Filter Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.searchEmoji}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari hama..."
                placeholderTextColor="#A5D6A7"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* List Hama (Scrollable) */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listPadding}
          >
            {filteredHama.length > 0 ? (
              filteredHama.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.hamaCard}
                    activeOpacity={0.8}
                    onPress={() => router.push({
                    pathname: '/pages/edukasi/edukasi_padi/detail_edukasi_padi',
                    params: { name: item.name, image: item.image }
                    })}
                    >
                    <View style={styles.imageWrapper}>
                        <Image 
                        source={{ uri: item.image }} 
                        style={styles.hamaImage} 
                        />
                    </View>
                    <Text style={styles.hamaName}>{item.name}</Text>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Hama tidak ditemukan 🍃</Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
    width: 80,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
  hamaCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#F0FDF4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  hamaImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  hamaName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
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
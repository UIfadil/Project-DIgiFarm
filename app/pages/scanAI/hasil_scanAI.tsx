import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AnalysisResult() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();

  // Data Mockup (Nantinya diganti dengan data dari API AI)
  const resultData = {
    diseaseName: "Hawar Daun Bakteri",
    latinName: "Xanthomonas oryzae",
    accuracy: 98.5,
    status: "Bahaya",
    description: "Penyakit ini menyebabkan daun menguning dan mengering mulai dari ujung daun. Jika dibiarkan, dapat menurunkan hasil panen hingga 50%.",
    actions: [
      "Gunakan pupuk dengan kadar Nitrogen rendah",
      "Pastikan drainase sawah berjalan baik",
      "Semprotkan bakterisida berbahan aktif tembaga"
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={true} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri as string || 'https://via.placeholder.com/400' }} style={styles.scannedImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.badgeAccuracy}>
            <Text style={styles.accuracyText}>Akurasi {resultData.accuracy}%</Text>
          </View>
        </View>

        {/* Result Content */}
        <View style={styles.contentCard}>
          <View style={styles.headerResult}>
            <View>
              <Text style={styles.statusLabel}>{resultData.status}</Text>
              <Text style={styles.diseaseName}>{resultData.diseaseName}</Text>
              <Text style={styles.latinName}>{resultData.latinName}</Text>
            </View>
            <View style={styles.iconWarning}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Tentang Penyakit</Text>
          <Text style={styles.descriptionText}>{resultData.description}</Text>

          <Text style={styles.sectionTitle}>Tindakan yang Disarankan</Text>
          {resultData.actions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}

          {/* Action Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.btnChatExpert}>
              <Ionicons name="chatbubbles" size={20} color="white" />
              <Text style={styles.btnChatText}>Tanya Ahli</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.btnHome} 
              onPress={() => router.replace('/pages/scanAI/scanAI_home')}
            >
              <Text style={styles.btnHomeText}>Selesai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  imageContainer: { width: '100%', height: 350, position: 'relative' },
  scannedImage: { width: '100%', height: '100%' },
  backButton: { 
    position: 'absolute', top: 50, left: 20, 
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 
  },
  badgeAccuracy: { 
    position: 'absolute', bottom: 30, right: 20, 
    backgroundColor: '#16A34A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 
  },
  accuracyText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  
  contentCard: { 
    backgroundColor: 'white', marginTop: -25, borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, padding: 25, shadowColor: '#000', 
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 
  },
  headerResult: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { 
    color: '#EF4444', fontWeight: '900', fontSize: 12, 
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 
  },
  diseaseName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  latinName: { fontSize: 14, fontStyle: 'italic', color: '#6B7280' },
  iconWarning: { backgroundColor: '#FEE2E2', padding: 10, borderRadius: 15 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginTop: 10 },
  descriptionText: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 15 },
  
  actionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actionText: { marginLeft: 10, fontSize: 14, color: '#374151', flex: 1 },
  
  footerButtons: { marginTop: 30, flexDirection: 'row', gap: 10 },
  btnChatExpert: { 
    flex: 1.5, backgroundColor: '#16A34A', flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 15 
  },
  btnChatText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  btnHome: { 
    flex: 1, borderWidth: 2, borderColor: '#E5E7EB', 
    justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 15 
  },
  btnHomeText: { color: '#6B7280', fontWeight: 'bold' }
});
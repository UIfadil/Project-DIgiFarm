import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    // Navigasi ke halaman dashboard
    router.replace('/pages/dashboard');
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1} 
      onPress={handleStart}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Lingkaran Putih Logo */}
        <View style={styles.logoCircle}>
          {/* Ganti source sesuai path logo kamu */}
          <View style={styles.iconPlaceholder}>
             <Text style={{ fontSize: 60 }}>☁️</Text>
          </View>
          <Text style={styles.logoText}>DigiFarm</Text>
        </View>

        {/* Teks Instruksi */}
        <Text style={styles.instructionText}>
          Tekan mana saja untuk mulai
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#72d89b', // Warna hijau muda sesuai gambar
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: width * 0.65, // Ukuran responsif berdasarkan lebar layar
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    // Memberikan sedikit bayangan halus
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 40,
  },
  iconPlaceholder: {
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#72d89b', // Warna teks sama dengan background layar
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
  },
});
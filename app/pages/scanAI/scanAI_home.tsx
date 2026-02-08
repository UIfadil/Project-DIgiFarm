import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Pastikan sudah install expo-icons

const { width, height } = Dimensions.get('window');

export default function ScanAIHome() {
  const router = useRouter();
  const cameraRef = useRef<any>(null); // Ref untuk kamera
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  // Fungsi saat tombol shutter ditekan
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // Ambil foto
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        
        // Munculkan Alert
        alert('Foto berhasil diambil! Tekan OK untuk melihat hasil.');
        
        // Navigasi ke halaman hasil dengan membawa URI foto
        router.push({
          pathname: '/pages/scanAI/hasil_scanAI',
          params: { imageUri: photo.uri }
        });
      } catch (e) {
        console.log(e);
        alert('Gagal mengambil gambar');
      }
    }
  };

  // Fungsi Fitur Upload Gambar
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Arahkan ke halaman hasil analisa dengan mengirimkan URI gambar
      router.push({
        pathname: '/pages/scanAI/hasil_scanAI',
        params: { imageUri: result.assets[0].uri }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Tampilan Kamera */}
      <CameraView 
        ref={cameraRef} 
        style={styles.camera} 
        facing="back" 
        flash={flash}
      >
        
        {/* Overlay Bingkai Scan */}
        <View style={styles.overlay}>
          {/* Header Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')} 
              style={styles.iconCircle}
            >
              <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Frame Tengah (Target Scan) */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.hintText}>Posisikan tanaman di dalam kotak</Text>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="images" size={28} color="white" />
              <Text style={styles.bottomLabel}>Galeri</Text>
            </TouchableOpacity>

            {/* 2. Ganti onPress dengan fungsi takePicture */}
            <TouchableOpacity 
              style={styles.shutterButton} 
              onPress={takePicture}
              activeOpacity={0.7}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.historyButton}>
              <Ionicons name="time" size={28} color="white" />
              <Text style={styles.bottomLabel}>Riwayat</Text>
            </TouchableOpacity>
          </View>

        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'space-between', paddingVertical: 40 },
  
  topControls: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  scanFrameContainer: { alignItems: 'center' },
  scanFrame: { width: width * 0.7, height: width * 0.7, position: 'relative' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#16A34A', borderWidth: 5 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hintText: { color: 'white', marginTop: 20, fontWeight: 'bold', textShadowColor: 'black', textShadowRadius: 2 },

  bottomControls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  bottomLabel: { color: 'white', fontSize: 12, marginTop: 5 },
  galleryButton: { alignItems: 'center' },
  historyButton: { alignItems: 'center' },
  shutterButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: 'white' },

  containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  textWarning: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  btnPermission: { backgroundColor: '#16A34A', padding: 15, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: 'bold' }
});
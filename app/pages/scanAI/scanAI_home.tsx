import { Ionicons } from "@expo/vector-icons"; // Pastikan sudah install expo-icons
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ScanAIHome() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<any>(null); // Ref untuk kamera
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");

  // Fungsi saat tombol shutter ditekan
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });

        await uploadToAI(photo.uri);
      } catch (e) {
        console.log(e);
        alert("Gagal mengambil gambar");
      }
    }
  };

  // Fungsi Fitur Upload Gambar
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      await uploadToAI(result.assets[0].uri);
    }
  };

  const uploadToAI = async (imageUri: string) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      let formData = new FormData();

      formData.append("image", {
        uri: imageUri,
        name: "scan.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch("http://192.168.2.155:8000/api/predict", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();

      console.log("RAW RESPONSE:", text);

      if (!response.ok) {
        throw new Error(text);
      }

      const data = JSON.parse(text);

      console.log("HASIL AI:", data);

      router.push({
        pathname: "/pages/scanAI/hasil_scanAI",
        params: {
          imageUri: imageUri,
          result: JSON.stringify(data),
        },
      });
    } catch (error) {
      console.log(error);
      alert("Gagal scan AI");
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.textWarning}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCenter}>
        <Text style={styles.textWarning}>Izin kamera diperlukan</Text>

        <TouchableOpacity
          style={styles.btnPermission}
          onPress={requestPermission}
        >
          <Text style={styles.btnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.iconCircle}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFlash(flash === "off" ? "on" : "off")}
              style={styles.iconCircle}
            >
              <Ionicons
                name={flash === "on" ? "flash" : "flash-off"}
                size={22}
                color="white"
              />
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
            <Text style={styles.hintText}>
              Posisikan tanaman di dalam kotak
            </Text>

            {loading && (
              <Text style={{ color: "white", marginTop: 10 }}>
                Sedang menganalisa...
              </Text>
            )}
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
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "space-between",
    paddingVertical: 40,
  },

  topControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  scanFrameContainer: { alignItems: "center" },
  scanFrame: { width: width * 0.7, height: width * 0.7, position: "relative" },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#16A34A",
    borderWidth: 5,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  hintText: {
    color: "white",
    marginTop: 20,
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowRadius: 2,
  },

  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  bottomLabel: { color: "white", fontSize: 12, marginTop: 5 },
  galleryButton: { alignItems: "center" },
  historyButton: { alignItems: "center" },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "white",
  },

  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  textWarning: { textAlign: "center", marginBottom: 20, fontSize: 16 },
  btnPermission: { backgroundColor: "#16A34A", padding: 15, borderRadius: 10 },
  btnText: { color: "white", fontWeight: "bold" },
});

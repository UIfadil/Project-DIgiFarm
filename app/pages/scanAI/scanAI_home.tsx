import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.7;

export default function ScanAIHome() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        await uploadToAI(photo.uri);
      } catch (e) {
        alert("Gagal mengambil gambar");
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) await uploadToAI(result.assets[0].uri);
  };

  const uploadToAI = async (imageUri: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: "scan.jpg",
        type: "image/jpeg",
      } as any);
      const response = await fetch("http://192.168.18.24:8000/api/predict", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      const data = JSON.parse(text);
      router.push({
        pathname: "/pages/scanAI/hasil_scanAI",
        params: { imageUri, result: JSON.stringify(data) },
      });
    } catch (error) {
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
        <Ionicons
          name="camera-outline"
          size={48}
          color="#16A34A"
          style={{ marginBottom: 16 }}
        />
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
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flash}
      >
        {/* ── ZONA 1: TOP (fixed height) ── */}
        <View style={styles.topZone}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconCircle}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Text style={styles.titleText}>Scan Tanaman</Text>
          </View>

          <TouchableOpacity
            onPress={() => setFlash(flash === "off" ? "on" : "off")}
            style={[
              styles.iconCircle,
              flash === "on" && styles.iconCircleActive,
            ]}
          >
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={20}
              color={flash === "on" ? "#facc15" : "white"}
            />
          </TouchableOpacity>
        </View>

        {/* ── ZONA 2: CENTER (flex: 1, bbox di sini, tidak pernah geser) ── */}
        <View style={styles.centerZone}>
          {/* Bbox — ukuran FRAME_SIZE × FRAME_SIZE, posisi absolut di tengah */}
          <View style={styles.scanFrame} pointerEvents="none">
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Hint & loading — di bawah frame, tidak mempengaruhi posisi frame */}
          <View style={styles.hintRow}>
            {loading ? (
              <View style={styles.loadingPill}>
                <ActivityIndicator size="small" color="#4ade80" />
                <Text style={styles.loadingText}>Sedang menganalisa...</Text>
              </View>
            ) : (
              <View style={styles.hintPill}>
                <Ionicons name="leaf-outline" size={14} color="#4ade80" />
                <Text style={styles.hintText}>
                  Posisikan tanaman di dalam kotak
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── ZONA 3: BOTTOM (fixed height) ── */}
        <View style={styles.bottomZone}>
          {/* Galeri */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={pickImage}
            disabled={loading}
          >
            <View style={styles.sideIconWrap}>
              <Ionicons name="images-outline" size={24} color="white" />
            </View>
            <Text style={styles.bottomLabel}>Galeri</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={takePicture}
            activeOpacity={0.75}
            disabled={loading}
          >
            <View style={[styles.shutterInner, loading && { opacity: 0.5 }]} />
          </TouchableOpacity>

          {/* Riwayat */}
          <TouchableOpacity
            style={styles.sideButton}
            disabled={loading}
            onPress={() => router.push("/pages/scanAI/riwayat_scanAI")}
          >
            <View style={styles.sideIconWrap}>
              <Ionicons name="time-outline" size={24} color="white" />
            </View>
            <Text style={styles.bottomLabel}>Riwayat</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Root ── */
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },

  /* ── Zona Top ── */
  topZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52, // safe area iOS; ganti dengan useSafeAreaInsets jika pakai
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleActive: {
    backgroundColor: "rgba(250,204,21,0.15)",
    borderColor: "rgba(250,204,21,0.4)",
  },
  titlePill: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  titleText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* ── Zona Center ── */
  centerZone: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center", // bbox selalu di tengah vertikal zona ini
    gap: 20,
  },
  // Bbox: ukuran TETAP, tidak dipengaruhi konten lain
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "#16A34A",
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  hintRow: { alignItems: "center" },
  hintPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hintText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "500",
  },
  loadingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(74,222,128,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingText: {
    color: "#4ade80",
    fontSize: 13,
    fontWeight: "500",
  },

  /* ── Zona Bottom ── */
  bottomZone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingTop: 20,
    paddingBottom: 40, // safe area; ganti dengan useSafeAreaInsets jika perlu
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sideButton: { alignItems: "center", gap: 6, width: 64 },
  sideIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "500",
  },
  shutterButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "white",
  },

  /* ── Permission screens ── */
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  textWarning: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15,
    color: "#374151",
  },
  btnPermission: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnText: { color: "white", fontWeight: "700", fontSize: 15 },
});

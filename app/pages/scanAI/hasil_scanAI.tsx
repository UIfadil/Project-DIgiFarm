import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const IMAGE_DISPLAY_HEIGHT = 500;

export default function AnalysisResult() {
  const router = useRouter();
  const { imageUri, result } = useLocalSearchParams();
  const parsedResult = result ? JSON.parse(result as string) : null;

  // Simpan layout aktual container gambar (bukan Dimensions)
  const [imageLayout, setImageLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Simpan ukuran asli file gambar
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Bbox hanya dirender setelah keduanya siap
  const bboxReady = imageLayout && naturalSize;

  // Hitung scale & offset untuk resizeMode="cover"
  let scale = 1,
    offsetX = 0,
    offsetY = 0;
  if (bboxReady) {
    const scaleX = imageLayout.width / naturalSize.width;
    const scaleY = imageLayout.height / naturalSize.height;
    // cover = ambil scale terbesar (gambar diperbesar mengisi container)
    scale = Math.max(scaleX, scaleY);
    // Offset: sisa ruang dibagi 2 (gambar dicentrasi)
    offsetX = (imageLayout.width - naturalSize.width * scale) / 2;
    offsetY = (imageLayout.height - naturalSize.height * scale) / 2;
  }

  const diseaseMap: Record<
    string,
    {
      name: string;
      latinName: string;
      status: string;
      description: string;
      actions: string[];
    }
  > = {
    penggerek_batang: {
      name: "Penggerek Batang",
      latinName: "Scirpophaga incertulas",
      status: "Bahaya",
      description:
        "Hama ini menyerang batang padi dan dapat menyebabkan tanaman mati atau gagal panen.",
      actions: [
        "Gunakan perangkap hama",
        "Lakukan sanitasi lahan",
        "Gunakan insektisida sesuai dosis",
      ],
    },
    blast: {
      name: "Blast",
      latinName: "Pyricularia oryzae",
      status: "Bahaya",
      description:
        "Penyakit blast menyerang daun padi dan menyebabkan bercak berbentuk belah ketupat.",
      actions: [
        "Gunakan varietas tahan blast",
        "Kurangi pupuk nitrogen berlebih",
        "Semprot fungisida bila diperlukan",
      ],
    },
    blight: {
      name: "Blight",
      latinName: "Xanthomonas oryzae",
      status: "Bahaya",
      description:
        "Blight menyebabkan daun menguning dan mengering dari ujung daun.",
      actions: [
        "Gunakan benih sehat",
        "Perbaiki drainase sawah",
        "Gunakan bakterisida",
      ],
    },
    wereng_coklat: {
      name: "Wereng Coklat",
      latinName: "Nilaparvata lugens",
      status: "Bahaya",
      description:
        "Wereng coklat menghisap cairan tanaman dan dapat menyebabkan puso.",
      actions: [
        "Kurangi penggunaan pestisida berlebihan",
        "Gunakan musuh alami wereng",
        "Gunakan insektisida sesuai anjuran",
      ],
    },
    tungro: {
      name: "Tungro",
      latinName: "Rice Tungro Virus",
      status: "Bahaya",
      description: "Tungro menyebabkan tanaman kerdil dan daun menguning.",
      actions: [
        "Cabut tanaman terinfeksi",
        "Gunakan varietas tahan tungro",
        "Kendalikan vektor wereng hijau",
      ],
    },
    tikus: {
      name: "Tikus Sawah",
      latinName: "Rattus argentiventer",
      status: "Bahaya",
      description:
        "Tikus menyerang batang dan bulir padi sehingga menyebabkan gagal panen.",
      actions: [
        "Pasang perangkap tikus",
        "Lakukan gropyokan",
        "Jaga kebersihan area sawah",
      ],
    },
  };

  const detections = parsedResult?.detections || [];
  const detection = detections[0];
  const diseaseInfo = detection ? diseaseMap[detection.class] : null;

  const resultData = {
    diseaseName: diseaseInfo?.name || "Tidak terdeteksi",
    latinName: diseaseInfo?.latinName || "-",
    accuracy: detection ? (detection.confidence * 100).toFixed(1) : 0,
    status: diseaseInfo?.status || "Aman",
    description:
      diseaseInfo?.description ||
      "Tidak ada penyakit atau hama yang terdeteksi.",
    actions: diseaseInfo?.actions ?? ["Tanaman terlihat sehat"],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gambar + bbox — tidak scroll */}
      <View
        style={styles.imageContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setImageLayout({ width, height });
        }}
      >
        <Image
          source={{ uri: imageUri as string }}
          style={styles.scannedImage}
          resizeMode="cover"
          onLoad={(e) => {
            const { width, height } = e.nativeEvent.source;
            setNaturalSize({ width, height });
          }}
        />

        {bboxReady &&
          detections.map((item: any, index: number) => {
            const [x1, y1, x2, y2] = item.bbox;
            const left = x1 * scale + offsetX;
            const top = y1 * scale + offsetY;
            const bWidth = (x2 - x1) * scale;
            const bHeight = (y2 - y1) * scale;
            const clampedLeft = Math.max(0, left);
            const clampedTop = Math.max(0, top);
            const clampedWidth = Math.min(
              bWidth,
              imageLayout.width - clampedLeft,
            );
            const clampedHeight = Math.min(
              bHeight,
              imageLayout.height - clampedTop,
            );

            return (
              <View
                key={index}
                style={{
                  position: "absolute",
                  left: clampedLeft,
                  top: clampedTop,
                  width: clampedWidth,
                  height: clampedHeight,
                  borderWidth: 2.5,
                  borderColor: "#22C55E",
                  borderRadius: 6,
                }}
                pointerEvents="none"
              >
                <View style={styles.bboxLabel}>
                  <Text style={styles.bboxLabelText}>
                    {item.class} ({(item.confidence * 100).toFixed(1)}%)
                  </Text>
                </View>
              </View>
            );
          })}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.badgeAccuracy}>
          <Text style={styles.accuracyText}>
            Akurasi {resultData.accuracy}%
          </Text>
        </View>
      </View>

      {/* Card — flex: 1 mengisi sisa layar */}
      <View style={styles.contentCard}>
        {/* Konten scrollable */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* Header */}
          <View style={styles.headerResult}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.statusLabel}>{resultData.status}</Text>
              <Text style={styles.diseaseName}>{resultData.diseaseName}</Text>
              <Text style={styles.latinName}>{resultData.latinName}</Text>
            </View>
            <View style={styles.iconWarning}>
              <Ionicons name="alert-circle" size={36} color="#EF4444" />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Tentang Penyakit</Text>
          <Text style={styles.descriptionText}>{resultData.description}</Text>

          <Text style={styles.sectionTitle}>Tindakan yang Disarankan</Text>
          {resultData.actions.map((action: string, index: number) => (
            <View key={index} style={styles.actionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Footer tombol — selalu di bawah, tidak ikut scroll */}
        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={styles.btnChatExpert}
            onPress={() => router.push("/pages/scanAI/riwayat_scanAI")}
          >
            <Ionicons name="chatbubbles" size={18} color="white" />
            <Text style={styles.btnChatText}>Lihat Riwayat AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnHome}
            onPress={() => router.replace("/pages/dashboard")}
          >
            <Text style={styles.btnHomeText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  imageContainer: {
    width: "100%",
    height: IMAGE_DISPLAY_HEIGHT,
    position: "relative",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  scannedImage: { width: "100%", height: "100%" },

  bboxLabel: {
    position: "absolute",
    top: -1,
    left: -1,
    backgroundColor: "#22C55E",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 5,
  },
  bboxLabelText: { color: "white", fontSize: 10, fontWeight: "700" },

  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 12,
  },
  badgeAccuracy: {
    position: "absolute",
    bottom: 20,
    right: 16,
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  accuracyText: { color: "white", fontWeight: "700", fontSize: 12 },

  // Card mengisi sisa layar setelah gambar
  contentCard: {
    flex: 1, // ← isi sisa layar
    backgroundColor: "white",
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 0, // footer yang handle padding bawah
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  headerResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "#EF4444",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  diseaseName: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  latinName: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#6B7280",
    marginTop: 2,
  },
  iconWarning: { backgroundColor: "#FEE2E2", padding: 10, borderRadius: 14 },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 18 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },

  // Footer tombol fixed di bawah card
  footerButtons: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "white",
  },
  btnChatExpert: {
    flex: 1.5,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  btnChatText: { color: "white", fontWeight: "700", fontSize: 14 },
  btnHome: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 14,
  },
  btnHomeText: { color: "#6B7280", fontWeight: "700", fontSize: 14 },
});

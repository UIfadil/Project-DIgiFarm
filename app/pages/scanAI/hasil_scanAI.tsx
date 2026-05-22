import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Dimensions,
  Image,
  Image as RNImage,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;
const imageHeight = 500;

export default function AnalysisResult() {
  const router = useRouter();
  const { imageUri, result } = useLocalSearchParams();
  const parsedResult = result ? JSON.parse(result as string) : null;

  const diseaseMap: any = {
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

  const [imageSize, setImageSize] = useState({
    width: 1,
    height: 1,
  });

  useEffect(() => {
    if (imageUri) {
      RNImage.getSize(
        imageUri as string,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => console.log("Gagal ambil ukuran gambar:", error),
      );
    }
  }, [imageUri]);

  const detections = parsedResult?.detections || [];
  const detection = detections[0];
  const scaleX = screenWidth / imageSize.width;
  const scaleY = imageHeight / imageSize.height;

  // Untuk resizeMode="cover", ambil scale terbesar
  const scale = Math.max(scaleX, scaleY);

  // Hitung offset karena gambar di-center setelah di-crop
  const offsetX = (screenWidth - imageSize.width * scale) / 2;
  const offsetY = (imageHeight - imageSize.height * scale) / 2;

  console.log({ scaleX, scaleY, scale, offsetX, offsetY, imageSize });

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
      <ScrollView bounces={true} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: (imageUri as string) || "https://via.placeholder.com/400",
              }}
              style={styles.scannedImage}
              resizeMode="cover"
            />

            {/* Multiple Bounding Box */}
            {parsedResult?.detections?.map((item: any, index: number) => {
              const [x1, y1, x2, y2] = item.bbox;
              const padding = 15;

              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    left: x1 * scale + offsetX - padding,
                    top: y1 * scale + offsetY - padding,
                    width: (x2 - x1) * scale + padding * 2,
                    height: (y2 - y1) * scale + padding * 2,
                    borderWidth: 3,
                    borderColor: "#22C55E",
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#22C55E",
                      alignSelf: "flex-start",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderBottomRightRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: "bold",
                      }}
                    >
                      {item.class} ({(item.confidence * 100).toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.badgeAccuracy}>
            <Text style={styles.accuracyText}>
              Akurasi {resultData.accuracy}%
            </Text>
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
          {resultData.actions.map((action: string, index: number) => (
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
              onPress={() => router.replace("/pages/dashboard")}
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
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  imageContainer: { width: "100%", height: 500, position: "relative" },
  scannedImage: { width: "100%", height: "100%" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 12,
  },
  badgeAccuracy: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#16A34A",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  accuracyText: { color: "white", fontWeight: "bold", fontSize: 12 },

  contentCard: {
    backgroundColor: "white",
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "#EF4444",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  diseaseName: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  latinName: { fontSize: 14, fontStyle: "italic", color: "#6B7280" },
  iconWarning: { backgroundColor: "#FEE2E2", padding: 10, borderRadius: 15 },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 15,
  },

  actionItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  actionText: { marginLeft: 10, fontSize: 14, color: "#374151", flex: 1 },

  footerButtons: { marginTop: 30, flexDirection: "row", gap: 10 },
  btnChatExpert: {
    flex: 1.5,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
  },
  btnChatText: { color: "white", fontWeight: "bold", marginLeft: 8 },
  btnHome: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
  },
  btnHomeText: { color: "#6B7280", fontWeight: "bold" },
  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
});

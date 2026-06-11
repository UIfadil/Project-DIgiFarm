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

const { width } = Dimensions.get("window");

// ── STATUS CONFIG — sesuai semua kemungkinan nilai dari controller ──
const statusConfig: Record<
  string,
  { color: string; bg: string; border: string; iconName: string }
> = {
  "Sangat Bahaya": {
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    iconName: "alert-circle",
  },
  Bahaya: {
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    iconName: "alert-circle",
  },
  Waspada: {
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    iconName: "warning",
  },
  Aman: {
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    iconName: "checkmark-circle",
  },
};

const kategoriConfig: Record<string, { color: string; bg: string }> = {
  Hama: { color: "#DC2626", bg: "#FEE2E2" },
  Penyakit: { color: "#D97706", bg: "#FEF3C7" },
  "Hama dan Penyakit": { color: "#7C3AED", bg: "#EDE9FE" },
  Normal: { color: "#059669", bg: "#D1FAE5" },
  "Tidak Dikenal": { color: "#6B7280", bg: "#F3F4F6" },
};

export default function HasilScanAI() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ── PARSING PARAMS dari scanAI_home.tsx ──────────────────────────
  // router.push({ params: { imageUri, result: JSON.stringify(data) } })
  const imageUri = params.imageUri as string;
  const rawResult = params.result as string;

  let parsedResult: any = null;
  try {
    parsedResult = JSON.parse(rawResult);
  } catch {
    parsedResult = null;
  }

  // ── EKSTRAK DATA dari response controller ─────────────────────────
  // Controller format:
  // { status, detections: [...], summary: { disease_name, latin_name,
  //   accuracy (sudah persen), status, kategori, description, actions,
  //   safety_warning, foto, bbox_image } }
  const detections: any[] = parsedResult?.detections ?? [];
  const summary = parsedResult?.summary ?? {};

  const diseaseName = summary.disease_name ?? "Tanaman Sehat / Normal";
  const latinName = summary.latin_name ?? "-";
  // accuracy dari controller sudah dalam persen (misal 88.5), langsung pakai
  const accuracy =
    summary.accuracy != null ? Number(summary.accuracy).toFixed(1) : "100.0";
  const status = summary.status ?? "Aman";
  const kategori = summary.kategori ?? "Normal";
  const description = summary.description ?? "";
  const actions: string[] = summary.actions ?? [];
  const safetyWarning: string | null = summary.safety_warning ?? null;
  // Gunakan foto dari summary jika ada (URL dari storage Laravel),
  // fallback ke imageUri lokal yang dikirim dari kamera
  const displayImageUri = summary.foto ?? imageUri;

  // ── BOUNDING BOX — hitung ulang berdasarkan ukuran frame gambar ───
  const IMAGE_HEIGHT = width * 0.75;
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const sc = statusConfig[status] ?? statusConfig["Aman"];
  const kc = kategoriConfig[kategori] ?? { color: "#6B7280", bg: "#F3F4F6" };

  // ── RENDER BOUNDING BOX ───────────────────────────────────────────
  // controller: bbox = [x1, y1, x2, y2] dalam koordinat piksel asli gambar
  const renderBoundingBoxes = () => {
    if (!naturalSize || detections.length === 0) return null;

    const scaleX = width / naturalSize.width;
    const scaleY = IMAGE_HEIGHT / naturalSize.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (width - naturalSize.width * scale) / 2;
    const offsetY = (IMAGE_HEIGHT - naturalSize.height * scale) / 2;

    return detections.map((det: any, index: number) => {
      if (!det.bbox || det.bbox.length < 4) return null;
      const [x1, y1, x2, y2] = det.bbox;

      const left = x1 * scale + offsetX;
      const top = y1 * scale + offsetY;
      const bWidth = (x2 - x1) * scale;
      const bHeight = (y2 - y1) * scale;

      // Clamp agar tidak keluar batas gambar
      const clampedLeft = Math.max(0, left);
      const clampedTop = Math.max(0, top);
      const clampedWidth = Math.min(bWidth, width - clampedLeft);
      const clampedHeight = Math.min(bHeight, IMAGE_HEIGHT - clampedTop);

      // Warna box sesuai status deteksi individual
      const detSc = statusConfig[det.status ?? status] ?? statusConfig["Aman"];

      return (
        <View
          key={index}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: clampedLeft,
            top: clampedTop,
            width: clampedWidth,
            height: clampedHeight,
            borderWidth: 2.5,
            borderColor: detSc.color,
            borderRadius: 6,
          }}
        >
          <View style={[styles.bboxLabel, { backgroundColor: detSc.color }]}>
            <Text style={styles.bboxLabelText}>
              {/* confidence dari controller sudah dalam persen */}
              {det.name ?? det.class} ({Number(det.confidence).toFixed(1)}%)
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      {/* ── ZONA GAMBAR + BOUNDING BOX ────────────────────────────── */}
      <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
        <Image
          source={{ uri: displayImageUri }}
          style={styles.image}
          resizeMode="contain"
          onLoad={(e) => {
            const { width: w, height: h } = e.nativeEvent.source;
            setNaturalSize({ width: w, height: h });
          }}
        />

        {renderBoundingBoxes()}

        {/* Tombol back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="white" />
        </TouchableOpacity>

        {/* Badge akurasi */}
        <View style={styles.badgeAccuracy}>
          <Text style={styles.badgeAccuracyText}>Akurasi {accuracy}%</Text>
        </View>
      </View>

      {/* ── CARD HASIL (dapat di-scroll) ──────────────────────────── */}
      <View style={styles.card}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardScroll}
        >
          {/* Header diagnosa */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.statusLabel, { color: sc.color }]}>
                {status}
              </Text>
              <Text style={styles.diseaseName}>{diseaseName}</Text>
              <Text style={styles.latinName}>{latinName}</Text>
            </View>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: sc.bg, borderColor: sc.border },
              ]}
            >
              <Ionicons name={sc.iconName as any} size={34} color={sc.color} />
            </View>
          </View>

          {/* Badge kategori */}
          <View style={[styles.kategoriBadge, { backgroundColor: kc.bg }]}>
            <Text style={[styles.kategoriText, { color: kc.color }]}>
              {kategori}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Safety Warning — hanya tampil jika multi-kelas terdeteksi */}
          {safetyWarning ? (
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={18} color="#92400E" />
              <Text style={styles.warningText}>{safetyWarning}</Text>
            </View>
          ) : null}

          {/* Deskripsi */}
          <Text style={styles.sectionTitle}>Tentang Patologi</Text>
          <Text style={styles.descText}>{description}</Text>

          {/* Tindakan */}
          <Text style={styles.sectionTitle}>Tindakan Pengendalian</Text>
          {actions.map((action: string, i: number) => (
            <View key={i} style={styles.actionItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#16A34A"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}

          {/* Deteksi individual (jika multi-kelas) */}
          {detections.length > 1 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Semua Deteksi ({detections.length} kelas)
              </Text>
              {detections.map((det: any, i: number) => {
                const detSc =
                  statusConfig[det.status ?? "Waspada"] ?? statusConfig["Aman"];
                return (
                  <View key={i} style={styles.detectionItem}>
                    <View
                      style={[
                        styles.detectionDot,
                        { backgroundColor: detSc.color },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detectionName}>
                        {det.name ?? det.class}
                      </Text>
                      <Text style={styles.detectionMeta}>
                        {det.latin_name} · {Number(det.confidence).toFixed(1)}%
                        keyakinan
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.detectionBadge,
                        { backgroundColor: detSc.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.detectionBadgeText,
                          { color: detSc.color },
                        ]}
                      >
                        {det.status}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>

        {/* Footer tombol */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btnRiwayat}
            onPress={() => router.push("/pages/scanAI/riwayat_scanAI")}
          >
            <Ionicons name="time-outline" size={16} color="white" />
            <Text style={styles.btnRiwayatText}>Riwayat Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSelesai}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.btnSelesaiText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },

  /* ── Gambar ── */
  imageContainer: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeAccuracy: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeAccuracyText: { color: "white", fontWeight: "700", fontSize: 12 },

  /* ── Bounding Box ── */
  bboxLabel: {
    position: "absolute",
    top: -1,
    left: -1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderTopLeftRadius: 5,
    borderBottomRightRadius: 6,
  },
  bboxLabelText: { color: "white", fontSize: 10, fontWeight: "700" },

  /* ── Card ── */
  card: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    overflow: "hidden",
  },
  cardScroll: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 16,
  },

  /* ── Header Diagnosa ── */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 26,
  },
  latinName: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#9CA3AF",
    marginTop: 3,
  },
  iconBox: {
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
  },

  /* ── Kategori Badge ── */
  kategoriBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  kategoriText: { fontSize: 11, fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 16 },

  /* ── Safety Warning ── */
  warningBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
    fontWeight: "600",
  },

  /* ── Konten ── */
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 21,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  actionText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },

  /* ── Deteksi Individual (multi-kelas) ── */
  detectionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  detectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  detectionName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  detectionMeta: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 2,
  },
  detectionBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  detectionBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  /* ── Footer ── */
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "white",
  },
  btnRiwayat: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnRiwayatText: { color: "white", fontWeight: "700", fontSize: 13 },
  btnSelesai: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnSelesaiText: { color: "#6B7280", fontWeight: "700", fontSize: 13 },
});

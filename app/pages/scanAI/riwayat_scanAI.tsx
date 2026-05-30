import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import api from "../../services/api";

// ── STATUS CONFIG ────────────────────────────────────────────────
const statusConfig: Record<
  string,
  { color: string; bg: string; icon: string }
> = {
  Bahaya: { color: "#EF4444", bg: "#FEE2E2", icon: "alert-circle" },
  Waspada: { color: "#F59E0B", bg: "#FEF3C7", icon: "warning" },
  Sehat: { color: "#16A34A", bg: "#D1FAE5", icon: "checkmark-circle" },
};

const kategoriConfig: Record<string, { color: string; bg: string }> = {
  Hama: { color: "#DC2626", bg: "#FEE2E2" },
  Penyakit: { color: "#D97706", bg: "#FEF3C7" },
  Sehat: { color: "#059669", bg: "#D1FAE5" },
};

// ── MODAL DETAIL ─────────────────────────────────────────────────
function ModalDetail({
  item,
  onClose,
  onDelete,
}: {
  item: any;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const [imageLayout, setImageLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setImageLayout(null);
    setNaturalSize(null);
  }, [item?.id]);

  if (!item) return null;

  const sc = statusConfig[item.status] ?? statusConfig["Sehat"];
  const bboxReady = imageLayout && naturalSize;

  let scale = 1,
    offsetX = 0,
    offsetY = 0;
  if (bboxReady) {
    const scaleX = imageLayout.width / naturalSize.width;
    const scaleY = imageLayout.height / naturalSize.height;
    scale = Math.min(scaleX, scaleY);
    offsetX = (imageLayout.width - naturalSize.width * scale) / 2;
    offsetY = (imageLayout.height - naturalSize.height * scale) / 2;
  }

  // Dukung detections array MAUPUN bbox single dari backend
  const detections: any[] =
    item.detections && item.detections.length > 0
      ? item.detections
      : item.bbox
        ? [
            {
              bbox: item.bbox,
              class: item.disease_name,
              confidence: item.accuracy / 100,
            },
          ]
        : [];

  return (
    <Modal visible={!!item} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafe}>
          {/* FOTO + BBOX */}
          <View
            style={styles.imageContainer}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setImageLayout({ width, height });
            }}
          >
            <Image
              source={{ uri: item.foto }}
              style={styles.scannedImage}
              resizeMode="contain"
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                setNaturalSize({ width, height });
              }}
            />

            {bboxReady &&
              detections.map((det: any, index: number) => {
                const [x1, y1, x2, y2] = det.bbox;
                const left = x1 * scale + offsetX;
                const top = y1 * scale + offsetY;
                const bWidth = (x2 - x1) * scale;
                const bHeight = (y2 - y1) * scale;
                const clampedLeft = Math.max(0, left);
                const clampedTop = Math.max(0, top);
                const clampedWidth = Math.min(
                  bWidth,
                  imageLayout!.width - clampedLeft,
                );
                const clampedHeight = Math.min(
                  bHeight,
                  imageLayout!.height - clampedTop,
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
                      borderColor: sc.color,
                      borderRadius: 6,
                    }}
                    pointerEvents="none"
                  >
                    <View
                      style={[styles.bboxLabel, { backgroundColor: sc.color }]}
                    >
                      <Text style={styles.bboxLabelText}>
                        {det.class} ({(det.confidence * 100).toFixed(1)}%)
                      </Text>
                    </View>
                  </View>
                );
              })}

            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>

            <View style={styles.badgeAccuracy}>
              <Text style={styles.accuracyText}>Akurasi {item.accuracy}%</Text>
            </View>

            <View style={styles.badgeTanggal}>
              <Ionicons name="time-outline" size={12} color="white" />
              <Text style={styles.tanggalBadgeText}>
                {item.tanggal} · {item.waktu}
              </Text>
            </View>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              <View style={styles.headerResult}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[styles.statusLabel, { color: sc.color }]}>
                    {item.status}
                  </Text>
                  <Text style={styles.diseaseName}>{item.disease_name}</Text>
                  <Text style={styles.latinName}>{item.latin_name}</Text>
                </View>
                <View style={[styles.iconWarning, { backgroundColor: sc.bg }]}>
                  <Ionicons name={sc.icon as any} size={36} color={sc.color} />
                </View>
              </View>

              {item.kategori ? (
                <View
                  style={[
                    styles.kategoriBadge,
                    {
                      backgroundColor:
                        kategoriConfig[item.kategori]?.bg ?? "#F3F4F6",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.kategoriText,
                      {
                        color:
                          kategoriConfig[item.kategori]?.color ?? "#6B7280",
                      },
                    ]}
                  >
                    {item.kategori}
                  </Text>
                </View>
              ) : null}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Tentang Penyakit</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>

              <Text style={styles.sectionTitle}>Tindakan yang Disarankan</Text>
              {item.actions?.map((action: string, index: number) => (
                <View key={index} style={styles.actionItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => onDelete(item.id)}
              >
                <Ionicons name="trash" size={18} color="white" />
                <Text style={styles.btnDeleteText}>Hapus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnClose} onPress={onClose}>
                <Text style={styles.btnCloseText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ── CARD ─────────────────────────────────────────────────────────
function KartuRiwayat({ item, onPress }: { item: any; onPress: () => void }) {
  const sc = statusConfig[item.status] ?? statusConfig["Sehat"];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.foto }} style={styles.cardImage} />

      <View style={styles.cardContent}>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Ionicons name={sc.icon as any} size={11} color={sc.color} />
          <Text style={[styles.statusBadgeText, { color: sc.color }]}>
            {item.status}
          </Text>
        </View>

        <Text style={styles.cardTitle}>{item.disease_name}</Text>
        <Text style={styles.cardLatin}>{item.latin_name}</Text>

        <View style={styles.akurasiRow}>
          <View style={styles.akurasiBar}>
            <View
              style={[
                styles.akurasiFill,
                {
                  width: `${item.accuracy}%` as any,
                  backgroundColor: sc.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.akurasiPct, { color: sc.color }]}>
            {item.accuracy}%
          </Text>
        </View>

        <View style={styles.tanggalRow}>
          <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
          <Text style={styles.tanggalText}>
            {item.tanggal} · {item.waktu}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#D1D5DB"
        style={{ alignSelf: "center" }}
      />
    </TouchableOpacity>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────
export default function RiwayatScanAI() {
  const router = useRouter();

  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"Semua" | "Hama" | "Penyakit" | "Sehat">(
    "Semua",
  );

  const FILTERS = ["Semua", "Hama", "Penyakit", "Sehat"] as const;

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const response = await api.get("/histories");
      // Data sudah lengkap dari backend — tidak perlu enrichment
      setRiwayat(response.data);
    } catch (error) {
      console.log("ERROR FETCH:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      "Hapus Riwayat",
      "Apakah kamu yakin ingin menghapus riwayat ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/histories/${id}`);
              setRiwayat((prev) => prev.filter((item) => item.id !== id));
              setSelected(null);
            } catch (error) {
              console.log("ERROR DELETE:", error);
            }
          },
        },
      ],
    );
  };

  const filtered =
    filter === "Semua" ? riwayat : riwayat.filter((d) => d.kategori === filter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Scan AI</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* FILTER */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, backgroundColor: "#fff" }}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* JUMLAH */}
      <Text style={styles.jumlahText}>{filtered.length} hasil ditemukan</Text>

      {/* LIST */}
      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <KartuRiwayat item={item} onPress={() => setSelected(item)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="scan-outline" size={52} color="#D1D5DB" />
              <Text style={styles.emptyText}>Belum ada riwayat scan</Text>
            </View>
          }
        />
      )}

      {/* MODAL */}
      <ModalDetail
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#1F2937" },

  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: { backgroundColor: "#16A34A" },
  filterText: { fontSize: 13, color: "#6B7280" },
  filterTextActive: { color: "#fff", fontWeight: "700" },

  jumlahText: {
    fontSize: 12,
    color: "#9CA3AF",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 2,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 6 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
  },
  cardImage: { width: 85, height: 85, borderRadius: 12 },
  cardContent: { flex: 1, marginLeft: 12, marginRight: 6 },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },
  cardLatin: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#9CA3AF",
    marginBottom: 6,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 2,
  },
  statusBadgeText: { fontSize: 10, fontWeight: "700" },

  akurasiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  akurasiBar: {
    flex: 1,
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    overflow: "hidden",
  },
  akurasiFill: { height: "100%", borderRadius: 10 },
  akurasiPct: { fontSize: 11, fontWeight: "700", minWidth: 36 },

  tanggalRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  tanggalText: { fontSize: 11, color: "#9CA3AF" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, color: "#9CA3AF" },

  modalOverlay: { flex: 1, backgroundColor: "#F9FAFB" },
  modalSafe: { flex: 1 },

  imageContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
    overflow: "hidden",
  },
  scannedImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },

  contentCard: {
    backgroundColor: "white",
    marginTop: -25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 25,
    flex: 1.2,
    paddingBottom: 0,
  },

  backButton: {
    position: "absolute",
    top: 16,
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

  badgeTanggal: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tanggalBadgeText: { color: "white", fontSize: 11 },

  headerResult: { flexDirection: "row", alignItems: "center" },
  statusLabel: {
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  diseaseName: { fontSize: 22, fontWeight: "bold", color: "#1F2937" },
  latinName: { fontSize: 14, fontStyle: "italic", color: "#6B7280" },
  iconWarning: { padding: 10, borderRadius: 15 },

  kategoriBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  kategoriText: { fontSize: 11, fontWeight: "700" },

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

  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  actionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },

  footerButtons: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "white",
  },
  btnDelete: {
    flex: 1,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
    gap: 8,
  },
  btnDeleteText: { color: "white", fontWeight: "bold", fontSize: 15 },
  btnClose: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 15,
  },
  btnCloseText: { color: "#6B7280", fontWeight: "bold", fontSize: 15 },

  bboxLabel: {
    position: "absolute",
    top: -1,
    left: -1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 5,
  },
  bboxLabelText: { color: "white", fontSize: 10, fontWeight: "700" },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ── DATA DUMMY ──────────────────────────────────────────
const DUMMY_RIWAYAT = [
  {
    id: '1',
    foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Brown_planthopper.jpg/320px-Brown_planthopper.jpg',
    diseaseName: 'Wereng Coklat',
    latinName: 'Nilaparvata lugens',
    accuracy: 94.2,
    status: 'Bahaya',
    kategori: 'Hama',
    description:
      'Wereng coklat merupakan hama utama tanaman padi yang menyerang dengan cara mengisap cairan tanaman. Serangan berat dapat menyebabkan tanaman mengering secara tiba-tiba (hopperburn) dan gagal panen.',
    actions: [
      'Gunakan pestisida berbahan aktif imidakloprid atau buprofezin',
      'Lakukan penyemprotan pada pagi atau sore hari',
      'Hindari penggunaan insektisida piretroid yang memicu ledakan populasi',
      'Tanam varietas padi tahan wereng seperti IR64 atau Ciherang',
    ],
    tanggal: '10 Mei 2026',
    waktu: '08:32',
  },
  {
    id: '2',
    foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rice_blast_lesions.jpg/320px-Rice_blast_lesions.jpg',
    diseaseName: 'Blas Daun',
    latinName: 'Pyricularia oryzae',
    accuracy: 87.5,
    status: 'Waspada',
    kategori: 'Penyakit',
    description:
      'Penyakit blas disebabkan oleh jamur Pyricularia oryzae yang menyerang daun, batang, dan malai padi. Serangan pada leher malai dapat menyebabkan kehilangan hasil panen hingga 80%.',
    actions: [
      'Semprot fungisida berbahan aktif trisiklazol atau isoprothiolane',
      'Jaga drainase lahan agar tidak tergenang terlalu lama',
      'Gunakan varietas padi tahan blas',
      'Hindari pemupukan nitrogen berlebihan',
    ],
    tanggal: '9 Mei 2026',
    waktu: '14:15',
  },
  {
    id: '3',
    foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Bacterial_leaf_blight_rice.jpg/320px-Bacterial_leaf_blight_rice.jpg',
    diseaseName: 'Hawar Daun Bakteri',
    latinName: 'Xanthomonas oryzae',
    accuracy: 91.0,
    status: 'Bahaya',
    kategori: 'Penyakit',
    description:
      'Penyakit ini menyebabkan daun menguning dan mengering mulai dari ujung daun. Jika dibiarkan, dapat menurunkan hasil panen hingga 50% karena mengganggu proses fotosintesis tanaman.',
    actions: [
      'Cabut dan musnahkan tanaman yang terinfeksi berat',
      'Semprot dengan bakterisida berbahan tembaga hidroksida',
      'Kurangi genangan air di lahan sawah',
      'Gunakan benih bersertifikat bebas penyakit',
    ],
    tanggal: '7 Mei 2026',
    waktu: '09:50',
  },
  {
    id: '4',
    foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Healthy_rice_plant.jpg/320px-Healthy_rice_plant.jpg',
    diseaseName: 'Tanaman Sehat',
    latinName: 'Oryza sativa',
    accuracy: 98.0,
    status: 'Sehat',
    kategori: 'Sehat',
    description:
      'Tanaman padi dalam kondisi baik dan sehat. Tidak ditemukan indikasi serangan hama maupun penyakit. Pertahankan pola perawatan saat ini agar hasil panen tetap optimal.',
    actions: [
      'Lakukan pemupukan berimbang sesuai fase pertumbuhan',
      'Jaga ketersediaan air irigasi secara teratur',
      'Pantau kondisi tanaman secara berkala',
      'Pertahankan sanitasi lahan dari gulma',
    ],
    tanggal: '3 Mei 2026',
    waktu: '07:45',
  },
];

// ── STATUS CONFIG ───────────────────────────────────────
const statusConfig: Record<string, { color: string; bg: string; icon: string }> = {
  Bahaya:  { color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle'       },
  Waspada: { color: '#F59E0B', bg: '#FEF3C7', icon: 'warning'            },
  Sehat:   { color: '#16A34A', bg: '#D1FAE5', icon: 'checkmark-circle'   },
};

const kategoriConfig: Record<string, { color: string; bg: string }> = {
  Hama:     { color: '#DC2626', bg: '#FEE2E2' },
  Penyakit: { color: '#D97706', bg: '#FEF3C7' },
  Sehat:    { color: '#059669', bg: '#D1FAE5' },
};

// ── MODAL DETAIL (gaya AnalysisResult) ─────────────────
function ModalDetail({
  item,
  onClose,
}: {
  item: (typeof DUMMY_RIWAYAT)[0] | null;
  onClose: () => void;
}) {
  if (!item) return null;
  const sc = statusConfig[item.status] ?? statusConfig['Sehat'];

  return (
    <Modal visible={!!item} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView bounces showsVerticalScrollIndicator={false}>

            {/* Foto + Back + Akurasi */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.foto }}
                style={styles.scannedImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
              <View style={styles.badgeAccuracy}>
                <Text style={styles.accuracyText}>Akurasi {item.accuracy}%</Text>
              </View>
              {/* Info tanggal di foto */}
              <View style={styles.badgeTanggal}>
                <Ionicons name="time-outline" size={12} color="white" />
                <Text style={styles.tanggalBadgeText}>{item.tanggal} · {item.waktu}</Text>
              </View>
            </View>

            {/* Content Card */}
            <View style={styles.contentCard}>

              {/* Header hasil */}
              <View style={styles.headerResult}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusLabel, { color: sc.color }]}>{item.status}</Text>
                  <Text style={styles.diseaseName}>{item.diseaseName}</Text>
                  <Text style={styles.latinName}>{item.latinName}</Text>
                </View>
                <View style={[styles.iconWarning, { backgroundColor: sc.bg }]}>
                  <Ionicons name={sc.icon as any} size={38} color={sc.color} />
                </View>
              </View>

              {/* Badge kategori */}
              <View style={[styles.kategoriBadge, { backgroundColor: kategoriConfig[item.kategori]?.bg }]}>
                <Text style={[styles.kategoriText, { color: kategoriConfig[item.kategori]?.color }]}>
                  {item.kategori}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Tentang */}
              <Text style={styles.sectionTitle}>Tentang Penyakit</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>

              {/* Tindakan */}
              <Text style={styles.sectionTitle}>Tindakan yang Disarankan</Text>
              {item.actions.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}

              {/* Tombol */}
              <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.btnClose} onPress={onClose}>
                  <Text style={styles.btnCloseText}>Tutup</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ── KARTU RIWAYAT ───────────────────────────────────────
function KartuRiwayat({
  item,
  onPress,
}: {
  item: (typeof DUMMY_RIWAYAT)[0];
  onPress: () => void;
}) {
  const sc = statusConfig[item.status] ?? statusConfig['Sehat'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Foto */}
      <Image source={{ uri: item.foto }} style={styles.cardImage} />

      {/* Konten */}
      <View style={styles.cardContent}>
        {/* Status */}
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Ionicons name={sc.icon as any} size={11} color={sc.color} />
          <Text style={[styles.statusBadgeText, { color: sc.color }]}>{item.status}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>{item.diseaseName}</Text>
        <Text style={styles.cardLatin} numberOfLines={1}>{item.latinName}</Text>

        {/* Akurasi */}
        <View style={styles.akurasiRow}>
          <View style={styles.akurasiBar}>
            <View style={[styles.akurasiFill, { width: `${item.accuracy}%` as any, backgroundColor: sc.color }]} />
          </View>
          <Text style={[styles.akurasiPct, { color: sc.color }]}>{item.accuracy}%</Text>
        </View>

        {/* Tanggal */}
        <View style={styles.tanggalRow}>
          <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
          <Text style={styles.tanggalText}>{item.tanggal} · {item.waktu}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ alignSelf: 'center' }} />
    </TouchableOpacity>
  );
}

// ── HALAMAN UTAMA ───────────────────────────────────────
export default function RiwayatScanAI() {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof DUMMY_RIWAYAT)[0] | null>(null);
  const [filter, setFilter] = useState<'Semua' | 'Hama' | 'Penyakit' | 'Sehat'>('Semua');

  const FILTERS = ['Semua', 'Hama', 'Penyakit', 'Sehat'] as const;

  const filtered =
    filter === 'Semua' ? DUMMY_RIWAYAT : DUMMY_RIWAYAT.filter((d) => d.kategori === filter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Scan AI</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, backgroundColor: '#fff' }}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jumlah */}
      <Text style={styles.jumlahText}>{filtered.length} hasil ditemukan</Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
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

      {/* Modal */}
      <ModalDetail item={selected} onClose={() => setSelected(null)} />
    </SafeAreaView>
  );
}

// ── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 40, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn:            { width: 38, height: 38, borderRadius: 10, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' },
  headerTitle:        { fontSize: 17, fontWeight: '700', color: '#1F2937' },

  // Filter
  filterContent:      { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterBtn:          { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterBtnActive:    { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  filterText:         { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive:   { color: '#fff', fontWeight: '700' },
  jumlahText:         { fontSize: 12, color: '#9CA3AF', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 2 },

  // List
  listContent:        { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 6 },

  // Card
  card:               { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, alignItems: 'flex-start' },
  cardImage:          { width: 85, height: 85, borderRadius: 12, backgroundColor: '#F3F4F6' },
  cardContent:        { flex: 1, marginLeft: 12, marginRight: 6 },
  cardTitle:          { fontSize: 15, fontWeight: '700', color: '#1F2937', marginTop: 4 },
  cardLatin:          { fontSize: 11, fontStyle: 'italic', color: '#9CA3AF', marginBottom: 6 },

  statusBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 2 },
  statusBadgeText:    { fontSize: 10, fontWeight: '700' },

  akurasiRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  akurasiBar:         { flex: 1, height: 5, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' },
  akurasiFill:        { height: '100%', borderRadius: 10 },
  akurasiPct:         { fontSize: 11, fontWeight: '700', minWidth: 36 },

  tanggalRow:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tanggalText:        { fontSize: 11, color: '#9CA3AF' },

  empty:              { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText:          { fontSize: 14, color: '#9CA3AF' },

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: '#F9FAFB' },
  modalSafe:          { flex: 1 },

  imageContainer:     { width: '100%', height: 350, position: 'relative' },
  scannedImage:       { width: '100%', height: '100%' },
  backButton:         { position: 'absolute', top: 16, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 },
  badgeAccuracy:      { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#16A34A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  accuracyText:       { color: 'white', fontWeight: 'bold', fontSize: 12 },
  badgeTanggal:       { position: 'absolute', bottom: 30, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tanggalBadgeText:   { color: 'white', fontSize: 11 },

  contentCard:        { backgroundColor: 'white', marginTop: -25, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },

  headerResult:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel:        { fontWeight: '900', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  diseaseName:        { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  latinName:          { fontSize: 14, fontStyle: 'italic', color: '#6B7280' },
  iconWarning:        { padding: 10, borderRadius: 15 },

  kategoriBadge:      { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  kategoriText:       { fontSize: 11, fontWeight: '700' },

  divider:            { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle:       { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginTop: 10 },
  descriptionText:    { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 15 },

  actionItem:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  actionText:         { marginLeft: 10, fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },

  footerButtons:      { marginTop: 30 },
  btnClose:           { borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 15 },
  btnCloseText:       { color: '#6B7280', fontWeight: 'bold', fontSize: 15 },
});
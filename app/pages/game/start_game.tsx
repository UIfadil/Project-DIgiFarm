import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    Modal, ActivityIndicator, Alert, Image, ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface SoalKuis {
    id: number;
    pertanyaan: string;
    gambar: string | null;
    kategori: string;
    opsi_a: string;
    opsi_b: string;
    opsi_c: string;
    opsi_d: string;
    jawaban_benar: 'a' | 'b' | 'c' | 'd';
}

const WAKTU_PER_SOAL = 30; // 30 detik per soal

const LABEL_KATEGORI: Record<string, string> = {
    semua:            'Semua Kategori',
    hama:             'Hama',
    penyakit:         'Penyakit',
    pertanian_dasar:  'Pertanian Dasar',
};

export default function GamePlayKuis() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const kategori = (params.kategori as string) ?? 'semua';

    const [soalList, setSoalList]           = useState<SoalKuis[]>([]);
    const [loading, setLoading]             = useState(true);
    const [currentIndex, setCurrentIndex]   = useState(0);
    const [timeLeft, setTimeLeft]           = useState(WAKTU_PER_SOAL);
    const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
    const [answered, setAnswered]           = useState(false); // sudah dijawab/timeout
    const [jumlahBenar, setJumlahBenar]     = useState(0);
    const [jumlahSalah, setJumlahSalah]     = useState(0);
    const [showResult, setShowResult]       = useState(false);
    const [savingResult, setSavingResult]   = useState(false);
    const [expDidapat, setExpDidapat]       = useState(0);

    const totalSoal   = 10;
    const soal        = soalList[currentIndex];
    const progress    = ((currentIndex + 1) / totalSoal) * 100;

    // ─── Fetch soal ───
    useEffect(() => {
        const fetchSoal = async () => {
            try {
                const res = await api.get(`/kuis/soal?kategori=${kategori}`);
                setSoalList(res.data);
            } catch (e: any) {
                Alert.alert("Gagal", e?.response?.data?.message ?? "Gagal memuat soal", [
                    { text: "Kembali", onPress: () => router.back() }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchSoal();
    }, []);

    // ─── Timer ───
    useEffect(() => {
        if (loading || answered || showResult) return;
        if (timeLeft === 0) {
            // Waktu habis = salah
            handleTimeOut();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, loading, answered, showResult]);

    const handleTimeOut = () => {
        setAnswered(true);
        setJumlahSalah(s => s + 1);
    };

    const handlePilihJawaban = (jawaban: 'a' | 'b' | 'c' | 'd') => {
        if (answered) return;
        setSelectedAnswer(jawaban);
        setAnswered(true);
        if (jawaban === soal.jawaban_benar) {
            setJumlahBenar(b => b + 1);
        } else {
            setJumlahSalah(s => s + 1);
        }
    };

    const handleNext = async () => {
        if (currentIndex + 1 >= totalSoal) {
            // Soal terakhir — simpan hasil
            await simpanHasil();
        } else {
            setCurrentIndex(i => i + 1);
            setSelectedAnswer(null);
            setAnswered(false);
            setTimeLeft(WAKTU_PER_SOAL);
        }
    };

    const simpanHasil = async () => {
        try {
            setSavingResult(true);
            const benar = selectedAnswer === soal?.jawaban_benar
                ? jumlahBenar + 1 : jumlahBenar;
            const salah = selectedAnswer !== soal?.jawaban_benar
                ? jumlahSalah + 1 : jumlahSalah;

            const res = await api.post('/kuis/selesai', {
                kategori,
                jumlah_benar: benar,
                jumlah_salah: salah,
            });
            setExpDidapat(res.data.exp_didapat);
            setJumlahBenar(benar);
            setJumlahSalah(salah);
            setShowResult(true);
        } catch {
            Alert.alert("Gagal", "Gagal menyimpan hasil kuis");
        } finally {
            setSavingResult(false);
        }
    };

    const getImageUri = (gambar: string) =>
        `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/storage/${gambar}`;

    const getSkor = () => Math.round((jumlahBenar / totalSoal) * 100);

    // Warna tombol jawaban
    const getAnswerStyle = (key: 'a' | 'b' | 'c' | 'd') => {
        if (!answered) {
            return selectedAnswer === key ? styles.answerButtonSelected : styles.answerButton;
        }
        if (key === soal?.jawaban_benar) return styles.answerButtonBenar;
        if (key === selectedAnswer) return styles.answerButtonSalah;
        return styles.answerButton;
    };

    const getAnswerIndexStyle = (key: 'a' | 'b' | 'c' | 'd') => {
        if (!answered) {
            return selectedAnswer === key ? styles.answerIndexSelected : styles.answerIndex;
        }
        if (key === soal?.jawaban_benar) return styles.answerIndexBenar;
        if (key === selectedAnswer) return styles.answerIndexSalah;
        return styles.answerIndex;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Menyiapkan soal...</Text>
            </SafeAreaView>
        );
    }

    if (!soal) return null;

    const opsiMap: Record<'a' | 'b' | 'c' | 'd', string> = {
        a: soal.opsi_a, b: soal.opsi_b, c: soal.opsi_c, d: soal.opsi_d,
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.exitButton}>
                    <Ionicons name="close" size={18} color="#EF4444" />
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        Soal {currentIndex + 1}/{totalSoal} • {LABEL_KATEGORI[kategori]}
                    </Text>
                </View>
                {/* Timer */}
                <View style={[styles.timerCircle, timeLeft <= 10 && styles.timerLow]}>
                    <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextLow]}>
                        {timeLeft}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* KARTU SOAL */}
                <View style={styles.questionCard}>
                    <Text style={styles.questionCategory}>{LABEL_KATEGORI[soal.kategori]?.toUpperCase()}</Text>

                    {/* Gambar soal jika ada */}
                    {soal.gambar ? (
                        <Image
                            source={{ uri: getImageUri(soal.gambar) }}
                            style={styles.soalImage}
                            resizeMode="cover"
                        />
                    ) : null}

                    <Text style={styles.questionText}>{soal.pertanyaan}</Text>
                </View>

                {/* OPSI JAWABAN */}
                <View style={styles.answersContainer}>
                    {(['a', 'b', 'c', 'd'] as const).map((key) => (
                        <TouchableOpacity
                            key={key}
                            style={getAnswerStyle(key)}
                            onPress={() => handlePilihJawaban(key)}
                            disabled={answered}
                        >
                            <View style={getAnswerIndexStyle(key)}>
                                <Text style={[
                                    styles.answerIndexText,
                                    (answered && key === soal.jawaban_benar) && styles.answerIndexTextBenar,
                                    (answered && key === selectedAnswer && key !== soal.jawaban_benar) && styles.answerIndexTextSalah,
                                    (!answered && selectedAnswer === key) && styles.answerIndexTextSelected,
                                ]}>
                                    {key.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={[
                                styles.answerText,
                                (answered && key === soal.jawaban_benar) && styles.answerTextBenar,
                                (answered && key === selectedAnswer && key !== soal.jawaban_benar) && styles.answerTextSalah,
                            ]}>
                                {opsiMap[key]}
                            </Text>
                            {answered && key === soal.jawaban_benar && (
                                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                            )}
                            {answered && key === selectedAnswer && key !== soal.jawaban_benar && (
                                <Ionicons name="close-circle" size={20} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                {!answered ? (
                    <View style={styles.waitingHint}>
                        <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                        <Text style={styles.waitingHintText}>Pilih jawaban di atas</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        disabled={savingResult}
                    >
                        {savingResult
                            ? <ActivityIndicator color="white" />
                            : <Text style={styles.nextButtonText}>
                                {currentIndex + 1 === totalSoal ? 'LIHAT HASIL' : 'SOAL BERIKUTNYA'}
                              </Text>
                        }
                    </TouchableOpacity>
                )}
            </View>

            {/* MODAL HASIL */}
            <Modal visible={showResult} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.resultCard}>
                        <View style={styles.emojiRain}>
                            <Text style={styles.bigEmoji}>
                                {getSkor() >= 70 ? '🥳' : '💪'}
                            </Text>
                        </View>
                        <Text style={styles.congratsText}>
                            {getSkor() >= 70 ? 'Luar Biasa!' : 'Tetap Semangat!'}
                        </Text>
                        <Text style={styles.resultSubText}>Kamu telah menyelesaikan kuis</Text>

                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreLabel}>SKOR KAMU</Text>
                            <Text style={styles.scoreValue}>{getSkor()}</Text>
                            <Text style={styles.xpGain}>+{expDidapat} EXP</Text>
                        </View>

                        {/* Tombol kembali ke halaman hasil */}
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => {
                                setShowResult(false);
                                router.replace({
                                    pathname: '/pages/game/end_game',
                                    params: {
                                        skor: getSkor(),
                                        jumlah_benar: jumlahBenar,
                                        jumlah_salah: jumlahSalah,
                                        exp_didapat: expDidapat,
                                    }
                                });
                            }}
                        >
                            <Text style={styles.homeButtonText}>KEMBALI KE LOBBY</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                setShowResult(false);
                                setCurrentIndex(0);
                                setSelectedAnswer(null);
                                setAnswered(false);
                                setTimeLeft(WAKTU_PER_SOAL);
                                setJumlahBenar(0);
                                setJumlahSalah(0);
                            }}
                        >
                            <Text style={styles.retryButtonText}>Ulangi 🔄</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0FDF4' },
    scrollContent: { paddingBottom: 120 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, justifyContent: 'space-between' },
    exitButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
    progressContainer: { flex: 1, marginHorizontal: 12, alignItems: 'center' },
    progressBarBackground: { height: 8, width: '100%', backgroundColor: '#DCFCE7', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#16A34A', borderRadius: 4 },
    progressText: { fontSize: 11, fontWeight: 'bold', color: '#16A34A', marginTop: 4 },
    timerCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#16A34A', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
    timerLow: { borderColor: '#EF4444' },
    timerText: { fontSize: 16, fontWeight: '900', color: '#16A34A' },
    timerTextLow: { color: '#EF4444' },

    questionCard: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 30, elevation: 5, minHeight: 150, justifyContent: 'center' },
    questionCategory: { textAlign: 'center', color: '#16A34A', fontWeight: '800', fontSize: 11, marginBottom: 10, letterSpacing: 1 },
    soalImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 14, backgroundColor: '#F3F4F6' },
    questionText: { fontSize: 17, fontWeight: 'bold', color: '#374151', textAlign: 'center', lineHeight: 26 },

    answersContainer: { paddingHorizontal: 20, gap: 10 },
    answerButton: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, borderWidth: 2, borderColor: '#E5E7EB' },
    answerButtonSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    answerButtonBenar: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
    answerButtonSalah: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },

    answerIndex: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    answerIndexSelected: { backgroundColor: '#16A34A' },
    answerIndexBenar: { backgroundColor: '#16A34A' },
    answerIndexSalah: { backgroundColor: '#EF4444' },
    answerIndexText: { fontWeight: 'bold', color: '#6B7280', fontSize: 14 },
    answerIndexTextSelected: { color: 'white' },
    answerIndexTextBenar: { color: 'white' },
    answerIndexTextSalah: { color: 'white' },
    answerText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#4B5563' },
    answerTextBenar: { color: '#166534' },
    answerTextSalah: { color: '#991B1B' },

    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
    waitingHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    waitingHintText: { color: '#9CA3AF', fontSize: 14 },
    nextButton: { backgroundColor: '#16A34A', padding: 18, borderRadius: 20, alignItems: 'center' },
    nextButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },

    // Modal hasil
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    resultCard: { width: '85%', backgroundColor: 'white', borderRadius: 40, padding: 30, alignItems: 'center', elevation: 20 },
    emojiRain: { marginTop: -70, backgroundColor: '#FFD700', width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: 'white' },
    bigEmoji: { fontSize: 50 },
    congratsText: { fontSize: 28, fontWeight: '900', color: '#16A34A', marginTop: 15 },
    resultSubText: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
    scoreContainer: { backgroundColor: '#F0FDF4', width: '100%', padding: 20, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#86EFAC', marginBottom: 25 },
    scoreLabel: { fontSize: 12, fontWeight: '800', color: '#16A34A', letterSpacing: 2 },
    scoreValue: { fontSize: 50, fontWeight: '900', color: '#16A34A' },
    xpGain: { fontSize: 16, fontWeight: 'bold', color: '#F59E0B' },
    homeButton: { backgroundColor: '#16A34A', width: '100%', padding: 18, borderRadius: 20, alignItems: 'center', marginBottom: 10, elevation: 5 },
    homeButtonText: { color: 'white', fontWeight: '900', fontSize: 16 },
    retryButton: { padding: 10 },
    retryButtonText: { color: '#6B7280', fontWeight: 'bold', fontSize: 14 },
});
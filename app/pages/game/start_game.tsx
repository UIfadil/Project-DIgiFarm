import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';

export default function GamePlayKuis() {
  const router = useRouter();
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 10;
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // State Baru untuk Pop-up Hasil
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(850); // Contoh skor

  const progress = (currentQuestion / totalQuestions) * 100;

  useEffect(() => {
    if (timeLeft === 0 || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const answers = ["Wereng Batang Coklat", "Walang Sangit", "Tikus Sawah", "Ulat Grayak"];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER, QUESTION CARD, & ANSWERS (Tetap sama seperti kode Anda) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.exitButton}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Soal {currentQuestion}/{totalQuestions}</Text>
        </View>
        <View style={[styles.timerCircle, timeLeft <= 5 && styles.timerLow]}>
          <Text style={[styles.timerText, timeLeft <= 5 && styles.timerTextLow]}>{timeLeft}</Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionCategory}>HAMA & PENYAKIT</Text>
        <Text style={styles.questionText}>
          Hama manakah yang sering menyerang batang padi dengan cara menghisap cairan batang?
        </Text>
      </View>

      <View style={styles.answersContainer}>
        {answers.map((answer, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.answerButton, selectedAnswer === index && styles.answerButtonSelected]}
            onPress={() => setSelectedAnswer(index)}
          >
            <View style={[styles.answerIndex, selectedAnswer === index && styles.answerIndexSelected]}>
              <Text style={[styles.answerIndexText, selectedAnswer === index && styles.answerIndexTextSelected]}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={[styles.answerText, selectedAnswer === index && styles.answerTextSelected]}>{answer}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, selectedAnswer === null && styles.nextButtonDisabled]}
          disabled={selectedAnswer === null}
          onPress={() => {
            if (currentQuestion < totalQuestions) {
              setCurrentQuestion(currentQuestion + 1);
              setSelectedAnswer(null);
              setTimeLeft(15);
            } else {
              setShowResult(true); // Tampilkan Pop-up
            }
          }}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === totalQuestions ? "LIHAT HASIL" : "SOAL BERIKUTNYA"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL HASIL (POP-UP MENARIK) */}
      <Modal 
        visible={showResult} 
        transparent={true} 
        animationType="slide" // Baris merah hilang
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            {/* Dekorasi Atas */}
            <View style={styles.emojiRain}>
              <Text style={styles.bigEmoji}>🥳</Text>
            </View>
            
            <Text style={styles.congratsText}>Luar Biasa!</Text>
            <Text style={styles.resultSubText}>Kamu telah menyelesaikan kuis</Text>

            {/* Skor Container */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>SKOR KAMU</Text>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.xpGain}>+50 XP</Text>
            </View>

            {/* Tombol Aksi */}
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => {
                setShowResult(false);
                router.replace('/pages/game/end_game'); // Ganti ke lobby
              }}
            >
              <Text style={styles.homeButtonText}>KEMBALI KE LOBBY</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setShowResult(false);
                setCurrentQuestion(1);
                setSelectedAnswer(null);
                setTimeLeft(15);
              }}
            >
              <Text style={styles.retryButtonText}>Main Lagi 🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // KODE STYLES LAMA ANDA TETAP DISINI...
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, justifyContent: 'space-between' },
  exitButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  exitText: { color: '#EF4444', fontSize: 18, fontWeight: 'bold' },
  progressContainer: { flex: 1, marginHorizontal: 15, alignItems: 'center' },
  progressBarBackground: { height: 8, width: '100%', backgroundColor: '#DCFCE7', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#16A34A' },
  progressText: { fontSize: 12, fontWeight: 'bold', color: '#16A34A', marginTop: 5 },
  timerCircle: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 3, borderColor: '#16A34A', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  timerLow: { borderColor: '#EF4444' },
  timerText: { fontSize: 16, fontWeight: '900', color: '#16A34A' },
  timerTextLow: { color: '#EF4444' },
  questionCard: { backgroundColor: 'white', margin: 20, padding: 25, borderRadius: 30, elevation: 5, minHeight: 180, justifyContent: 'center' },
  questionCategory: { textAlign: 'center', color: '#16A34A', fontWeight: '800', fontSize: 12, marginBottom: 10 },
  questionText: { fontSize: 18, fontWeight: 'bold', color: '#374151', textAlign: 'center', lineHeight: 26 },
  answersContainer: { paddingHorizontal: 20 },
  answerButton: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 2, borderColor: '#E5E7EB' },
  answerButtonSelected: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  answerIndex: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  answerIndexSelected: { backgroundColor: '#16A34A' },
  answerIndexText: { fontWeight: 'bold', color: '#6B7280' },
  answerIndexTextSelected: { color: 'white' },
  answerText: { fontSize: 16, fontWeight: '600', color: '#4B5563' },
  answerTextSelected: { color: '#16A34A' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20 },
  nextButton: { backgroundColor: '#16A34A', padding: 18, borderRadius: 20, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#D1D5DB' },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },

  /* --- STYLES BARU UNTUK POP-UP --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)', // Gelapkan background belakang
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
  },
  emojiRain: {
    marginTop: -70, // Emoji keluar dari kartu
    backgroundColor: '#FFD700',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'white',
  },
  bigEmoji: { fontSize: 50 },
  congratsText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#16A34A',
    marginTop: 15,
  },
  resultSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  scoreContainer: {
    backgroundColor: '#F0FDF4',
    width: '100%',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
    marginBottom: 25,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 50,
    fontWeight: '900',
    color: '#16A34A',
  },
  xpGain: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B', // Warna emas/oranye
  },
  homeButton: {
    backgroundColor: '#16A34A',
    width: '100%',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  },
  homeButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
  },
  retryButton: {
    padding: 10,
  },
  retryButtonText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
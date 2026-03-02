import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert // <--- Pastikan Alert ada di sini
} from 'react-native';
import api from '../../services/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password wajib diisi!");
      return;
    }

    try {
      const response = await api.post('/login', {
        email: email,
        password: password,
      });

      // Ambil data dari respon Laravel
      const { role, access_token } = response.data;

      // SIMPAN TOKEN KE MEMORI HP
      await AsyncStorage.setItem('userToken', access_token);

      if (role === 'admin') {
        Alert.alert("Sukses", "Selamat Datang Admin!");
        router.replace('/pages/admin/admin_home'); 
      } else {
        Alert.alert("Sukses", "Login Berhasil!");
        router.replace('/pages/dashboard'); 
      }

    } catch (error: any) {
      console.log("Error Login:", error.response?.data);
      const pesanError = error.response?.data?.message || "Gagal Login, periksa jaringan atau akun Anda";
      Alert.alert("Login Gagal", pesanError);
    }
  }; // <--- Kurung kurawal fungsi handleLogin

  // Kurung kurawal berlebih yang tadi ada di sini sudah dihapus

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={40} color="white" />
            </View>
            <Text style={styles.welcomeText}>Selamat Datang!</Text>
            <Text style={styles.subText}>Masuk untuk mulai memantau kesehatan tanaman Anda</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="masukkan email anda"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="masukkan password anda"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPass}>
              <Text style={styles.forgotPassText}>Lupa Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
              <Text style={styles.btnLoginText}>Masuk</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/pages/autentikasi/registrasi')}>
              <Text style={styles.registerText}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#16A34A', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  subText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  formContainer: { width: '100%' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8, marginTop: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 15, paddingHorizontal: 15, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1F2937' },
  forgotPass: { alignSelf: 'flex-end', marginTop: 10 },
  forgotPassText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },
  btnLogin: { backgroundColor: '#16A34A', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30, elevation: 4 },
  btnLoginText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 30 },
  footerText: { color: '#6B7280', fontSize: 14 },
  registerText: { color: '#16A34A', fontSize: 14, fontWeight: 'bold' },
});
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/pages/dashboard' },
    { id: 'game', icon: '🎮', label: 'Game', path: '/pages/game/game_home' },
    { id: 'scan', icon: '📸', label: 'Scan', isCenter: true, path: '/pages/scanAI/scanAI_home' },
    { id: 'edukasi', icon: '📚', label: 'Edukasi', path: '/pages/edukasi/edukasi_home' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/pages/setting/setting' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#22c55e" />
      
      {/* Header Tetap Sama */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}><View style={styles.logoIcon} /></View>
          <Text style={styles.logoText}>DigiFarm</Text>
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          // Cek apakah path saat ini sama dengan path item nav
          const isActive = pathname === item.path;

          const handlePress = () => {
            router.push(item.path as any);
          };

          if (item.isCenter) {
            return (
              <View key={item.id} style={styles.centerSpaceHolder}>
                <TouchableOpacity onPress={handlePress} style={styles.centerButtonContainer}>
                  <View style={styles.centerButton}>
                    <Text style={styles.centerIcon}>{item.icon}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity key={item.id} onPress={handlePress} style={styles.navItem}>
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22c55e',
  },
  header: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#22c55e',
    borderRadius: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 60, // Sedikit lebih tinggi untuk kenyamanan
    alignItems: 'center',
    justifyContent: 'space-between', // Gunakan space-between agar merata ke pinggir
    paddingHorizontal: 10,
    
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  centerSpaceHolder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 35,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }], // Efek sedikit membesar saat aktif
  },
  navLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 10,
  },
  navLabelActive: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -35, // Menaikkan tombol lebih tinggi agar terlihat ikonik
    zIndex: 10,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white', // Memberikan border putih agar tidak "bertabrakan" dengan navigasi
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  centerIcon: {
    fontSize: 28,
  },
});
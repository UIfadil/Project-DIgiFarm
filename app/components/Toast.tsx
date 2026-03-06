// components/Toast.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export default function Toast({ visible, message, type = 'info', onHide, duration = 3000 }: ToastProps) {
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.delay(duration),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => onHide());
        }
    }, [visible]);

    if (!visible) return null;

    const config = {
        success: { bg: '#DCFCE7', border: '#16A34A', text: '#166534', icon: 'checkmark-circle' as const },
        error:   { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: 'close-circle' as const },
        info:    { bg: '#EEF2FF', border: '#6366F1', text: '#4338CA', icon: 'information-circle' as const },
    }[type];

    return (
        <Animated.View style={[styles.toast, { opacity, backgroundColor: config.bg, borderLeftColor: config.border }]}>
            <Ionicons name={config.icon} size={18} color={config.border} />
            <Text style={[styles.text, { color: config.text }]}>{message}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        zIndex: 9999,
    },
    text: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
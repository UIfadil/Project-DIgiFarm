// components/ConfirmDialog.tsx
import React from 'react';
import {
    Modal, View, Text, TouchableOpacity, StyleSheet, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: string;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    confirmColor = '#DC2626',
    onConfirm,
    onCancel,
    icon = 'trash-outline',
    iconColor = '#DC2626',
}: ConfirmDialogProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    {/* Icon */}
                    <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
                        <Ionicons name={icon} size={28} color={iconColor} />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Buttons */}
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                            <Text style={styles.btnCancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnConfirm, { backgroundColor: confirmColor }]}
                            onPress={onConfirm}
                        >
                            <Ionicons name={icon} size={14} color="white" />
                            <Text style={styles.btnConfirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dialog: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    iconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    btnCancel: {
        flex: 1,
        padding: 13,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    btnCancelText: {
        fontWeight: '700',
        color: '#374151',
        fontSize: 14,
    },
    btnConfirm: {
        flex: 1,
        flexDirection: 'row',
        padding: 13,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    btnConfirmText: {
        fontWeight: '800',
        color: 'white',
        fontSize: 14,
    },
});
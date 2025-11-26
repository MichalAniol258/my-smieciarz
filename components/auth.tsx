import React, { useState } from 'react'
import {Alert, StyleSheet, View, AppState, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView} from 'react-native'
import { supabase } from '@/api/superbase'
import { Input } from '@rneui/themed'
import {router} from "expo-router";
import { BlurView } from 'expo-blur';

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!error) router.replace('/(tabs)/profile')
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session && !error) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>🔐</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Witaj ponownie</Text>
                        <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.card}>
                        <View style={styles.formContainer}>
                            <Input
                                label="Email"
                                labelStyle={styles.label}
                                inputStyle={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                leftIcon={{
                                    type: 'font-awesome',
                                    name: 'envelope',
                                    color: '#64748b',
                                    size: 20
                                }}
                                onChangeText={(text) => setEmail(text)}
                                value={email}
                                placeholder="email@address.com"
                                placeholderTextColor="#475569"
                                autoCapitalize={'none'}
                                keyboardType="email-address"
                            />

                            <Input
                                label="Hasło"
                                labelStyle={styles.label}
                                inputStyle={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                leftIcon={{
                                    type: 'font-awesome',
                                    name: 'lock',
                                    color: '#64748b',
                                    size: 22
                                }}
                                onChangeText={(text) => setPassword(text)}
                                value={password}
                                secureTextEntry={true}
                                placeholder="••••••••"
                                placeholderTextColor="#475569"
                                autoCapitalize={'none'}
                            />

  
                        </View>

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                disabled={loading}
                                onPress={() => signInWithEmail()}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>
                                    {loading ? 'Ładowanie...' : 'Zaloguj się'}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>lub</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                disabled={loading}
                                onPress={() => signUpWithEmail()}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryButtonText}>
                                    Utwórz konto
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#020617",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(45, 212, 191, 0.15)',
        borderWidth: 2,
        borderColor: '#2dd4bf',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 36,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f8fafc',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '400',
    },
    card: {
        backgroundColor: '#0f172a',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.2)',
        shadowColor: '#2dd4bf',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    formContainer: {
        marginBottom: 24,
    },
    label: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 12,
        borderBottomWidth: 0,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(100, 116, 139, 0.3)',
    },
    input: {
        color: '#f8fafc',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 8,
    },
    forgotPasswordText: {
        color: '#2dd4bf',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonContainer: {
        gap: 16,
    },
    button: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    primaryButton: {
        backgroundColor: '#2dd4bf',
    },
    primaryButtonText: {
        color: '#020617',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 0.3,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#2dd4bf',
        shadowOpacity: 0,
        elevation: 0,
    },
    secondaryButtonText: {
        color: '#2dd4bf',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 0.3,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(100, 116, 139, 0.3)',
    },
    dividerText: {
        color: '#64748b',
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '500',
    },
});

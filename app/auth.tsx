import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from './supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        const complete = await AsyncStorage.getItem('onboardingComplete');
        if (!complete) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)/dashboard');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.top}>
        <Text style={styles.logo}>FitTrack</Text>
        <Text style={styles.tagline}>
          {mode === 'login' ? 'Welcome back.' : 'Create your account.'}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchMode}
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          <Text style={styles.switchModeText}>
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 32, justifyContent: 'center' },
  top: { marginBottom: 48 },
  logo: { fontSize: 42, fontWeight: '800', color: '#111', marginBottom: 8, letterSpacing: -1 },
  tagline: { fontSize: 20, fontWeight: '600', color: '#888' },
  form: {},
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 16, fontSize: 16, backgroundColor: '#f9f9f9', marginBottom: 20 },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  switchMode: { alignItems: 'center', padding: 8 },
  switchModeText: { fontSize: 14, color: '#888' },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

  async function handleNext() {
    if (!name.trim()) return;
    await AsyncStorage.setItem('userName', name.trim());
    router.push('/onboarding/body');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      <View style={styles.top}>
        <Text style={styles.step}>Step 1 of 5</Text>
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.sub}>We'll use this to personalize your experience.</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 32, justifyContent: 'space-between' },
  progress: { flexDirection: 'row', gap: 6, paddingTop: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#eee' },
  progressDotActive: { backgroundColor: '#111' },
  top: { flex: 1, justifyContent: 'center' },
  step: { fontSize: 13, color: '#aaa', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 12 },
  sub: { fontSize: 15, color: '#888', marginBottom: 32, lineHeight: 22 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 16, fontSize: 18, backgroundColor: '#f9f9f9' },
  bottom: { paddingBottom: 40 },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
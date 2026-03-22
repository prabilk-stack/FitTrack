import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function BodyScreen() {
  const router = useRouter();
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const isValid = age && weightLbs && heightFt;

  async function handleNext() {
    if (!isValid) return;
    await AsyncStorage.setItem('userBody', JSON.stringify({ sex, age, weightLbs, heightFt, heightIn }));
    router.push('/onboarding/goal');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.step}>Step 2 of 5</Text>
        <Text style={styles.title}>About your body</Text>
        <Text style={styles.sub}>This helps us calculate your daily calorie and macro targets.</Text>

        <Text style={styles.label}>Sex</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.sexBtn, sex === 'male' && styles.sexBtnActive]}
            onPress={() => setSex('male')}
          >
            <Text style={[styles.sexBtnText, sex === 'male' && styles.sexBtnTextActive]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sexBtn, sex === 'female' && styles.sexBtnActive]}
            onPress={() => setSex('female')}
          >
            <Text style={[styles.sexBtnText, sex === 'female' && styles.sexBtnTextActive]}>Female</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={[styles.input, { marginBottom: 20 }]}
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          placeholder="25"
        />

        <Text style={styles.label}>Current weight (lbs)</Text>
        <TextInput
          style={[styles.input, { marginBottom: 20 }]}
          keyboardType="numeric"
          value={weightLbs}
          onChangeText={setWeightLbs}
          placeholder="160"
        />

        <Text style={styles.label}>Height</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
            value={heightFt}
            onChangeText={setHeightFt}
            placeholder="5 ft"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType="numeric"
            value={heightIn}
            onChangeText={setHeightIn}
            placeholder="10 in"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 32, paddingBottom: 60 },
  progress: { flexDirection: 'row', gap: 6, paddingTop: 20, marginBottom: 32 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#eee' },
  progressDotActive: { backgroundColor: '#111' },
  step: { fontSize: 13, color: '#aaa', fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 12 },
  sub: { fontSize: 15, color: '#888', marginBottom: 32, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  sexBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  sexBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  sexBtnText: { fontSize: 15, color: '#555', fontWeight: '500' },
  sexBtnTextActive: { color: '#fff' },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
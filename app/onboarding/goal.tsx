import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GOALS = [
  { label: 'Lose weight', value: 'lose' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Gain weight', value: 'gain' },
];

const RATES = [0.5, 1, 1.5, 2];

export default function GoalScreen() {
  const router = useRouter();
  const [goal, setGoal] = useState(GOALS[0]);
  const [goalWeight, setGoalWeight] = useState('');
  const [rate, setRate] = useState(1);

  const isValid = goal.value === 'maintain' || goalWeight;

  async function handleNext() {
    if (!isValid) return;
    await AsyncStorage.setItem('userGoal', JSON.stringify({ goal: goal.value, goalLabel: goal.label, goalWeight, rate }));
    router.push('/onboarding/activity');
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
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        <Text style={styles.step}>Step 3 of 5</Text>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.sub}>We'll adjust your calorie target based on your goal and pace.</Text>

        <Text style={styles.label}>Goal</Text>
        <View style={styles.goalRow}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[styles.goalBtn, goal.value === g.value && styles.goalBtnActive]}
              onPress={() => setGoal(g)}
            >
              <Text style={[styles.goalBtnText, goal.value === g.value && styles.goalBtnTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {goal.value !== 'maintain' && (
          <>
            <Text style={styles.label}>Goal weight (lbs)</Text>
            <TextInput
              style={[styles.input, { marginBottom: 24 }]}
              keyboardType="numeric"
              value={goalWeight}
              onChangeText={setGoalWeight}
              placeholder={goal.value === 'lose' ? '140' : '180'}
            />

            <Text style={styles.label}>{goal.value === 'lose' ? 'Loss' : 'Gain'} per week</Text>
            <View style={styles.rateRow}>
              {RATES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rateBtn, rate === r && styles.rateBtnActive]}
                  onPress={() => setRate(r)}
                >
                  <Text style={[styles.rateBtnText, rate === r && styles.rateBtnTextActive]}>
                    {r} lb
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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
  goalRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  goalBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  goalBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  goalBtnText: { fontSize: 13, color: '#555', fontWeight: '500', textAlign: 'center' },
  goalBtnTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 16, fontSize: 16, backgroundColor: '#f9f9f9' },
  rateRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  rateBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  rateBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  rateBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  rateBtnTextActive: { color: '#fff' },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
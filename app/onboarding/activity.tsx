import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', description: 'Desk job, little or no exercise', multiplier: 1.2 },
  { label: 'Lightly active', description: '1–3 days of exercise per week', multiplier: 1.375 },
  { label: 'Moderately active', description: '3–5 days of exercise per week', multiplier: 1.55 },
  { label: 'Very active', description: '6–7 days of exercise per week', multiplier: 1.725 },
  { label: 'Extremely active', description: 'Physical job and daily training', multiplier: 1.9 },
];

export default function ActivityScreen() {
  const router = useRouter();
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[1]);

  async function handleNext() {
    await AsyncStorage.setItem('userActivity', JSON.stringify(activity));
    router.push('/onboarding/summary');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <Text style={styles.step}>Step 4 of 5</Text>
      <Text style={styles.title}>How active are you?</Text>
      <Text style={styles.sub}>Be honest — this directly affects your calorie target.</Text>

      {ACTIVITY_LEVELS.map(level => (
        <TouchableOpacity
          key={level.label}
          style={[styles.activityBtn, activity.label === level.label && styles.activityBtnActive]}
          onPress={() => setActivity(level)}
        >
          <Text style={[styles.activityLabel, activity.label === level.label && styles.activityLabelActive]}>
            {level.label}
          </Text>
          <Text style={[styles.activityDesc, activity.label === level.label && styles.activityDescActive]}>
            {level.description}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
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
  activityBtn: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ddd', marginBottom: 10, backgroundColor: '#f9f9f9' },
  activityBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  activityLabel: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 3 },
  activityLabelActive: { color: '#fff' },
  activityDesc: { fontSize: 13, color: '#888' },
  activityDescActive: { color: '#ccc' },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
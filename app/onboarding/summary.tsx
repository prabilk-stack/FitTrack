import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SummaryScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    calculate();
  }, []);

  async function calculate() {
    try {
      const [nameRaw, bodyRaw, goalRaw, activityRaw] = await Promise.all([
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userBody'),
        AsyncStorage.getItem('userGoal'),
        AsyncStorage.getItem('userActivity'),
      ]);

      const n = nameRaw || '';
      const body = bodyRaw ? JSON.parse(bodyRaw) : null;
      const goal = goalRaw ? JSON.parse(goalRaw) : null;
      const activity = activityRaw ? JSON.parse(activityRaw) : null;

      if (!body || !goal || !activity) return;

      setName(n);

      const weightKg = parseFloat(body.weightLbs) * 0.453592;
      const heightCm = (parseFloat(body.heightFt) * 30.48) + (parseFloat(body.heightIn || '0') * 2.54);
      const ageNum = parseFloat(body.age);

      let bmr;
      if (body.sex === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) + 5;
      } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) - 161;
      }

      const tdee = Math.round(bmr * activity.multiplier);

      let targetCalories = tdee;
      if (goal.goal === 'lose') targetCalories = tdee - (goal.rate * 500);
      if (goal.goal === 'gain') targetCalories = tdee + (goal.rate * 500);
      targetCalories = Math.round(targetCalories);

      const protein = Math.round(parseFloat(body.weightLbs) * 0.9);
      const fat = Math.round((targetCalories * 0.27) / 9);
      const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

      const weeksToGoal = goal.goalWeight
        ? Math.abs(Math.round((parseFloat(body.weightLbs) - parseFloat(goal.goalWeight)) / goal.rate))
        : null;

      const macroGoals = {
        tdee,
        targetCalories,
        protein,
        fat,
        carbs,
        goal: goal.goalLabel,
        rate: goal.rate,
        goalWeight: goal.goalWeight || null,
        weeksToGoal,
      };

      await AsyncStorage.setItem('macroGoals', JSON.stringify(macroGoals));
      await AsyncStorage.setItem('onboardingComplete', 'true');
      setResults(macroGoals);
    } catch (e) {
      console.log('Error calculating summary', e);
    }
  }

  async function handleFinish() {
    router.replace('/(tabs)/dashboard');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.progress}>
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
      </View>

      <Text style={styles.step}>Step 5 of 5</Text>
      <Text style={styles.title}>
        {name ? `You're all set, ${name}!` : "You're all set!"}
      </Text>
      <Text style={styles.sub}>Here are your personalized daily targets.</Text>

      {results && (
        <>
          <View style={styles.calCard}>
            <Text style={styles.calLabel}>Daily calorie target</Text>
            <Text style={styles.calNum}>{results.targetCalories.toLocaleString()} kcal</Text>
            <Text style={styles.calSub}>TDEE {results.tdee.toLocaleString()} kcal · {results.goal}</Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{results.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{results.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{results.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          {results.weeksToGoal && (
            <View style={styles.timelineCard}>
              <Text style={styles.timelineText}>
                At {results.rate} lb/week you'll reach {results.goalWeight} lbs in approximately{' '}
                <Text style={styles.timelineBold}>{results.weeksToGoal} weeks</Text>
              </Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleFinish}>
        <Text style={styles.buttonText}>Let's go</Text>
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
  calCard: { backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 12 },
  calLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  calNum: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  calSub: { fontSize: 13, color: '#555' },
  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  macroCard: { flex: 1, backgroundColor: '#f4f4f4', borderRadius: 14, padding: 14, alignItems: 'center' },
  macroValue: { fontSize: 22, fontWeight: '700', color: '#111' },
  macroLabel: { fontSize: 11, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  timelineCard: { backgroundColor: '#f4f4f4', borderRadius: 14, padding: 16, marginBottom: 12 },
  timelineText: { fontSize: 14, color: '#555', lineHeight: 22 },
  timelineBold: { fontWeight: '700', color: '#111' },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ACTIVITY_LEVELS = [
  { label: 'Sedentary', description: 'Little or no exercise', multiplier: 1.2 },
  { label: 'Lightly active', description: '1-3 days/week', multiplier: 1.375 },
  { label: 'Moderately active', description: '3-5 days/week', multiplier: 1.55 },
  { label: 'Very active', description: '6-7 days/week', multiplier: 1.725 },
  { label: 'Extremely active', description: 'Physical job + training', multiplier: 1.9 },
];

const GOALS = [
  { label: 'Lose weight', value: 'lose' },
  { label: 'Maintain', value: 'maintain' },
  { label: 'Gain weight', value: 'gain' },
];

const RATES = [0.5, 1, 1.5, 2];

export default function GoalsScreen() {
  const [sex, setSex] = useState('male');
  const [age, setAge] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [activity, setActivity] = useState(ACTIVITY_LEVELS[1]);
  const [goal, setGoal] = useState(GOALS[1]);
  const [rate, setRate] = useState(1);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const saved = await AsyncStorage.getItem('macroGoals');
      if (saved) setGoals(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading goals', e);
    }
  }

  function calculate() {
    if (!age || !weightLbs || !heightFt) {
      Alert.alert('Missing info', 'Please fill in age, weight, and height.');
      return;
    }
    if (goal.value !== 'maintain' && !goalWeight) {
      Alert.alert('Missing info', 'Please enter your goal weight.');
      return;
    }

    const weightKg = parseFloat(weightLbs) * 0.453592;
    const heightCm = (parseFloat(heightFt) * 30.48) + (parseFloat(heightIn || '0') * 2.54);
    const ageNum = parseFloat(age);

    let bmr;
    if (sex === 'male') {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) + 5;
    } else {
      bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageNum) - 161;
    }

    const tdee = Math.round(bmr * activity.multiplier);

    let targetCalories = tdee;
    if (goal.value === 'lose') targetCalories = tdee - (rate * 500);
    if (goal.value === 'gain') targetCalories = tdee + (rate * 500);
    targetCalories = Math.round(targetCalories);

    const protein = Math.round(parseFloat(weightLbs) * 0.9);
    const fat = Math.round((targetCalories * 0.27) / 9);
    const carbs = Math.round((targetCalories - (protein * 4) - (fat * 9)) / 4);

    const weeksToGoal = goalWeight
      ? Math.abs(Math.round((parseFloat(weightLbs) - parseFloat(goalWeight)) / rate))
      : null;

    const result = {
      tdee,
      targetCalories,
      protein,
      fat,
      carbs,
      goal: goal.label,
      rate,
      goalWeight: goalWeight || null,
      weeksToGoal,
    };

    setGoals(result);
    AsyncStorage.setItem('macroGoals', JSON.stringify(result));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Goals</Text>
      <Text style={styles.subtitle}>We'll calculate your daily targets using the Mifflin-St Jeor formula.</Text>

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

      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            placeholder="25"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current weight (lbs)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={weightLbs}
            onChangeText={setWeightLbs}
            placeholder="160"
          />
        </View>
      </View>

      <Text style={styles.label}>Height</Text>
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={heightFt}
            onChangeText={setHeightFt}
            placeholder="5 ft"
          />
        </View>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={heightIn}
            onChangeText={setHeightIn}
            placeholder="10 in"
          />
        </View>
      </View>

      <Text style={styles.label}>Activity level</Text>
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

      <Text style={styles.label}>Goal</Text>
      <View style={styles.row}>
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
            style={[styles.input, { marginBottom: 20 }]}
            keyboardType="numeric"
            value={goalWeight}
            onChangeText={setGoalWeight}
            placeholder={goal.value === 'lose' ? '140' : '180'}
          />

          <Text style={styles.label}>Rate ({goal.value === 'lose' ? 'loss' : 'gain'} per week)</Text>
          <View style={styles.row}>
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

      <TouchableOpacity style={styles.button} onPress={calculate}>
        <Text style={styles.buttonText}>Calculate my goals</Text>
      </TouchableOpacity>

      {goals && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Your daily targets</Text>

          <Text style={styles.tdee}>{goals.targetCalories} kcal/day</Text>
          <Text style={styles.tdeeLabel}>
            {goals.goal} · TDEE {goals.tdee} kcal
            {goals.goal !== 'Maintain' ? ` · ${goals.rate} lb/week` : ''}
          </Text>

          {goals.weeksToGoal && (
            <View style={styles.timelineCard}>
              <Text style={styles.timelineText}>
                At this rate you'll reach {goals.goalWeight} lbs in approximately{' '}
                <Text style={styles.timelineBold}>{goals.weeksToGoal} weeks</Text>
              </Text>
            </View>
          )}

          <View style={styles.macroRow}>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{goals.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{goals.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{goals.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  inputGroup: { flex: 1 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  sexBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  sexBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  sexBtnText: { fontSize: 15, color: '#555', fontWeight: '500' },
  sexBtnTextActive: { color: '#fff' },
  activityBtn: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 8, backgroundColor: '#f9f9f9' },
  activityBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  activityLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  activityLabelActive: { color: '#fff' },
  activityDesc: { fontSize: 12, color: '#888' },
  activityDescActive: { color: '#ccc' },
  goalBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  goalBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  goalBtnText: { fontSize: 13, color: '#555', fontWeight: '500', textAlign: 'center' },
  goalBtnTextActive: { color: '#fff' },
  rateBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  rateBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  rateBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  rateBtnTextActive: { color: '#fff' },
  button: { backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultsSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24, marginBottom: 40 },
  resultsTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  tdee: { fontSize: 36, fontWeight: 'bold', color: '#111' },
  tdeeLabel: { fontSize: 13, color: '#888', marginBottom: 16 },
  timelineCard: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 14, marginBottom: 20 },
  timelineText: { fontSize: 14, color: '#555', lineHeight: 20 },
  timelineBold: { fontWeight: '700', color: '#111' },
  macroRow: { flexDirection: 'row', gap: 10 },
  macroCard: { flex: 1, backgroundColor: '#f4f4f4', borderRadius: 12, padding: 14, alignItems: 'center' },
  macroValue: { fontSize: 20, fontWeight: '700', color: '#111' },
  macroLabel: { fontSize: 11, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
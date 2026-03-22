import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [nutritionLog, setNutritionLog] = useState([]);
  const [workoutLog, setWorkoutLog] = useState([]);
  const [bodyweightLog, setBodyweightLog] = useState([]);
  const [goals, setGoals] = useState(null);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  async function loadAll() {
    try {
      const [nutrition, workout, bodyweight, savedGoals] = await Promise.all([
        AsyncStorage.getItem('nutritionLog'),
        AsyncStorage.getItem('workoutLog'),
        AsyncStorage.getItem('bodyweightLog'),
        AsyncStorage.getItem('macroGoals'),
      ]);
      const n = nutrition ? JSON.parse(nutrition) : [];
      const w = workout ? JSON.parse(workout) : [];
      const b = bodyweight ? JSON.parse(bodyweight) : [];
      const g = savedGoals ? JSON.parse(savedGoals) : null;
      setNutritionLog(n);
      setWorkoutLog(w);
      setBodyweightLog(b);
      setGoals(g);
      calculateStreak(n, w);
    } catch (e) {
      console.log('Error loading dashboard', e);
    }
  }

  function calculateStreak(nutrition, workout) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const hasNutrition = nutrition.some(e => new Date(e.date).toDateString() === dateStr);
      const hasWorkout = workout.some(e => new Date(e.date || Date.now()).toDateString() === dateStr);
      if (hasNutrition || hasWorkout) count++;
      else if (i > 0) break;
    }
    setStreak(count);
  }

  const totals = nutritionLog.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories),
      protein: acc.protein + Number(e.protein),
      carbs: acc.carbs + Number(e.carbs),
      fat: acc.fat + Number(e.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calPct = goals ? Math.min(totals.calories / goals.targetCalories, 1) : 0;
  const proteinPct = goals ? Math.min(totals.protein / goals.protein, 1) : 0;
  const carbsPct = goals ? Math.min(totals.carbs / goals.carbs, 1) : 0;
  const fatPct = goals ? Math.min(totals.fat / goals.fat, 1) : 0;

  const latestWeight = bodyweightLog[0]?.weight;
  const oldestWeight = bodyweightLog.length > 1 ? bodyweightLog[bodyweightLog.length - 1]?.weight : null;
  const weightChange = latestWeight && oldestWeight ? (latestWeight - oldestWeight).toFixed(1) : null;

  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const lastWorkout = workoutLog[0];
  const uniqueExercises = [...new Set(workoutLog.map(e => e.exercise))];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.date}>{dateStr}</Text>

      <View style={styles.streakBar}>
        <View style={[styles.streakDot, { backgroundColor: streak > 0 ? '#1D9E75' : '#ddd' }]} />
        <Text style={styles.streakText}>
          {streak > 0 ? `${streak} day streak` : 'No activity logged yet'}
        </Text>
        <View style={styles.streakPips}>
          {[...Array(7)].map((_, i) => (
            <View
              key={i}
              style={[styles.pip, { backgroundColor: i < streak ? '#1D9E75' : '#eee' }]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Today's nutrition</Text>
      <TouchableOpacity style={styles.calCard} onPress={() => router.push('/(tabs)/explore')}>
        <View style={styles.calTop}>
          <View>
            <Text style={styles.calLabel}>Calories</Text>
            <View style={styles.calNumRow}>
              <Text style={styles.calNum}>{Math.round(totals.calories).toLocaleString()}</Text>
              {goals && <Text style={styles.calTarget}>/ {goals.targetCalories.toLocaleString()} kcal</Text>}
            </View>
          </View>
          {goals && <Text style={styles.calPct}>{Math.round(calPct * 100)}%</Text>}
        </View>
        <View style={styles.calBarTrack}>
          <View style={[styles.calBarFill, { width: `${Math.round(calPct * 100)}%` }]} />
        </View>
        <View style={styles.macroRow}>
          {[
            { label: 'Protein', pct: proteinPct, val: totals.protein, target: goals?.protein, color: '#7F77DD' },
            { label: 'Carbs', pct: carbsPct, val: totals.carbs, target: goals?.carbs, color: '#1D9E75' },
            { label: 'Fat', pct: fatPct, val: totals.fat, target: goals?.fat, color: '#D85A30' },
          ].map(m => (
            <View key={m.label} style={styles.macroItem}>
              <Text style={styles.macroLabel}>{m.label}</Text>
              <View style={styles.macroBarTrack}>
                <View style={[styles.macroBarFill, { width: `${Math.round(m.pct * 100)}%`, backgroundColor: m.color }]} />
              </View>
              <Text style={styles.macroVal}>
                {Math.round(m.val)}g{m.target ? ` / ${m.target}g` : ''}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      <View style={styles.cardsGrid}>
        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(tabs)/index')}>
          <Text style={styles.navCardLabel}>Workout</Text>
          {workoutLog.length > 0 ? (
            <>
              <Text style={styles.navCardValue}>{workoutLog.length} sets</Text>
              <Text style={styles.navCardSub}>{uniqueExercises.slice(0, 2).join(', ')}</Text>
            </>
          ) : (
            <>
              <Text style={styles.navCardValue}>—</Text>
              <Text style={styles.navCardSub}>Nothing logged yet</Text>
            </>
          )}
          <Text style={styles.navCardArrow}>Log more →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(tabs)/goals')}>
          <Text style={styles.navCardLabel}>Goals</Text>
          {goals ? (
            <>
              <Text style={styles.navCardValue}>{goals.goal.split(' ')[0]}</Text>
              <Text style={styles.navCardSub}>{goals.rate ? `${goals.rate} lb/week` : 'Maintain'} · {goals.targetCalories} kcal</Text>
            </>
          ) : (
            <>
              <Text style={styles.navCardValue}>—</Text>
              <Text style={styles.navCardSub}>No goals set yet</Text>
            </>
          )}
          <Text style={styles.navCardArrow}>Edit →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Body weight</Text>
      <TouchableOpacity style={styles.weightCard} onPress={() => router.push('/(tabs)/bodyweight')}>
        <View style={styles.weightStats}>
          <View>
            <Text style={styles.weightStatLabel}>Current</Text>
            <Text style={styles.weightStatVal}>{latestWeight ? `${latestWeight} lbs` : '—'}</Text>
          </View>
          {goals?.goalWeight && (
            <View>
              <Text style={styles.weightStatLabel}>Goal</Text>
              <Text style={[styles.weightStatVal, { color: '#534AB7' }]}>{goals.goalWeight} lbs</Text>
            </View>
          )}
          {weightChange !== null && (
            <View>
              <Text style={styles.weightStatLabel}>Change</Text>
              <Text style={[styles.weightStatVal, { color: parseFloat(weightChange) < 0 ? '#1D9E75' : '#E24B4A' }]}>
                {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange}
              </Text>
            </View>
          )}
        </View>
        {bodyweightLog.length < 2 && (
          <Text style={styles.weightHint}>Log more entries to see your trend</Text>
        )}
        {bodyweightLog.length >= 2 && (
          <View style={styles.miniChart}>
            {[...bodyweightLog].reverse().slice(-6).map((e, i, arr) => {
              const weights = arr.map(x => x.weight);
              const min = Math.min(...weights);
              const max = Math.max(...weights);
              const range = max - min || 1;
              const h = 8 + ((e.weight - min) / range) * 20;
              return (
                <View
                  key={i}
                  style={[styles.chartBar, { height: h, backgroundColor: i === arr.length - 1 ? '#111' : '#ddd' }]}
                />
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  greeting: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 4 },
  date: { fontSize: 13, color: '#888', marginBottom: 24 },
  streakBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f4f4f4', borderRadius: 12, padding: 12, marginBottom: 24 },
  streakDot: { width: 8, height: 8, borderRadius: 4 },
  streakText: { fontSize: 13, color: '#111', fontWeight: '500', flex: 1 },
  streakPips: { flexDirection: 'row', gap: 4 },
  pip: { width: 20, height: 4, borderRadius: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 10 },
  calCard: { backgroundColor: '#111', borderRadius: 16, padding: 16, marginBottom: 12 },
  calTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  calLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  calNumRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  calNum: { fontSize: 28, fontWeight: '700', color: '#fff' },
  calTarget: { fontSize: 13, color: '#555' },
  calPct: { fontSize: 13, color: '#555' },
  calBarTrack: { height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  calBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroItem: { flex: 1 },
  macroLabel: { fontSize: 10, color: '#666', marginBottom: 4 },
  macroBarTrack: { height: 3, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  macroBarFill: { height: '100%', borderRadius: 2 },
  macroVal: { fontSize: 11, color: '#aaa' },
  cardsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  navCard: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 14, borderWidth: 0.5, borderColor: '#eee', padding: 14 },
  navCardLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 6 },
  navCardValue: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 2 },
  navCardSub: { fontSize: 11, color: '#888' },
  navCardArrow: { fontSize: 11, color: '#ccc', marginTop: 8 },
  weightCard: { backgroundColor: '#f9f9f9', borderRadius: 14, borderWidth: 0.5, borderColor: '#eee', padding: 14, marginBottom: 40 },
  weightStats: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  weightStatLabel: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 2 },
  weightStatVal: { fontSize: 16, fontWeight: '700', color: '#111' },
  weightHint: { fontSize: 12, color: '#bbb' },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 32 },
  chartBar: { width: 8, borderRadius: 2 },
});
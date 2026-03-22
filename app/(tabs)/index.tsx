import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated, PanResponder,
  ScrollView,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getTodayRange, getUserId, supabase } from '../supabase';

const EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press',
  'Barbell Row', 'Pull Up', 'Dumbbell Curl', 'Tricep Dip'
];

function SwipeableEntry({ children, onDelete }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dy) < 20,
    onPanResponderMove: (_, g) => {
      if (g.dx < 0) translateX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -80) {
        Animated.timing(translateX, { toValue: -80, duration: 100, useNativeDriver: true }).start();
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  })).current;

  return (
    <View style={{ marginBottom: 10, position: 'relative' }}>
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          Animated.timing(translateX, { toValue: -400, duration: 200, useNativeDriver: true }).start(onDelete);
        }}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [log, setLog] = useState([]);

  useEffect(() => {
    loadLog();
  }, []);

  async function loadLog() {
    try {
      const userId = await getUserId();
      if (userId) {
        const { start, end } = getTodayRange();
        const { data, error } = await supabase
          .from('workout_log')
          .select('*')
          .eq('user_id', userId)
          .gte('logged_at', start)
          .lte('logged_at', end)
          .order('logged_at', { ascending: false });
        if (!error && data) {
          setLog(data.map(e => ({
            id: e.id,
            exercise: e.exercise,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
          })));
          return;
        }
      }
      const saved = await AsyncStorage.getItem('workoutLog');
      const lastDate = await AsyncStorage.getItem('workoutLogDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        setLog([]);
      } else if (saved) {
        setLog(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading workout log', e);
    }
  }

  async function saveSet() {
    if (!selectedExercise || !sets || !reps || !weight) {
      Alert.alert('Missing info', 'Please fill in all fields and select an exercise.');
      return;
    }
    const entry = { exercise: selectedExercise, sets, reps, weight, id: Date.now() };
    const newLog = [entry, ...log];
    setLog(newLog);

    try {
      const userId = await getUserId();
      if (userId) {
        const { error } = await supabase.from('workout_log').insert({
          user_id: userId,
          exercise: selectedExercise,
          sets,
          reps,
          weight,
        });
        if (error) console.log('Supabase error', error.message);
      } else {
        await AsyncStorage.setItem('workoutLog', JSON.stringify(newLog));
        await AsyncStorage.setItem('workoutLogDate', new Date().toDateString());
      }
    } catch (e) {
      console.log('Error saving set', e);
    }

    setSets('');
    setReps('');
    setWeight('');
  }

  async function deleteEntry(entry) {
    const newLog = log.filter(e => e.id !== entry.id);
    setLog(newLog);
    try {
      const userId = await getUserId();
      if (userId && typeof entry.id === 'string') {
        await supabase.from('workout_log').delete().eq('id', entry.id);
      } else {
        await AsyncStorage.setItem('workoutLog', JSON.stringify(newLog));
      }
    } catch (e) {
      console.log('Error deleting entry', e);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log Workout</Text>

      <TouchableOpacity style={styles.cardioButton} onPress={() => router.push('/(tabs)/cardio')}>
        <Text style={styles.cardioButtonText}>Start cardio activity</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Select an exercise</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
        {EXERCISES.map(ex => (
          <TouchableOpacity
            key={ex}
            style={[styles.pill, selectedExercise === ex && styles.pillActive]}
            onPress={() => {
              setSelectedExercise(ex);
              setSets('');
              setReps('');
              setWeight('');
            }}
          >
            <Text style={[styles.pillText, selectedExercise === ex && styles.pillTextActive]}>
              {ex}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedExercise ? (
        <>
          <Text style={styles.selectedLabel}>
            Logging: <Text style={styles.selectedName}>{selectedExercise}</Text>
          </Text>
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sets</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={sets} onChangeText={setSets} placeholder="3" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reps</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={reps} onChangeText={setReps} placeholder="10" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="135" />
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={saveSet}>
            <Text style={styles.buttonText}>Save Set</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.hint}>Tap an exercise above to get started</Text>
      )}

      {log.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>Today's Workout</Text>
          {log.map(entry => (
            <SwipeableEntry key={entry.id} onDelete={() => deleteEntry(entry)}>
              <View style={styles.logEntry}>
                <Text style={styles.logExercise}>{entry.exercise}</Text>
                <Text style={styles.logDetail}>
                  {entry.sets} sets × {entry.reps} reps @ {entry.weight} lbs
                </Text>
              </View>
            </SwipeableEntry>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  cardioButton: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#eee' },
  cardioButtonText: { fontSize: 14, fontWeight: '600', color: '#111' },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pills: { flexDirection: 'row', marginBottom: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#f9f9f9' },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontSize: 14, color: '#555' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 32, marginBottom: 32 },
  selectedLabel: { fontSize: 14, color: '#888', marginBottom: 20, marginTop: 8 },
  selectedName: { color: '#111', fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  inputGroup: { flex: 1 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24 },
  logTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  logEntry: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14 },
  logExercise: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  logDetail: { fontSize: 14, color: '#666' },
  deleteAction: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, backgroundColor: '#E24B4A', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deleteActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
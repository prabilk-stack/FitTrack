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

const EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press',
  'Barbell Row', 'Pull Up', 'Dumbbell Curl', 'Tricep Dip'
];

export default function HomeScreen() {
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
      const saved = await AsyncStorage.getItem('workoutLog');
      const lastDate = await AsyncStorage.getItem('workoutLogDate');
      const today = new Date().toDateString();

      if (lastDate !== today) {
        await AsyncStorage.setItem('workoutLog', JSON.stringify([]));
        await AsyncStorage.setItem('workoutLogDate', today);
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
    await AsyncStorage.setItem('workoutLog', JSON.stringify(newLog));
    await AsyncStorage.setItem('workoutLogDate', new Date().toDateString());
    setSets('');
    setReps('');
    setWeight('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Log Workout</Text>

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
          <Text style={styles.selectedLabel}>Logging: <Text style={styles.selectedName}>{selectedExercise}</Text></Text>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sets</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sets}
                onChangeText={setSets}
                placeholder="3"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reps</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
                placeholder="10"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="135"
              />
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
            <View key={entry.id} style={styles.logEntry}>
              <Text style={styles.logExercise}>{entry.exercise}</Text>
              <Text style={styles.logDetail}>
                {entry.sets} sets × {entry.reps} reps @ {entry.weight} lbs
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 24 },
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
  logEntry: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 10 },
  logExercise: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  logDetail: { fontSize: 14, color: '#666' },
});
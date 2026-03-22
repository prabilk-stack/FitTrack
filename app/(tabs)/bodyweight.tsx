import AsyncStorage from '@react-native-async-storage/async-storage';
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
    <View style={{ marginBottom: 8, position: 'relative' }}>
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

export default function BodyWeightScreen() {
  const [weight, setWeight] = useState('');
  const [log, setLog] = useState([]);
  const [goalWeight, setGoalWeight] = useState(null);

  useEffect(() => {
    loadLog();
    loadGoalWeight();
  }, []);

  async function loadLog() {
    try {
      const saved = await AsyncStorage.getItem('bodyweightLog');
      if (saved) setLog(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading bodyweight log', e);
    }
  }

  async function loadGoalWeight() {
    try {
      const saved = await AsyncStorage.getItem('macroGoals');
      if (saved) {
        const goals = JSON.parse(saved);
        if (goals.goalWeight) setGoalWeight(parseFloat(goals.goalWeight));
      }
    } catch (e) {
      console.log('Error loading goal weight', e);
    }
  }

  async function saveWeight() {
    if (!weight) {
      Alert.alert('Missing info', 'Please enter your weight.');
      return;
    }
    const now = new Date();
    const timestamp = now.toLocaleString();
    const entry = { weight: parseFloat(weight), date: timestamp };
    const newLog = [entry, ...log].slice(0, 90);
    setLog(newLog);
    await AsyncStorage.setItem('bodyweightLog', JSON.stringify(newLog));
    setWeight('');
  }

  async function deleteWeightEntry(index) {
    const newLog = log.filter((_, i) => i !== index);
    setLog(newLog);
    await AsyncStorage.setItem('bodyweightLog', JSON.stringify(newLog));
  }

  const latest = log[0]?.weight;
  const oldest = log.length > 1 ? log[log.length - 1]?.weight : null;
  const change = latest && oldest ? (latest - oldest).toFixed(1) : null;
  const toGoal = latest && goalWeight ? (latest - goalWeight).toFixed(1) : null;

  function MiniChart() {
    if (log.length < 2) return null;
    const weights = [...log].reverse().map(e => e.weight);
    const min = Math.min(...weights) - 2;
    const max = Math.max(...weights) + 2;
    const range = max - min || 1;
    const W = 300;
    const H = 80;

    return (
      <View style={styles.chartWrap}>
        <View style={{ width: W, height: H, position: 'relative' }}>
          {weights.map((w, i) => {
            if (i === 0) return null;
            const x1 = ((i - 1) / (weights.length - 1)) * W;
            const y1 = H - ((weights[i - 1] - min) / range) * H;
            const x2 = (i / (weights.length - 1)) * W;
            const y2 = H - ((w - min) / range) * H;
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: x1,
                  top: y1,
                  width: length,
                  height: 2,
                  backgroundColor: '#111',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0 0',
                }}
              />
            );
          })}
          {weights.map((w, i) => {
            const x = (i / (weights.length - 1)) * W;
            const y = H - ((w - min) / range) * H;
            return (
              <View
                key={`dot-${i}`}
                style={{
                  position: 'absolute',
                  left: x - 4,
                  top: y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#111',
                }}
              />
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>{[...log].reverse()[0].weight} lbs</Text>
          <Text style={styles.chartLabel}>{[...log].reverse()[log.length - 1].weight} lbs</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Body Weight</Text>

      {log.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{latest} lbs</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          {change !== null && (
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: parseFloat(change) < 0 ? '#1D9E75' : parseFloat(change) > 0 ? '#E24B4A' : '#111' }]}>
                {parseFloat(change) > 0 ? '+' : ''}{change} lbs
              </Text>
              <Text style={styles.statLabel}>Total change</Text>
            </View>
          )}
          {toGoal !== null && (
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#534AB7' }]}>
                {Math.abs(parseFloat(toGoal))} lbs
              </Text>
              <Text style={styles.statLabel}>To goal</Text>
            </View>
          )}
        </View>
      )}

      <MiniChart />

      <Text style={styles.label}>Log today's weight</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 165.5"
        />
        <TouchableOpacity style={styles.button} onPress={saveWeight}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {log.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>History</Text>
          {log.map((entry, i) => (
  <SwipeableEntry key={entry.date + entry.weight} onDelete={() => deleteWeightEntry(i)}>
              <View style={styles.logEntry}>
                <Text style={styles.logDate}>{entry.date}</Text>
                <Text style={styles.logWeight}>{entry.weight} lbs</Text>
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#f4f4f4', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartWrap: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, marginBottom: 24 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  chartLabel: { fontSize: 11, color: '#888' },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24 },
  logTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  logEntry: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  logDate: { fontSize: 14, color: '#888' },
  logWeight: { fontSize: 14, fontWeight: '600', color: '#111' },
  deleteAction: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, backgroundColor: '#E24B4A', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  deleteActionText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
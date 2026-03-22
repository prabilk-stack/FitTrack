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

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function NutritionScreen() {
  const [selectedMeal, setSelectedMeal] = useState('');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [log, setLog] = useState([]);

  const totals = log.reduce(
    (acc, entry) => ({
      calories: acc.calories + Number(entry.calories),
      protein: acc.protein + Number(entry.protein),
      carbs: acc.carbs + Number(entry.carbs),
      fat: acc.fat + Number(entry.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  useEffect(() => {
    loadLog();
  }, []);

  async function loadLog() {
    try {
      const saved = await AsyncStorage.getItem('nutritionLog');
      if (saved) setLog(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading nutrition log', e);
    }
  }

  async function saveFood() {
    if (!selectedMeal || !foodName || !calories || !protein || !carbs || !fat) {
      Alert.alert('Missing info', 'Please fill in all fields and select a meal.');
      return;
    }
    const entry = { selectedMeal, foodName, calories, protein, carbs, fat, id: Date.now() };
    const newLog = [entry, ...log];
    setLog(newLog);
    await AsyncStorage.setItem('nutritionLog', JSON.stringify(newLog));
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nutrition</Text>

      {log.length > 0 && (
        <View style={styles.totalsRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.calories}</Text>
            <Text style={styles.totalLabel}>kcal</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.protein}g</Text>
            <Text style={styles.totalLabel}>protein</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.carbs}g</Text>
            <Text style={styles.totalLabel}>carbs</Text>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalValue}>{totals.fat}g</Text>
            <Text style={styles.totalLabel}>fat</Text>
          </View>
        </View>
      )}

      <Text style={styles.label}>Meal</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
        {MEALS.map(meal => (
          <TouchableOpacity
            key={meal}
            style={[styles.pill, selectedMeal === meal && styles.pillActive]}
            onPress={() => setSelectedMeal(meal)}
          >
            <Text style={[styles.pillText, selectedMeal === meal && styles.pillTextActive]}>
              {meal}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedMeal ? (
        <>
          <Text style={styles.selectedLabel}>
            Adding to: <Text style={styles.selectedName}>{selectedMeal}</Text>
          </Text>

          <Text style={styles.label}>Food name</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="e.g. Chicken breast"
          />

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calories</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={calories}
                onChangeText={setCalories}
                placeholder="300"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={protein}
                onChangeText={setProtein}
                placeholder="30"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={carbs}
                onChangeText={setCarbs}
                placeholder="20"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={fat}
                onChangeText={setFat}
                placeholder="10"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={saveFood}>
            <Text style={styles.buttonText}>Save Food</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.hint}>Tap a meal above to get started</Text>
      )}

      {log.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>Today's Food</Text>
          {log.map(entry => (
            <View key={entry.id} style={styles.logEntry}>
              <View style={styles.logEntryTop}>
                <Text style={styles.logFood}>{entry.foodName}</Text>
                <Text style={styles.logMeal}>{entry.selectedMeal}</Text>
              </View>
              <Text style={styles.logDetail}>
                {entry.calories} kcal · {entry.protein}g protein · {entry.carbs}g carbs · {entry.fat}g fat
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
  totalsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  totalCard: { flex: 1, backgroundColor: '#f4f4f4', borderRadius: 12, padding: 12, alignItems: 'center' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#111' },
  totalLabel: { fontSize: 11, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pills: { flexDirection: 'row', marginBottom: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#f9f9f9' },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontSize: 14, color: '#555' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 32, marginBottom: 32 },
  selectedLabel: { fontSize: 14, color: '#888', marginBottom: 20, marginTop: 8 },
  selectedName: { color: '#111', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputGroup: { flex: 1 },
  button: { backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24 },
  logTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  logEntry: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 10 },
  logEntryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logFood: { fontSize: 15, fontWeight: '600', color: '#111' },
  logMeal: { fontSize: 12, color: '#888', fontWeight: '500' },
  logDetail: { fontSize: 13, color: '#666' },
});

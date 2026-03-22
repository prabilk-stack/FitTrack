import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert, Modal,
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
  const [quantity, setQuantity] = useState('1');
  const [baseNutrition, setBaseNutrition] = useState(null);
  const [log, setLog] = useState([]);
  const [goalTargets, setGoalTargets] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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
    loadGoals();
  }, []);

  async function loadLog() {
    try {
      const saved = await AsyncStorage.getItem('nutritionLog');
      const lastDate = await AsyncStorage.getItem('nutritionLogDate');
      const today = new Date().toDateString();
      if (lastDate !== today) {
        await AsyncStorage.setItem('nutritionLog', JSON.stringify([]));
        await AsyncStorage.setItem('nutritionLogDate', today);
        setLog([]);
      } else if (saved) {
        setLog(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Error loading nutrition log', e);
    }
  }

  async function loadGoals() {
    try {
      const saved = await AsyncStorage.getItem('macroGoals');
      if (saved) setGoalTargets(JSON.parse(saved));
    } catch (e) {
      console.log('Error loading goals', e);
    }
  }

  async function openScanner() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access to scan barcodes.');
        return;
      }
    }
    setScanning(true);
    setScannerOpen(true);
  }

  async function handleBarcodeScan({ data }) {
    if (!scanning) return;
    setScanning(false);
    setScannerOpen(false);
    setLoadingProduct(true);

    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await res.json();

      if (json.status !== 1 || !json.product) {
        Alert.alert('Product not found', 'This barcode wasn\'t found in the Open Food Facts database. Please enter nutrition manually.');
        setLoadingProduct(false);
        return;
      }

      const p = json.product;
      const nutriments = p.nutriments || {};
      const servingSize = p.serving_quantity || 100;

      const base = {
        name: p.product_name || 'Unknown product',
        calories: Math.round(nutriments['energy-kcal_serving'] || nutriments['energy-kcal_100g'] || 0),
        protein: Math.round((nutriments['proteins_serving'] || nutriments['proteins_100g'] || 0) * 10) / 10,
        carbs: Math.round((nutriments['carbohydrates_serving'] || nutriments['carbohydrates_100g'] || 0) * 10) / 10,
        fat: Math.round((nutriments['fat_serving'] || nutriments['fat_100g'] || 0) * 10) / 10,
        servingSize,
      };

      setBaseNutrition(base);
      setFoodName(base.name);
      setQuantity('1');
      setCalories(String(base.calories));
      setProtein(String(base.protein));
      setCarbs(String(base.carbs));
      setFat(String(base.fat));
    } catch (e) {
      Alert.alert('Error', 'Could not fetch product info. Please check your connection.');
    }
    setLoadingProduct(false);
  }

  function updateQuantity(q) {
    setQuantity(q);
    if (!baseNutrition || !q || isNaN(parseFloat(q))) return;
    const mult = parseFloat(q);
    setCalories(String(Math.round(baseNutrition.calories * mult)));
    setProtein(String(Math.round(baseNutrition.protein * mult * 10) / 10));
    setCarbs(String(Math.round(baseNutrition.carbs * mult * 10) / 10));
    setFat(String(Math.round(baseNutrition.fat * mult * 10) / 10));
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
    await AsyncStorage.setItem('nutritionLogDate', new Date().toDateString());
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setQuantity('1');
    setBaseNutrition(null);
  }

  function ProgressBar({ label, current, target, color, large }) {
    const pct = target ? Math.min(current / target, 1) : 0;
    const over = target ? current > target : false;
    return (
      <View style={large ? styles.bigBarWrap : styles.barWrap}>
        <View style={styles.barLabelRow}>
          <Text style={large ? styles.bigBarLabel : styles.barLabel}>{label}</Text>
          <Text style={large ? styles.bigBarNumbers : styles.barNumbers}>
            {Math.round(current)}
            {target ? <Text style={styles.barTarget}> / {target}{large ? ' kcal' : 'g'}</Text> : ''}
          </Text>
        </View>
        <View style={large ? styles.bigBarTrack : styles.barTrack}>
          <View style={[large ? styles.bigBarFill : styles.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: over ? '#E24B4A' : color }]} />
        </View>
        {over && <Text style={styles.overText}>+{Math.round(current - target)}{large ? ' kcal over' : 'g over'}</Text>}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nutrition</Text>

      {goalTargets ? (
        <View style={styles.progressSection}>
          <ProgressBar label="Calories" current={totals.calories} target={goalTargets.targetCalories} color="#111" large={true} />
          <ProgressBar label="Protein" current={totals.protein} target={goalTargets.protein} color="#534AB7" />
          <ProgressBar label="Carbs" current={totals.carbs} target={goalTargets.carbs} color="#1D9E75" />
          <ProgressBar label="Fat" current={totals.fat} target={goalTargets.fat} color="#D85A30" />
        </View>
      ) : (
        <View style={styles.noGoalsBanner}>
          <Text style={styles.noGoalsText}>Set your goals in the Goals tab to see progress tracking</Text>
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
            <Text style={[styles.pillText, selectedMeal === meal && styles.pillTextActive]}>{meal}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedMeal ? (
        <>
          <Text style={styles.selectedLabel}>
            Adding to: <Text style={styles.selectedName}>{selectedMeal}</Text>
          </Text>

          <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
            <Text style={styles.scanButtonText}>Scan barcode</Text>
          </TouchableOpacity>

          {loadingProduct && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#111" />
              <Text style={styles.loadingText}>Looking up product...</Text>
            </View>
          )}

          <Text style={styles.label}>Food name</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="e.g. Chicken breast"
          />

          {baseNutrition && (
            <View style={styles.quantityRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={updateQuantity}
                  placeholder="1"
                />
              </View>
              <View style={styles.servingInfo}>
                <Text style={styles.servingLabel}>Per serving</Text>
                <Text style={styles.servingVal}>{baseNutrition.calories} kcal</Text>
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calories</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={calories} onChangeText={setCalories} placeholder="300" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Protein (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={protein} onChangeText={setProtein} placeholder="30" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carbs (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={carbs} onChangeText={setCarbs} placeholder="20" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fat (g)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={fat} onChangeText={setFat} placeholder="10" />
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

      <Modal visible={scannerOpen} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarcodeScan : undefined}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>Point at a barcode</Text>
          </View>
          <TouchableOpacity style={styles.cancelScan} onPress={() => setScannerOpen(false)}>
            <Text style={styles.cancelScanText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  progressSection: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 16, marginBottom: 24 },
  noGoalsBanner: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 14, marginBottom: 24 },
  noGoalsText: { fontSize: 13, color: '#888', textAlign: 'center' },
  bigBarWrap: { marginBottom: 16 },
  barWrap: { marginBottom: 12 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  bigBarLabel: { fontSize: 15, fontWeight: '700', color: '#111' },
  barLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  bigBarNumbers: { fontSize: 15, fontWeight: '700', color: '#111' },
  barNumbers: { fontSize: 12, fontWeight: '600', color: '#555' },
  barTarget: { fontWeight: '400', color: '#aaa' },
  bigBarTrack: { height: 14, backgroundColor: '#e4e4e4', borderRadius: 7, overflow: 'hidden' },
  barTrack: { height: 8, backgroundColor: '#e4e4e4', borderRadius: 4, overflow: 'hidden' },
  bigBarFill: { height: '100%', borderRadius: 7 },
  barFill: { height: '100%', borderRadius: 4 },
  overText: { fontSize: 11, color: '#E24B4A', marginTop: 3 },
  label: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  pills: { flexDirection: 'row', marginBottom: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#f9f9f9' },
  pillActive: { backgroundColor: '#111', borderColor: '#111' },
  pillText: { fontSize: 14, color: '#555' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: 32, marginBottom: 32 },
  selectedLabel: { fontSize: 14, color: '#888', marginBottom: 16, marginTop: 8 },
  selectedName: { color: '#111', fontWeight: '700' },
  scanButton: { backgroundColor: '#f4f4f4', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  scanButtonText: { fontSize: 14, fontWeight: '600', color: '#111' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  loadingText: { fontSize: 13, color: '#888' },
  quantityRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-end' },
  servingInfo: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, justifyContent: 'center', alignItems: 'center', minWidth: 90 },
  servingLabel: { fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  servingVal: { fontSize: 14, fontWeight: '700', color: '#111' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputGroup: { flex: 1 },
  button: { backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24 },
  logTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  logEntry: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 14, marginBottom: 10 },
  logEntryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logFood: { fontSize: 15, fontWeight: '600', color: '#111', flex: 1 },
  logMeal: { fontSize: 12, color: '#888', fontWeight: '500' },
  logDetail: { fontSize: 13, color: '#666' },
  scannerContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  scannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 240, height: 160, borderWidth: 2, borderColor: '#fff', borderRadius: 12 },
  scannerHint: { color: '#fff', fontSize: 14, marginTop: 16, opacity: 0.8 },
  cancelScan: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 30 },
  cancelScanText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [goals, setGoals] = useState(null);
  const [body, setBody] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [name, savedGoals, savedBody] = await Promise.all([
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('macroGoals'),
        AsyncStorage.getItem('userBody'),
      ]);
      if (name) setUserName(name);
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedBody) setBody(JSON.parse(savedBody));
    } catch (e) {
      console.log('Error loading settings', e);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  }

  async function redoOnboarding() {
    Alert.alert(
      'Update my goals',
      'This will take you back through the setup flow. Your logged data will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            router.push('/onboarding/goal');
          }
        }
      ]
    );
  }

  async function clearAllData() {
    Alert.alert(
      'Clear all data',
      'This will permanently delete all your logs, goals, and profile data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'workoutLog', 'workoutLogDate',
              'nutritionLog', 'nutritionLogDate',
              'bodyweightLog', 'macroGoals',
              'userName', 'userBody', 'userGoal',
              'userActivity', 'onboardingComplete',
            ]);
            router.replace('/onboarding');
          }
        }
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {userName ? (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileSub}>FitTrack member</Text>
          </View>
        </View>
      ) : null}

      {goals && (
        <>
          <Text style={styles.sectionLabel}>Your targets</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goals.targetCalories}</Text>
              <Text style={styles.statLabel}>kcal/day</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goals.protein}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goals.carbs}g</Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{goals.fat}g</Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
        </>
      )}

      {body && (
        <>
          <Text style={styles.sectionLabel}>Your profile</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current weight</Text>
              <Text style={styles.infoValue}>{body.weightLbs} lbs</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{body.heightFt}ft {body.heightIn || '0'}in</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>{body.age}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sex</Text>
              <Text style={styles.infoValue}>{body.sex.charAt(0).toUpperCase() + body.sex.slice(1)}</Text>
            </View>
            {goals?.goalWeight && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Goal weight</Text>
                  <Text style={styles.infoValue}>{goals.goalWeight} lbs</Text>
                </View>
              </>
            )}
            {goals?.goal && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Goal</Text>
                  <Text style={styles.infoValue}>{goals.goal}</Text>
                </View>
              </>
            )}
          </View>
        </>
      )}

      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionRow} onPress={redoOnboarding}>
          <Text style={styles.actionText}>Update my goals</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
          <Text style={styles.actionText}>Sign out</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow} onPress={clearAllData}>
          <Text style={[styles.actionText, { color: '#E24B4A' }]}>Clear all data</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>FitTrack · Built with Claude</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 24 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#f9f9f9', borderRadius: 16, padding: 16, marginBottom: 28, borderWidth: 0.5, borderColor: '#eee' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  profileName: { fontSize: 17, fontWeight: '700', color: '#111' },
  profileSub: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', letterSpacing: 0.08, textTransform: 'uppercase', marginBottom: 10 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: '#f4f4f4', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 4, marginBottom: 28, borderWidth: 0.5, borderColor: '#eee' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  divider: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 14 },
  actionsCard: { backgroundColor: '#f9f9f9', borderRadius: 16, padding: 4, marginBottom: 28, borderWidth: 0.5, borderColor: '#eee' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  actionText: { fontSize: 15, color: '#111' },
  actionArrow: { fontSize: 15, color: '#ccc' },
  version: { fontSize: 12, color: '#ccc', textAlign: 'center', marginTop: 8 },
});
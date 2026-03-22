import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>FitTrack</Text>
        <Text style={styles.tagline}>Your health, all in one place.</Text>
        <Text style={styles.sub}>
          Track your workouts, nutrition, and body weight — and see how they all connect.
        </Text>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/onboarding/name')}>
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 32, justifyContent: 'space-between' },
  top: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 48, fontWeight: '800', color: '#111', marginBottom: 16 },
  tagline: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 16, lineHeight: 30 },
  sub: { fontSize: 16, color: '#888', lineHeight: 24 },
  bottom: { paddingBottom: 40 },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
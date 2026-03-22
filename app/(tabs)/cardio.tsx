import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    Alert, Dimensions,
    ScrollView,
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getUserId, supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function CardioScreen() {
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [coords, setCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [autoPaused, setAutoPaused] = useState(false);
  const [summary, setSummary] = useState(null);

  const locationSub = useRef(null);
  const timerRef = useRef(null);
  const lastCoord = useRef(null);
  const lastSpeedTime = useRef(null);
  const lowSpeedCount = useRef(0);
  const mapRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTracking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function startTracking() {
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      Alert.alert('Permission needed', 'Please allow location access to track your route.');
      return;
    }

    setStatus('running');
    setCoords([]);
    setDistance(0);
    setDuration(0);
    setElevationGain(0);
    setCurrentPace(0);
    lastCoord.current = null;
    lowSpeedCount.current = 0;

    timerRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);

    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        const { latitude, longitude, altitude, speed } = loc.coords;
        const newCoord = { latitude, longitude, altitude: altitude || 0 };

        setCoords(prev => {
          const updated = [...prev, newCoord];
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 500);
          }
          return updated;
        });

        if (lastCoord.current) {
          const d = haversineDistance(
            lastCoord.current.latitude, lastCoord.current.longitude,
            latitude, longitude
          );
          setDistance(prev => prev + d);

          if (altitude && lastCoord.current.altitude) {
            const elevDiff = altitude - lastCoord.current.altitude;
            if (elevDiff > 0) setElevationGain(prev => prev + elevDiff);
          }

          const speedMph = (speed || 0) * 2.237;
          if (speedMph < 1) {
            lowSpeedCount.current += 1;
            if (lowSpeedCount.current >= 3) {
              setAutoPaused(true);
            }
          } else {
            lowSpeedCount.current = 0;
            setAutoPaused(false);
            if (speedMph > 0) {
              const paceMins = 60 / speedMph;
              setCurrentPace(paceMins);
            }
          }
        }

        lastCoord.current = newCoord;
      }
    );
  }

  async function stopTracking() {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function finishRun() {
    await stopTracking();
    setStatus('done');

    const avgPace = distance > 0 ? (duration / 60) / distance : 0;
    const runSummary = {
      distance: Math.round(distance * 100) / 100,
      duration,
      avgPace: Math.round(avgPace * 10) / 10,
      elevationGain: Math.round(elevationGain),
      coords,
    };
    setSummary(runSummary);

    try {
      const userId = await getUserId();
      if (userId) {
        await supabase.from('cardio_log').insert({
          user_id: userId,
          distance: runSummary.distance,
          duration: runSummary.duration,
          avg_pace: runSummary.avgPace,
          elevation_gain: runSummary.elevationGain,
          route: coords,
        });
      }
    } catch (e) {
      console.log('Error saving run', e);
    }
  }

  function formatDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function formatPace(pace) {
    if (!pace || pace === 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }

  function resetRun() {
    setStatus('idle');
    setCoords([]);
    setDistance(0);
    setDuration(0);
    setElevationGain(0);
    setCurrentPace(0);
    setSummary(null);
    setAutoPaused(false);
  }

  if (status === 'done' && summary) {
    const startCoord = summary.coords[0];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Run complete</Text>

        {startCoord && summary.coords.length > 1 && (
          <MapView
            style={styles.summaryMap}
            initialRegion={{
              latitude: startCoord.latitude,
              longitude: startCoord.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Polyline coordinates={summary.coords} strokeColor="#111" strokeWidth={3} />
            <Marker coordinate={startCoord} pinColor="green" />
            <Marker coordinate={summary.coords[summary.coords.length - 1]} pinColor="red" />
          </MapView>
        )}

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.distance.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Miles</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatDuration(summary.duration)}</Text>
            <Text style={styles.summaryLabel}>Duration</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatPace(summary.avgPace)}</Text>
            <Text style={styles.summaryLabel}>Avg pace /mi</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.elevationGain}ft</Text>
            <Text style={styles.summaryLabel}>Elevation gain</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={resetRun}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {status === 'idle' ? (
        <View style={styles.idleContainer}>
          <Text style={styles.title}>Cardio</Text>
          <Text style={styles.sub}>Track your run, walk, or ride with live GPS.</Text>
          <TouchableOpacity style={styles.startButton} onPress={startTracking}>
            <Text style={styles.startButtonText}>Start activity</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation
            followsUserLocation
            initialRegion={{
              latitude: coords[0]?.latitude || 37.78825,
              longitude: coords[0]?.longitude || -122.4324,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {coords.length > 1 && (
              <Polyline coordinates={coords} strokeColor="#111" strokeWidth={3} />
            )}
          </MapView>

          <View style={styles.statsOverlay}>
            {autoPaused && (
              <View style={styles.autoPauseBadge}>
                <Text style={styles.autoPauseText}>Auto-paused</Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Miles</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatPace(currentPace)}</Text>
                <Text style={styles.statLabel}>Pace /mi</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(elevationGain)}ft</Text>
                <Text style={styles.statLabel}>Elevation</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.stopButton} onPress={finishRun}>
              <Text style={styles.stopButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  idleContainer: { flex: 1, justifyContent: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  sub: { fontSize: 15, color: '#888', marginBottom: 40, lineHeight: 22 },
  startButton: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  map: { flex: 1 },
  statsOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  autoPauseBadge: { backgroundColor: '#FAEEDA', borderRadius: 8, padding: 8, alignItems: 'center', marginBottom: 16 },
  autoPauseText: { fontSize: 13, fontWeight: '600', color: '#633806' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  stopButton: { backgroundColor: '#E24B4A', borderRadius: 16, padding: 18, alignItems: 'center' },
  stopButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  summaryMap: { width: '100%', height: 240, borderRadius: 16, marginBottom: 20, overflow: 'hidden' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  summaryCard: { width: '47%', backgroundColor: '#f4f4f4', borderRadius: 14, padding: 16, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  button: { backgroundColor: '#111', borderRadius: 16, padding: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
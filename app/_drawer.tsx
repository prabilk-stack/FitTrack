import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  {
    label: 'Home',
    route: '/(tabs)/dashboard',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <Path d="M9 21V12h6v9" />
      </Svg>
    ),
  },
  {
    label: 'Workout',
    route: '/(tabs)/index',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="2" y="10" width="3" height="4" rx="1" />
        <Rect x="19" y="10" width="3" height="4" rx="1" />
        <Rect x="5" y="8" width="3" height="8" rx="1" />
        <Rect x="16" y="8" width="3" height="8" rx="1" />
        <Line x1="8" y1="12" x2="16" y2="12" />
      </Svg>
    ),
  },
  {
    label: 'Nutrition',
    route: '/(tabs)/explore',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 6c0 2-1.5 3.5-3 5s-2 3-2 5" />
        <Path d="M14 6c1-1 3-1.5 4.5-1 .5 2-.5 4-2 5.5S13 13 12 16" />
        <Path d="M10 16c-.5 1.5-.3 3 .5 4" />
        <Ellipse cx="8" cy="21" rx="2.5" ry="1.5" />
      </Svg>
    ),
  },
  {
    label: 'Goals',
    route: '/(tabs)/goals',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M8 21h8" />
        <Path d="M12 21v-4" />
        <Path d="M5 7l7-4 7 4" />
        <Path d="M5 7v5a7 7 0 0014 0V7" />
        <Path d="M9 11l3 3 3-3" />
      </Svg>
    ),
  },
  {
    label: 'Weight',
    route: '/(tabs)/bodyweight',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 20h16" />
        <Path d="M4 20a8 8 0 0116 0" />
        <Path d="M12 12v-2" />
        <Path d="M12 20l4.5-7" />
      </Svg>
    ),
  },
  {
    label: 'Settings',
    route: '/(tabs)/settings',
    icon: (color) => (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="3" />
        <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </Svg>
    ),
  },
];

export default function Drawer({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem('userName').then(n => { if (n) setUserName(n); });
  }, []);

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, { toValue: DRAWER_WIDTH, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [open]);

  function navigate(route) {
    setOpen(false);
    setTimeout(() => router.push(route), 200);
  }

  function isActive(route) {
    if (route === '/(tabs)/dashboard') return pathname === '/dashboard' || pathname === '/(tabs)/dashboard';
    if (route === '/(tabs)/index') return pathname === '/' || pathname === '/index' || pathname === '/(tabs)/index';
    return pathname.includes(route.replace('/(tabs)/', ''));
  }

  return (
    <View style={styles.container}>
      {children}

      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)} activeOpacity={0.85}>
        <View style={styles.fabLine} />
        <View style={styles.fabLine} />
        <View style={styles.fabLine} />
      </TouchableOpacity>

      {open && (
        <>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          </Animated.View>

          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerName}>{userName ? `Hey, ${userName}` : 'FitTrack'}</Text>
              <Text style={styles.drawerSub}>FitTrack</Text>
            </View>

            <Text style={styles.drawerSectionLabel}>Navigate</Text>

            {NAV_ITEMS.slice(0, 5).map(item => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.drawerItem, active && styles.drawerItemActive]}
                  onPress={() => navigate(item.route)}
                >
                  {item.icon(active ? '#111' : '#888')}
                  <Text style={[styles.drawerLabel, active && styles.drawerLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.drawerDivider} />

            <TouchableOpacity
              style={[styles.drawerItem, isActive(NAV_ITEMS[5].route) && styles.drawerItemActive]}
              onPress={() => navigate(NAV_ITEMS[5].route)}
            >
              {NAV_ITEMS[5].icon(isActive(NAV_ITEMS[5].route) ? '#111' : '#888')}
              <Text style={[styles.drawerLabel, isActive(NAV_ITEMS[5].route) && styles.drawerLabelActive]}>
                Settings
              </Text>
            </TouchableOpacity>

            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterText}>FitTrack · Built with Claude</Text>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 52,
    height: 52,
    backgroundColor: '#111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    zIndex: 100,
  },
  fabLine: { width: 20, height: 2, backgroundColor: '#fff', borderRadius: 1 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 200,
  },
  drawer: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    borderLeftWidth: 0.5,
    borderLeftColor: '#eee',
    zIndex: 300,
    paddingTop: 60,
    paddingBottom: 32,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  drawerName: { fontSize: 17, fontWeight: '700', color: '#111' },
  drawerSub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  drawerSectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.08,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  drawerItemActive: { backgroundColor: '#f9f9f9' },
  drawerLabel: { fontSize: 15, color: '#888', fontWeight: '400' },
  drawerLabelActive: { color: '#111', fontWeight: '600' },
  drawerDivider: { height: 0.5, backgroundColor: '#eee', marginHorizontal: 24, marginVertical: 8 },
  drawerFooter: { marginTop: 'auto', paddingHorizontal: 24 },
  drawerFooterText: { fontSize: 11, color: '#ddd' },
});
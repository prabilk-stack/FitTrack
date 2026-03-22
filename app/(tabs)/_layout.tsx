import { Tabs } from 'expo-router';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

function DumbbellIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="10" width="3" height="4" rx="1" />
      <Rect x="19" y="10" width="3" height="4" rx="1" />
      <Rect x="5" y="8" width="3" height="8" rx="1" />
      <Rect x="16" y="8" width="3" height="8" rx="1" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Svg>
  );
}

function ChickenIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 6c0 2-1.5 3.5-3 5s-2 3-2 5" />
      <Path d="M14 6c1-1 3-1.5 4.5-1 .5 2-.5 4-2 5.5S13 13 12 16" />
      <Path d="M10 16c-.5 1.5-.3 3 .5 4" />
      <Ellipse cx="8" cy="21" rx="2.5" ry="1.5" />
    </Svg>
  );
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 21h8" />
      <Path d="M12 21v-4" />
      <Path d="M5 7l7-4 7 4" />
      <Path d="M5 7v5a7 7 0 0014 0V7" />
      <Path d="M9 11l3 3 3-3" />
    </Svg>
  );
}

function ScaleIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20h16" />
      <Path d="M4 20a8 8 0 0116 0" />
      <Path d="M12 12v-2" />
      <Path d="M12 20l4.5-7" />
    </Svg>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <Path d="M9 21V12h6v9" />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 72, paddingBottom: 12, paddingTop: 8 },
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#bbb',
        tabBarLabelStyle: { fontSize: 9, letterSpacing: 0.3 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Workout',
          tabBarIcon: ({ color }) => <DumbbellIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Nutrition',
          tabBarIcon: ({ color }) => <ChickenIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <TrophyIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="bodyweight"
        options={{
          title: 'Weight',
          tabBarIcon: ({ color }) => <ScaleIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="modal"
        options={{ href: null }}
      />
    </Tabs>
  );
}
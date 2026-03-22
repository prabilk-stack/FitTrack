import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="bodyweight" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="modal" options={{ href: null }} />
    </Tabs>
  );
}
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Workout' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Nutrition' }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: 'Goals' }}
      />
    </Tabs>
  );
}
import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="bodyweight" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
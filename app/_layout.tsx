import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    checkOnboarding();
  }, []);

  async function checkOnboarding() {
    try {
      const complete = await AsyncStorage.getItem('onboardingComplete');
      if (!complete) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (e) {
      router.replace('/(tabs)/dashboard');
    }
  }

  return <Slot />;
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import Drawer from './_drawer';
import { supabase } from './supabase';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/auth');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
      } else {
        const complete = await AsyncStorage.getItem('onboardingComplete');
        if (!complete) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      }
    } catch (e) {
      router.replace('/auth');
    }
  }

  return (
    <Drawer>
      <Slot />
    </Drawer>
  );
}
import {Redirect, router, Tabs} from 'expo-router';
import React, {useEffect, useState} from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";

export default function TabLayout() {
  const colorScheme = useColorScheme();
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false);
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [])

    if (loading) {
        return null;
    }

    if (!session) {
        return <Redirect href="/(login)/explore" />
    }





  return  (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }}   />
    </Tabs>
  );
}

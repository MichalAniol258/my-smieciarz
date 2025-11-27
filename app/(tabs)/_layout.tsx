import {Redirect, router, Tabs} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";
import {Image} from "react-native";

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

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: '#0f172a',
                    position: 'absolute',
                    borderRadius: 32,
                    bottom: -1,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                    borderColor: 'transparent',
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginTop: 4
                },
                tabBarIconStyle: {

                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={require('@/assets/images/home.png')}
                            style={{
                                width: focused ? 26 : 24,
                                height: focused ? 26 : 24,
                                tintColor: color,
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"

                options={{

                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Image
                            source={require('@/assets/images/user.png')}
                            style={{
                                width: focused ? 30 : 28,
                                height: focused ? 30 : 28,
                                tintColor: color,
                            }}
                        />
                    )
                }}
            />
        </Tabs>
    );
}

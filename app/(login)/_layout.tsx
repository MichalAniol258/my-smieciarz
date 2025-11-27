import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {Redirect, router, Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";



export default function LoginLayout() {

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

    if (session) {
        return <Redirect href="/(login)/explore" />
    }


    return  (

            <Stack  screenOptions={ { headerShown: false }}>
                <Stack.Screen name="explore"   />
            </Stack>
    );
}

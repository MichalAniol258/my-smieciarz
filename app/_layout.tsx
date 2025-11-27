import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {Redirect, router, Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";
import {View} from "react-native";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();



    return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar translucent={true} />

        <View style={{ flex: 1, backgroundColor: '#020617'}}>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(login)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
        </View>


    </ThemeProvider>
  );
}

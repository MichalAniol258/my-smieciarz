import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants';
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabasePublishableKey = Constants.expoConfig?.extra?.SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

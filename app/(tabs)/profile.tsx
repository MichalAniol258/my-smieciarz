import Account from "@/components/account";
import React, {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";
import {Redirect} from "expo-router";
import {ActivityIndicator, StyleSheet, Text, View} from "react-native";




export default function Profile() {

    const [session, setSession] = useState<Session | null>(null);
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
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2dd4bf" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    if (!session) {
        return <Redirect href="/(login)/explore" />;
    }

    return (


            <Account session={session} key={session.user.id} />

    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    map: {flex: 1},
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#020617'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

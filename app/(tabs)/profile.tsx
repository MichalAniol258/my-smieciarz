import Account from "@/components/account";
import React, {useEffect, useState} from "react";
import {Session} from "@supabase/supabase-js";
import {supabase} from "@/api/superbase";
import {Redirect} from "expo-router";




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




    if (loading) return null;

    if (!session) {
        return <Redirect href="/(login)/explore" />;
    }

    return (

            <Account session={session} key={session.user.id} />

    );
}

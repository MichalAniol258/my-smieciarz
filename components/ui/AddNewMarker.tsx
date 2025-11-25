import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    PanResponder,
    Dimensions, TouchableOpacity,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import { Input, } from '@rneui/themed'
import {supabase} from "@/api/superbase";
import {AnimatedRegion} from "react-native-maps";
import {LocationObject} from "@/app/(tabs)";
import {Session} from "@supabase/supabase-js";
import * as ImagePicker from 'expo-image-picker';
import {Paths, File} from "expo-file-system";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5;


export default function AddNewMarker({isVisible, setIsVisible, data, session}: {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    data: LocationObject | null
    session: Session | null
}) {
    const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [nazwa, setNazwa] = useState('test123');
    const [typ, setTyp] = useState('smietnik');
    const [zdjecie, setZdjecie] = useState<string | null>(null);

    const pickImage = async () => {

        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            alert('Permission required');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setZdjecie(result.assets[0].uri);
        }
    }


    const insertData = async () => {
        if (!data)  return;
        if (!zdjecie) return;


        try {
            setIsLoading(true);
            const filename = `private/${Date.now()}-${zdjecie.split('/').pop()}`;



            const response = await fetch(zdjecie);
            const blob = await response.arrayBuffer();

            const {  error: errorImage } = await supabase.storage
                .from('images') // nazwa bucketu w Supabase
                .upload(filename, blob, { contentType: 'image/jpeg' });

            if (errorImage) {
                alert(errorImage.message);
                return
            }

            const { data: signedData } = await supabase
                .storage
                .from('images')
                .getPublicUrl(filename);

            if (!signedData) return;


                const {error, status} = await supabase
                    .from('smietniki')
                    .insert({nazwa: nazwa,zdjecie: signedData.publicUrl,  typ: typ, latitude: data.latitude, longitude: data.longitude, userId: session?.user?.id});

                if (error && status !== 406) {
                    alert(error.message);
                    return
                }

            Animated.timing(translateY, {
                toValue: PANEL_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setIsVisible(false);
            })

        }
        catch (error: Error | any) {
            alert(error.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isVisible) {
            setMounted(true);
            setTimeout(() => {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    overshootClamping: true,
                    speed: 20,
                    bounciness: 0,
                }).start();
            }, 10);
        } else {
            Animated.timing(translateY, {
                toValue: PANEL_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setMounted(false));
        }
    }, [isVisible]);



    // SWIPE W DÓŁ
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                Math.abs(gesture.dy) > 5,

            onPanResponderMove: (_, gesture) => {
                if (gesture.dy > 0) {
                    translateY.setValue(gesture.dy);
                }
            },

            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 100 && !isLoading) {

                    Animated.timing(translateY, {
                        toValue: PANEL_HEIGHT,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => setIsVisible(false));
                } else {

                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        overshootClamping: true,
                        speed: 20,
                        bounciness: 0,
                    }).start();
                }
            },
        })
    ).current;




    if (!isVisible) return null;
    if (!data) return null;
    if (!mounted) return null;
    if (!session) return null;
    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.component,
                    { transform: [{ translateY }] },
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.form}>
                    {zdjecie ? (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{uri:zdjecie} }
                                style={styles.img}
                            />
                        </View>

                    ) : <View style={styles.imageContainer}>
                        <Image
                            source={require('@/assets/images/not-found.jpg') }
                            style={styles.img}
                        />
                    </View>}

                    <Input
                        label="Nazwa"
                        style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: "bold",
                        }}
                        onChangeText={setNazwa}
                        value={nazwa}
                        placeholder="smieci"
                    />

                    <Input
                        label="Typ (musi byc smietnik albo odpady)"
                        style={{
                            color: "white",
                            fontSize: 24,
                            fontWeight: "bold",
                        }}
                        onChangeText={setTyp}
                        value={typ}
                        placeholder="smietnik albo odpady"
                    />

                    <View style={styles.imagePickerArea}>
                        <TouchableOpacity style={styles.button}  onPress={pickImage}>
                            <Text style={styles.textButton}>Zrób zdjęcie</Text>
                        </TouchableOpacity>


                    </View>

                    <View style={styles.bottomButtonContainer}>
                        <TouchableOpacity style={styles.button} disabled={isLoading}  onPress={insertData}>
                            <Text style={styles.textButton}>Dodaj znacznik</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.35)", // delikatne przyciemnienie tła
        justifyContent: "flex-end", // bottom sheet zawsze na dole
    },

    imageContainer: {
        width: "100%",
        height: "35%",
        overflow: "hidden",
        alignItems: "center",
        padding: 15,
    },
    img: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        resizeMode: "cover",
    },

    component: {
        width: "100%",
        height: "75%",
        backgroundColor: "#1B1B1B",
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingVertical: 20,
        paddingHorizontal: 16,
        outlineWidth: 3,
        outlineColor: "#2dd4bf",
        outlineOffset: 1,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
    },

    form: {
        flex: 1,
        gap: 10,
    },

    button: {
        backgroundColor: "#2dd4bf",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Android shadow
    },
    textButton: {
        color: "#1B1B1B",
        fontWeight: "bold",
        fontSize: 16,
    }
    ,

    imagePickerArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,

    },

    previewImg: {
        width: 200,
        height: 200,
        borderRadius: 16,
        marginTop: 10,
        resizeMode: "cover",
    },

    bottomButtonContainer: {
        marginTop: 10,

    },
});

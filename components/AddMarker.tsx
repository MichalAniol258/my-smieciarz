import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    PanResponder,
    Dimensions, Button, TouchableOpacity,
} from "react-native";
import {useEffect, useRef, useState} from "react";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function AddMarker({isVisible, setIsVisible, fetchRoute,}: {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    fetchRoute: () => void;
}) {
    const translateY = useRef(new Animated.Value(PANEL_HEIGHT)).current;


    const [mounted, setMounted] = useState(false);

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
                if (gesture.dy > 100) {

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

    const ButtonHandler = () => {
        Animated.timing(translateY, {
            toValue: PANEL_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            fetchRoute();
            setIsVisible(false);
        })
    }

    if (!isVisible) return null;
    if (!mounted) return null;
    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.component,
                    { transform: [{ translateY }] },
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={require("@/assets/images/rubbish.jpg")}
                        style={styles.img}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>Śmieci Gorzyce</Text>
                </View>

                <View style={styles.textContainer}>
                    <TouchableOpacity style={styles.button} onPress={ButtonHandler}>
                        <Text style={styles.buttonText}>Pokaż drogę</Text>
                    </TouchableOpacity>
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
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    component: {
        width: "100%",
        height: "50%",
        backgroundColor: "#1B1B1B",
        outlineWidth: 3,
        outlineColor: "#2dd4bf",
        outlineOffset: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: "absolute",
        overflow: "hidden",
        bottom: 0,
    },
    imageContainer: {
        width: "100%",
        height: "60%",
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
    textContainer: {
        padding: 15,
    },
    text: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
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
    buttonText: {
        color: "#1B1B1B",
        fontWeight: "bold",
        fontSize: 16,
    },
});

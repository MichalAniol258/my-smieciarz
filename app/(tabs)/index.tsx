import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator} from 'react-native';
import MapView, {
    MapPressEvent,
    Region,
    Polyline,
    AnimatedRegion,
    MarkerAnimated
} from 'react-native-maps';
import * as Location from 'expo-location';
import {GetRoute} from "@/api/openRouteService";
import { LocationSubscription } from 'expo-location';
import AddMarker from "@/components/AddMarker";
import {supabase} from "@/api/superbase";
import {Session} from "@supabase/supabase-js";
import AddNewMarker from "@/components/AddNewMarker";

export type Smietniki = {
    id: number;
    nazwa: string;
    zdjecie: string
    typ: string;
    latitude: number;
    longitude: number;
    userId: number | null;
}

export type LocationObject = {
    latitude: number;
    longitude: number;
}



export default function App() {
    const [selectedLocation, setSelectedLocation] = useState<AnimatedRegion | null>(null)
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [coordinate, setCoordinate] = useState<AnimatedRegion | null>(null)
    const [routeCoords, setRouteCoords] = useState<Array<{latitude: number, longitude: number}>>([]);
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [initialLocationSet, setInitialLocationSet] = useState(false);
    const [session, setSession] = useState<Session | null>(null);
    const [data, setData] = useState<Smietniki[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState<Smietniki | null>(null);
    const [isVisibleAddMarker, setIsVisibleAddMarker] = useState<boolean>(false);
    const [compLocations, setCompLocations] = useState<LocationObject | null>(null);

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

    useEffect(() => {
        if (session) getDaraMarkers();
    }, [session]);


    useEffect(() => {
        const channel = supabase
            .channel('markers')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'smietniki'
                },
                (payload) => {
                    setData(prev => [...prev, payload.new as Smietniki]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getDaraMarkers = async () => {
        try {
            setLoading(true)
            const {data, error, status} = await  supabase
                .from('smietniki')
                .select('id, nazwa, typ,zdjecie, latitude, longitude, userId',)

            if (error && status !== 406) {
                alert(error.message)
                return
            }

            if (data) {
                setData(data)
            }
        }catch (e: Error | any) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }



    const handleMapPress = (event: MapPressEvent) => {
        const coords = event.nativeEvent.coordinate;
        if (routeCoords.length > 0)
        {
            setRouteCoords([]);
        }

        setCompLocations({
            latitude: coords.latitude,
            longitude: coords.longitude,
        });

        if (!selectedLocation) {
            const newRegion = new AnimatedRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });

            setSelectedLocation(newRegion);
        } else {
            selectedLocation.timing({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
                duration: 500,
                toValue: 0,
                useNativeDriver: false,
            }).start();

        }
    };

    const fetchRoutes = async () => {
        if (!location || !selectedLocation) return;

        try {
            const response = await GetRoute(location.coords.latitude, location.coords.longitude, selectedLocation.latitude, selectedLocation.longitude);

            if (!response) {
                setError("Nie znaleziono trasy z response");
                return;
            }

            const coords = response.features[0].geometry.coordinates;

            if (!Array.isArray(coords) || coords.length === 0) {
                setError("Nie znaleziono trasy");
                return;
            }

            const routeCoords = coords.map(coord => ({
                latitude: coord[1],
                longitude: coord[0]
            }));

            setRouteCoords(routeCoords);


            setError(null);

        } catch (err: any) {
            setError(err.message || "Wystąpił błąd podczas pobierania trasy");
            console.error(err);
        }
    }

    useEffect(() => {
        let locationSubscription: LocationSubscription | null = null;

        const startWatchingLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    return;
                }


                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(currentLocation);


                setRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
                setInitialLocationSet(true);


                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Highest,
                        timeInterval: 5000,
                        distanceInterval: 10
                    },
                    (newLocation) => {
                        setLocation(newLocation);
                    }
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to get location');
                console.error(err);
            }
        };

        startWatchingLocation();

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    useEffect(() => {
        if (!location || !initialLocationSet) return;


        if (mapRef.current && location) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }

        if (!coordinate) {
            const newRegion = new AnimatedRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            setCoordinate(newRegion);
        } else {
            coordinate.timing({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
                duration: 500,
                useNativeDriver: false,
                toValue: 0
            }).start();
        }
    }, [location, initialLocationSet]);







    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!location || !region) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2dd4bf" />
                <Text style={styles.loadingText}>Loading location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={'google'}
                initialRegion={region}
                customMapStyle={require('@/assets/style-map.json')}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <MarkerAnimated
                        draggable
                        image={require('@/assets/images/marker.png')}
                        coordinate={selectedLocation}
                        onPress={() => setIsVisibleAddMarker(true)}
                    />
                )}

                { data.length > 0 &&
                    data.map((marker, index) => (
                        <MarkerAnimated
                            key={index}
                            image={require('@/assets/images/marker.png')}
                            coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
                            onPress={() => {
                                setSelectedMarker(marker);
                                setSelectedLocation(
                                     new AnimatedRegion({
                                        latitude: marker.latitude,
                                        longitude: marker.longitude,
                                        latitudeDelta: 0.05,
                                        longitudeDelta: 0.05,
                                    })
                                );
                                setIsVisible(true);
                            }}
                        />
                    ))
                }

                {location && coordinate && (
                    <MarkerAnimated
                        coordinate={coordinate}
                        anchor={{ x: 0.5, y: 0.5 }}  // Centrowanie markera
                        title="Current Location"

                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.radius}>
                                <View style={styles.marker} />
                            </View>
                        </View>
                    </MarkerAnimated>
                )}

                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#0d9488"
                        strokeWidth={4}
                    />
                )}


            </MapView>

            <AddNewMarker session={session} data={compLocations} isVisible={isVisibleAddMarker} setIsVisible={setIsVisibleAddMarker}  />
            <AddMarker data={selectedMarker} fetchRoute={fetchRoutes} isVisible={isVisible} setIsVisible={setIsVisible}/>


        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1},
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
    errorText: {
        color: 'red',
        fontSize: 16,
        padding: 16,
        textAlign: 'center',
    },
    markerContainer: {
        width: 32,      // Określ konkretny rozmiar
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    radius: {
        height: 32,
        width: 32,
        borderRadius: 20,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        overflow: 'visible',
    },
    marker: {
        width: 16,
        height: 16,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#99f6e4',
        backgroundColor: '#2dd4bf',
        shadowColor: '#000',
        elevation: 5,
        zIndex: 1001,
    },
});

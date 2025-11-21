import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, ActivityIndicator, Button} from 'react-native';
import MapView, {Marker, MapPressEvent, Region, UrlTile, Polyline} from 'react-native-maps';
import * as Location from 'expo-location';
import {GetRoute} from "@/api/openRouteService";

interface Coordinate {
    latitude: number;
    longitude: number;
}

export default function App() {
    const [selectedLocation, setSelectedLocation] = useState<Coordinate | null>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [routeCoords, setRouteCoords] = useState<Array<{latitude: number, longitude: number}>>([]);
    const [region, setRegion] = useState<Region>({
        latitude: 51.505,
        longitude: -0.09,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [error, setError] = useState<string | null>(null);

    const handleMapPress = (event: MapPressEvent) => {
        const coords = event.nativeEvent.coordinate;
        setSelectedLocation(coords);
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
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                setRegion({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            } catch (err) {
                setError('Failed to get location');
                console.error(err);
            }
        })();
    }, []);

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker
                        coordinate={selectedLocation}
                        title="Clicked Location"
                    />
                )}

                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude
                        }}
                        title="Current Location"
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.radius}>
                                <View style={styles.marker} />
                            </View>
                        </View>
                    </Marker>
                )}


                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#0000FF"
                        strokeWidth={4}
                    />
                )}

                <UrlTile

                    urlTemplate={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                    maximumZ={19}

                    flipY={false}
                />
            </MapView>

            <Button  onPress={fetchRoutes} title="Get Route" />
        </View>
    );
}

// @ts-ignore
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        padding: 0,
    },
    radius: {
        height: 39,
        width: 39,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    marker: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 3,
        borderColor: 'white',
        backgroundColor: '#007AFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

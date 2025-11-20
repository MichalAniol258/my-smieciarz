import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, UrlTile} from 'react-native-maps';
import * as Location from 'expo-location';


export default function App() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [region, setRegion] = useState({
        latitude: 51.505,
        longitude: -0.09,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const handleMapPress = (event: any) => {
        const coords = event.nativeEvent.coordinate;
        setSelectedLocation(coords);
    };

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                setRegion({
                    ...region,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            }
        })();
    }, []);


    if (!location) {
        return <Text style={{
            color: 'red',
            padding: 16
        }}>Loading...</Text>;
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
                        coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                        title="Current Location"
                        pinColor="blue"
                    />
                )}
                <UrlTile
                    urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
            </MapView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, },
    map: { flex: 1 }
});

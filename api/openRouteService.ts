import axios from 'axios';
import Constants from 'expo-constants';
const API_KEY = Constants.expoConfig?.extra?.API_KEY;




export async function GetRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
    const response = await axios.post(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
        coordinates: [[startLng, startLat],[endLng, endLat] ],
    }, {
        headers: {
            'Authorization': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}



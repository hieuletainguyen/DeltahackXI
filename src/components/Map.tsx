import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import QRButton from './QRButton';
import ProfileButton from './ProfileButton';

interface Station {
    id: number;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    pricePerWatt: number;
}

interface MapComponentProps {
    stations: Station[];
    onStationSelect: (station: Station) => void;
    setIsAuthenticated: (auth: boolean) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ stations, onStationSelect, setIsAuthenticated }) => {
    return (
        <div className="map-container">
            <LoadScript googleMapsApiKey="YOUR_API_KEY">
                <GoogleMap
                    mapContainerStyle={{ height: "50vh", width: "100%" }}
                    center={{ lat: 37.7749, lng: -122.4194 }}
                    zoom={10}
                >
                    {stations.map(station => (
                        <Marker 
                            key={station.id} 
                            position={station.location} 
                            onClick={() => onStationSelect(station)} 
                        />
                    ))}
                </GoogleMap>
            </LoadScript>
            <QRButton />
            <ProfileButton setIsAuthenticated={setIsAuthenticated} />
        </div>
    );
};

export default MapComponent; 
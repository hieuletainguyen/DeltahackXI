import React from 'react';
import QRButton from './QRButton';
import ProfileButton from './ProfileButton';
import NearByRestaurant from './NearBySearch';
import { Station, ApiResponse } from '../types';
import NearBySearch from './NearBySearch';

interface MapComponentProps {
    stations: Station[];
    setStations: React.Dispatch<React.SetStateAction<Station[]>>;
    onStationSelect: (station: Station) => void;
    setIsAuthenticated: (auth: boolean) => void;
    apiResponse: ApiResponse[];
    setApiResponse: React.Dispatch<React.SetStateAction<ApiResponse[]>>;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
    stations, 
    setStations,
    onStationSelect, 
    setIsAuthenticated,
    apiResponse,
    setApiResponse
}) => {
    return (
        <div className="map-container h-full w-full">
            <NearBySearch 
                stations={stations} 
                setStations={setStations}
                apiResponse={apiResponse}
                setApiResponse={setApiResponse}
            />
            <QRButton />
            <ProfileButton setIsAuthenticated={setIsAuthenticated} />
        </div>
    );
};

export default MapComponent; 
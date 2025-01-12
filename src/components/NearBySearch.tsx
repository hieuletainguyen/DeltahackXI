import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Station, ApiResponse } from '../types';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Restaurant {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: Coordinates;
  };
  duration: {
    text: string;
  };
}

interface SelectedRoute {
  origin: Coordinates;
  destination: Coordinates;
}

interface NearbyRestaurantsProps {
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  apiResponse: ApiResponse[];
  setApiResponse: React.Dispatch<React.SetStateAction<ApiResponse[]>>;
}

const NearbyRestaurants: React.FC<NearbyRestaurantsProps> = ({ 
  stations, 
  setStations, 
  apiResponse, 
  setApiResponse 
}) => {
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>({
    lat: 37.7749,
    lng: -122.4194
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState<number>(14);
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [requestMade, setRequestMade] = useState<boolean>(false);
  const [originalCoordinates, setOriginalCoordinates] = useState<Coordinates>({
    lat: 37.7749,
    lng: -122.4194
  });
  const [isApiLoaded, setIsApiLoaded] = useState<boolean>(false);
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const mapStyles = {
    height: "500px",
    width: "100%"
  };

  const getCurrentLocation = () => {
    return new Promise<void>((resolve, reject) => {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setLoading(false);
            resolve();
          },
          (error: GeolocationPositionError) => {
            console.error('Error getting location:', error);
            setLoading(false);
            reject(error);
          }
        );
      } else {
        alert('Geolocation is not supported by your browser');
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const handleLocationAndSearch = async () => {
    try {
      await getCurrentLocation();
      await searchNearbyRestaurants();
    } catch (error) {
      console.error('Error in location and search sequence:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      locationButtonRef.current?.click();
    }, 1000);
  }, []);

  const searchNearbyRestaurants = async () => {
    try {
      setLoading(true);
      setOriginalCoordinates(coordinates);
      const response = await fetch(
        `http://localhost:9897/api/places/?lat=${coordinates.lat}&lng=${coordinates.lng}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify({
            current_battery: 30,
            planned_time: new Date().toISOString(),
            desired_battery: 80,
          })
        }
      );
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if response contains error
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }
      
      const apiData = data as ApiResponse[];
      setApiResponse(apiData);
      
      // Convert API response to Restaurant format
      if (apiData.length >= 5) {
        const newRestaurants = apiData.map((item: ApiResponse) => ({
          place_id: item.station.id,
          name: item.station.name,
          vicinity: `${item.distance.text} away`,
          geometry: {
            location: item.station.location
          },
          duration: {
            text: `${new Date(item.end_time).getMinutes() - new Date(item.start_time).getMinutes()} mins`
          }
        }));
        setRestaurants(newRestaurants);
      }
      
      // Convert API response to Station format
      if (apiData.length >= 5) {
        const newStations = apiData.map((item: ApiResponse) => ({
          id: item.station.id.toString(),
          name: item.station.name,
          location: item.station.location,
          pricePerWatt: item.station.pricePerWatt
        }));
        setStations(newStations);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Restaurants:', restaurants);
  }, [restaurants]);

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordinates(prev => ({
      ...prev,
      lat: parseFloat(e.target.value)
    }));
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordinates(prev => ({
      ...prev,
      lng: parseFloat(e.target.value)
    }));
  };

  const onMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setIsMapLoaded(true);
  };


  const handleRestaurantSelect = (restaurant: Restaurant) => {
    const position = {
      lat: restaurant.geometry.location.lat,
      lng: restaurant.geometry.location.lng
    };
    
    if (directionsResponse) {
      setDirectionsResponse(null);
      setSelectedRoute(null);
      setCoordinates(originalCoordinates);
      setZoom(14);
      return;
    }
    
    if (coordinates.lat === position.lat && coordinates.lng === position.lng) {
      handleNavigation({ stopPropagation: () => {} } as React.MouseEvent, restaurant);
    } else {
      setZoom(17);
      setCoordinates(position);
    }
  };

  const handleNavigation = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.stopPropagation();
    setRequestMade(false);
    setSelectedRoute({
      origin: originalCoordinates,
      destination: {
        lat: restaurant.geometry.location.lat,
        lng: restaurant.geometry.location.lng
      }
    });
  };

  const directionsCallback = (response: google.maps.DirectionsResult | null) => {
    if (response !== null && !requestMade) {
      if (response.routes.length > 0) {
        setDirectionsResponse(response);
        setRequestMade(true);
      } else {
        console.error('Directions request failed:', response);
      }
    }
  };

  return (
    <div style={{overflow: 'hidden', position: 'relative', height: '100%'}}>
      {/* <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={getCurrentLocation}
          disabled={loading}
        >
          {loading ? 'Getting Location...' : 'Use Current Location'}
        </button>
        <input
          type="number"
          placeholder="Latitude"
          value={coordinates.lat}
          onChange={handleLatChange}
          step="any"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={coordinates.lng}
          onChange={handleLngChange}
          step="any"
        />
        <button 
          onClick={searchNearbyRestaurants}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Nearby Restaurants'}
        </button>
      </div> */}
  
      <LoadScript 
        googleMapsApiKey={"AIzaSyCa3xDdiIVtPPWeA3gnXqDBY7JIWrfsD70"}
        onLoad={() => setIsApiLoaded(true)}
      >
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={zoom}
          center={coordinates}
          onLoad={onMapLoad}
        >
          {!directionsResponse && (
            <>
              <Marker
                position={coordinates}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                }}
              />
              {restaurants.map((restaurant) => (
                <Marker
                  key={restaurant.place_id}
                  position={{
                    lat: restaurant.geometry.location.lat,
                    lng: restaurant.geometry.location.lng
                  }}
                  title={restaurant.name}
                />
              ))}
            </>
          )}

          {selectedRoute && (
            <DirectionsService
              options={{
                origin: selectedRoute.origin,
                destination: selectedRoute.destination,
                travelMode: google.maps.TravelMode.DRIVING
              }}
              callback={directionsCallback}
            />
          )}

          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
      <button 
        ref={locationButtonRef}
        onClick={handleLocationAndSearch}
        style={{ display: 'none' }}
      >
        hidden button
      </button>
{/* 
      <div style={{ marginTop: '20px' }}>
        <h3>Nearby Restaurants:</h3>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          padding: '10px 0',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: '-ms-autohiding-scrollbar',
        }}>
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.place_id}
              onClick={() => handleRestaurantSelect(restaurant)}
              style={{
                minWidth: '300px',
                flex: '0 0 auto',
                padding: '10px',
                margin: '0',
                textAlign: 'left',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                height: 'fit-content'
              }}
            >
              <h4 style={{ margin: '0 0 5px 0' }}>{restaurant.name}</h4>
              <p style={{ margin: '0 0 5px 0' }}>{restaurant.vicinity}</p>
              <p style={{ margin: '0 0 5px 0' }}>{restaurant.duration.text}</p>
              Show Route
            </button>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default NearbyRestaurants;
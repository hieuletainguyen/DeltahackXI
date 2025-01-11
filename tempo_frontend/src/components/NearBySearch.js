import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const NearbyRestaurants = () => {
  const [coordinates, setCoordinates] = useState({
    lat: 37.7749,
    lng: -122.4194
  });
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(14);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [requestMade, setRequestMade] = useState(false);

  const mapStyles = {
    height: "500px",
    width: "100%"
  };


const searchNearbyRestaurants = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `http://localhost:9897/api/places/?lat=${coordinates.lat}&lng=${coordinates.lng}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    const data = await response.json();
    setRestaurants(data);
    console.log(data);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  } finally {
    setLoading(false);
  }
};

  const handleLatChange = (e) => {
    setCoordinates(prev => ({
      ...prev,
      lat: parseFloat(e.target.value)
    }));
  };

  const handleLngChange = (e) => {
    setCoordinates(prev => ({
      ...prev,
      lng: parseFloat(e.target.value)
    }));
  };

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleRestaurantSelect = (restaurant) => {
    const position = {
      lat: restaurant.geometry.location.lat,
      lng: restaurant.geometry.location.lng
    };
    setZoom(17);
    setCoordinates(position);
    setDirectionsResponse(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleNavigation = (e, restaurant) => {
    e.stopPropagation();
    setRequestMade(false);
    setSelectedRoute({
      origin: coordinates,
      destination: {
        lat: restaurant.geometry.location.lat,
        lng: restaurant.geometry.location.lng
      }
    });
  };

  const directionsCallback = (response) => {
    if (response !== null && !requestMade) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);
        setRequestMade(true);
      } else {
        console.error('Directions request failed:', response);
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
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
      </div>

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
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
              {restaurants.map((restaurant, index) => (
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
                travelMode: 'DRIVING'
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

      <div style={{ marginTop: '20px' }}>
        <h3>Nearby Restaurants:</h3>
        {restaurants.map((restaurant) => (
          <button
            key={restaurant.place_id}
            onClick={() => handleRestaurantSelect(restaurant)}
            style={{
              width: '100%',
              padding: '10px',
              margin: '5px 0',
              textAlign: 'left',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <h4 style={{ margin: '0 0 5px 0' }}>{restaurant.name}</h4>
            <p style={{ margin: '0 0 5px 0' }}>{restaurant.vicinity}</p>
            <button 
              onClick={(e) => handleNavigation(e, restaurant)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Show Route
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NearbyRestaurants;
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const NearBySearch = () => {
  const [coordinates, setCoordinates] = useState({
    lat: 37.7749,
    lng: -122.4194
  });
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [zoom, setZoom] = useState(14);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [requestMade, setRequestMade] = useState(false);
  const [originalCoordinates, setOriginalCoordinates] = useState({
    lat: 37.7749,
    lng: -122.4194
  });

  const mapStyles = {
    height: "500px",
    width: "100%"
  };


  const searchNearby = async () => {
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
      setTargets(data);
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

  const handleTargetSelect = (target) => {
    const position = {
      lat: target.station.location.lat,
      lng: target.station.location.lng
    };
    
    // If directions are showing, clear them and reset to original view
    if (directionsResponse) {
      setDirectionsResponse(null);
      setSelectedRoute(null);
      setCoordinates(originalCoordinates);
      setZoom(14);
      return;
    }
    
    // If we're already at this position, show route
    if (coordinates.lat === position.lat && coordinates.lng === position.lng) {
      handleNavigation({ stopPropagation: () => {} }, target);
    } else {
      // First click - zoom to restaurant
      setZoom(17);
      setCoordinates(position);
    }
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

  const handleNavigation = (e, target) => {
    e.stopPropagation();
    setRequestMade(false);
    setSelectedRoute({
      origin: originalCoordinates,
      destination: {
        lat: target.station.location.lat,
        lng: target.station.location.lng
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
          onClick={searchNearby}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Nearby Targets'}
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
              {targets.map((target, index) => (
                <Marker
                  key={target.place_id}
                  position={{
                    lat: target.station.location.lat,
                    lng: target.station.location.lng
                  }}
                  title={target.station.name}
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
        <h3>Nearby Targets:</h3>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          padding: '10px 0',
          WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
          msOverflowStyle: '-ms-autohiding-scrollbar', // For IE/Edge
        }}>
          {targets.map((target) => (
            <button
              key={target.place_id}
              onClick={() => handleTargetSelect(target)}
              style={{
                minWidth: '300px', // Fixed width for each card
                flex: '0 0 auto', // Prevent cards from stretching
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
              <h4 style={{ margin: '0 0 5px 0' }}>{target.station.name}</h4>
              {/* <p style={{ margin: '0 0 5px 0' }}>{target.vicinity}</p> */}
              {/* <p style={{ margin: '0 0 5px 0' }}>{target.duration.text}</p> */}
              {/* <p style={{ margin: '0 0 5px 0' }}>Price per Watt: {target.price.pricePerWatt}</p> */}
              <p style={{ margin: '0 0 5px 0' }}>Start time: {target.start_time}</p>
              <p style={{ margin: '0 0 5px 0' }}>End time: {target.end_time}</p>
              Show Route
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearBySearch;
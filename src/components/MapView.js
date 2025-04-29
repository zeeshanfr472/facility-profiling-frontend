import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import * as api from '../api';

const MapView = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const { data } = await api.fetchInspections();
        
        // Filter out inspections without valid coordinates
        const validInspections = data.filter(
          inspection => inspection.latitude && inspection.longitude
        );
        
        setInspections(validInspections);
        setError('');
      } catch (error) {
        console.error('Error fetching inspections:', error);
        setError('Failed to load inspections data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  useEffect(() => {
    // Initialize the map after inspections are loaded
    if (!loading && inspections.length > 0) {
      // Check if Google Maps API is available
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        setMapError(true);
      }
    }
  }, [loading, inspections]);

  const initializeMap = () => {
    try {
      // This is a placeholder for Google Maps initialization
      // In a real implementation, you would need to include the Google Maps API
      console.log('Would initialize map with', inspections.length, 'markers');
      
      // Sample code for Google Maps initialization:
      /*
      const map = new google.maps.Map(document.getElementById('map-container'), {
        center: { 
          lat: inspections[0].latitude || 25.276987, 
          lng: inspections[0].longitude || 55.296249 
        },
        zoom: 10
      });
      
      // Add markers for each inspection
      inspections.forEach(inspection => {
        new google.maps.Marker({
          position: { lat: inspection.latitude, lng: inspection.longitude },
          map: map,
          title: inspection.building_name
        });
      });
      */
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="map-view-container">
      <h2 className="mb-4">Inspection Locations Map</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {mapError ? (
            <div className="text-center">
              <Alert variant="warning">
                Unable to load interactive map. Using fallback static map view.
              </Alert>
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="mb-3"
              >
                Try Again
              </Button>
            </div>
          ) : null}

          {inspections.length > 0 ? (
            <div id="map-container" style={{ height: '600px', width: '100%' }}>
              {/* Using an iframe with Google Maps as a fallback solution */}
              <iframe
                title="Inspection Locations"
                width="100%"
                height="600"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&zoom=10&center=${
                  inspections[0].latitude || 25.276987
                },${inspections[0].longitude || 55.296249}`}
                allowFullScreen
              ></iframe>
              <p className="text-muted mt-2">
                Note: This is a static map view. For a fully interactive map with markers for each location, you would need to implement the Google Maps JavaScript API.
              </p>
            </div>
          ) : (
            <div className="text-center p-5">
              <Alert variant="info">
                No inspection locations with valid coordinates found. Add inspections with latitude and longitude values to see them on the map.
              </Alert>
            </div>
          )}
        </Card.Body>
      </Card>

      {inspections.length > 0 && (
        <Card className="mt-4">
          <Card.Header>Inspection Locations</Card.Header>
          <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <ul className="list-group">
              {inspections.map(inspection => (
                <li key={inspection.id} className="list-group-item">
                  <strong>{inspection.building_name}</strong> ({inspection.building_number})
                  <br />
                  <small>
                    Location: {inspection.macro_area}, {inspection.micro_area}
                    <br />
                    Coordinates: {inspection.latitude}, {inspection.longitude}
                  </small>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default MapView;
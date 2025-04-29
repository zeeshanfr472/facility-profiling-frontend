import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import * as api from '../api';

const Analytics = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalInspections: 0,
    completedInspections: 0,
    incompleteInspections: 0,
    facilitiesByType: {},
    conditionCounts: {
      exterior: { Poor: 0, Average: 0, Good: 0, Excellent: 0 },
      interior: { Poor: 0, Average: 0, Good: 0, Excellent: 0 },
      roofing: { Poor: 0, Average: 0, Good: 0, Excellent: 0 }
    },
    hvacTypeCounts: {},
    sprinklerCounts: { Yes: 0, No: 0 },
    fireAlarmCounts: { Yes: 0, No: 0 }
  });

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true);
        const { data } = await api.fetchInspections();
        setInspections(data);
        calculateStats(data);
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

  const calculateStats = (data) => {
    // Initialize counters
    const newStats = {
      totalInspections: data.length,
      completedInspections: 0,
      incompleteInspections: 0,
      facilitiesByType: {},
      conditionCounts: {
        exterior: { Poor: 0, Average: 0, Good: 0, Excellent: 0 },
        interior: { Poor: 0, Average: 0, Good: 0, Excellent: 0 },
        roofing: { Poor: 0, Average: 0, Good: 0, Excellent: 0 }
      },
      hvacTypeCounts: {},
      sprinklerCounts: { Yes: 0, No: 0 },
      fireAlarmCounts: { Yes: 0, No: 0 }
    };

    // Calculate statistics
    data.forEach(inspection => {
      // Count completed vs incomplete inspections
      if (inspection.full_inspection_completed === 'Yes') {
        newStats.completedInspections++;
      } else {
        newStats.incompleteInspections++;
      }

      // Count facilities by type
      const facilityType = inspection.facility_type;
      newStats.facilitiesByType[facilityType] = (newStats.facilitiesByType[facilityType] || 0) + 1;

      // Count condition ratings
      const exteriorCondition = inspection.exterior_cladding_condition;
      const interiorCondition = inspection.interior_architectural_condition;
      const roofingCondition = inspection.roofing_condition;

      if (exteriorCondition) newStats.conditionCounts.exterior[exteriorCondition] = (newStats.conditionCounts.exterior[exteriorCondition] || 0) + 1;
      if (interiorCondition) newStats.conditionCounts.interior[interiorCondition] = (newStats.conditionCounts.interior[interiorCondition] || 0) + 1;
      if (roofingCondition) newStats.conditionCounts.roofing[roofingCondition] = (newStats.conditionCounts.roofing[roofingCondition] || 0) + 1;

      // Count HVAC types
      if (inspection.hvac_type && Array.isArray(inspection.hvac_type)) {
        inspection.hvac_type.forEach(type => {
          newStats.hvacTypeCounts[type] = (newStats.hvacTypeCounts[type] || 0) + 1;
        });
      }

      // Count sprinkler and fire alarm systems
      if (inspection.sprinkler) {
        newStats.sprinklerCounts[inspection.sprinkler] = (newStats.sprinklerCounts[inspection.sprinkler] || 0) + 1;
      }
      
      if (inspection.fire_alarm) {
        newStats.fireAlarmCounts[inspection.fire_alarm] = (newStats.fireAlarmCounts[inspection.fire_alarm] || 0) + 1;
      }
    });

    setStats(newStats);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <h2 className="mb-4">Facility Inspection Analytics</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Map Section */}
      <Card className="mb-4">
        <Card.Header as="h5">Inspection Locations Map</Card.Header>
        <Card.Body>
          <div id="map" style={{ height: '400px', width: '100%' }}>
            {inspections.length > 0 ? (
              <div>
                <p>Loading map...</p>
                <iframe
                  title="Inspection Locations"
                  width="100%"
                  height="350"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&zoom=12&center=${
                    inspections[0].latitude || 25.276987
                  },${inspections[0].longitude || 55.296249}`}
                  allowFullScreen
                ></iframe>
                <p className="text-muted">Note: For a full interactive map with all locations, use the MapView page.</p>
              </div>
            ) : (
              <p>No location data available to display on map.</p>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Summary Statistics */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>Inspection Status</Card.Header>
            <Card.Body>
              <div className="d-flex flex-column align-items-center">
                <div className="fs-1 fw-bold">{stats.totalInspections}</div>
                <div>Total Inspections</div>
                <hr className="w-100" />
                <div className="d-flex justify-content-around w-100">
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-success">{stats.completedInspections}</div>
                    <div>Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="fs-4 fw-bold text-warning">{stats.incompleteInspections}</div>
                    <div>Incomplete</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>Safety Systems</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Sprinkler Systems</h6>
                <div className="d-flex">
                  <div style={{ width: `${stats.sprinklerCounts.Yes / stats.totalInspections * 100}%` }} className="bg-success p-2 text-white">
                    Yes ({stats.sprinklerCounts.Yes})
                  </div>
                  <div style={{ width: `${stats.sprinklerCounts.No / stats.totalInspections * 100}%` }} className="bg-danger p-2 text-white">
                    No ({stats.sprinklerCounts.No})
                  </div>
                </div>
              </div>
              <div>
                <h6>Fire Alarm Systems</h6>
                <div className="d-flex">
                  <div style={{ width: `${stats.fireAlarmCounts.Yes / stats.totalInspections * 100}%` }} className="bg-success p-2 text-white">
                    Yes ({stats.fireAlarmCounts.Yes})
                  </div>
                  <div style={{ width: `${stats.fireAlarmCounts.No / stats.totalInspections * 100}%` }} className="bg-danger p-2 text-white">
                    No ({stats.fireAlarmCounts.No})
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>Facility Types</Card.Header>
            <Card.Body>
              <Table size="sm">
                <thead>
                  <tr>
                    <th>Facility Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.facilitiesByType).map(([type, count]) => (
                    <tr key={type}>
                      <td>{type}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Building Conditions */}
      <Card className="mb-4">
        <Card.Header as="h5">Building Condition Summary</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6 className="text-center">Exterior Cladding</h6>
              <div className="d-flex flex-column">
                <div className="d-flex">
                  <div style={{ width: `${stats.conditionCounts.exterior.Excellent / stats.totalInspections * 100}%` }} className="bg-success p-1 text-white text-center">
                    {stats.conditionCounts.exterior.Excellent || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.exterior.Good / stats.totalInspections * 100}%` }} className="bg-info p-1 text-white text-center">
                    {stats.conditionCounts.exterior.Good || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.exterior.Average / stats.totalInspections * 100}%` }} className="bg-warning p-1 text-white text-center">
                    {stats.conditionCounts.exterior.Average || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.exterior.Poor / stats.totalInspections * 100}%` }} className="bg-danger p-1 text-white text-center">
                    {stats.conditionCounts.exterior.Poor || 0}
                  </div>
                </div>
                <div className="d-flex text-center" style={{ fontSize: '0.8rem' }}>
                  <div style={{ width: '25%' }}>Excellent</div>
                  <div style={{ width: '25%' }}>Good</div>
                  <div style={{ width: '25%' }}>Average</div>
                  <div style={{ width: '25%' }}>Poor</div>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <h6 className="text-center">Interior Condition</h6>
              <div className="d-flex flex-column">
                <div className="d-flex">
                  <div style={{ width: `${stats.conditionCounts.interior.Excellent / stats.totalInspections * 100}%` }} className="bg-success p-1 text-white text-center">
                    {stats.conditionCounts.interior.Excellent || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.interior.Good / stats.totalInspections * 100}%` }} className="bg-info p-1 text-white text-center">
                    {stats.conditionCounts.interior.Good || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.interior.Average / stats.totalInspections * 100}%` }} className="bg-warning p-1 text-white text-center">
                    {stats.conditionCounts.interior.Average || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.interior.Poor / stats.totalInspections * 100}%` }} className="bg-danger p-1 text-white text-center">
                    {stats.conditionCounts.interior.Poor || 0}
                  </div>
                </div>
                <div className="d-flex text-center" style={{ fontSize: '0.8rem' }}>
                  <div style={{ width: '25%' }}>Excellent</div>
                  <div style={{ width: '25%' }}>Good</div>
                  <div style={{ width: '25%' }}>Average</div>
                  <div style={{ width: '25%' }}>Poor</div>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <h6 className="text-center">Roofing Condition</h6>
              <div className="d-flex flex-column">
                <div className="d-flex">
                  <div style={{ width: `${stats.conditionCounts.roofing.Excellent / stats.totalInspections * 100}%` }} className="bg-success p-1 text-white text-center">
                    {stats.conditionCounts.roofing.Excellent || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.roofing.Good / stats.totalInspections * 100}%` }} className="bg-info p-1 text-white text-center">
                    {stats.conditionCounts.roofing.Good || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.roofing.Average / stats.totalInspections * 100}%` }} className="bg-warning p-1 text-white text-center">
                    {stats.conditionCounts.roofing.Average || 0}
                  </div>
                  <div style={{ width: `${stats.conditionCounts.roofing.Poor / stats.totalInspections * 100}%` }} className="bg-danger p-1 text-white text-center">
                    {stats.conditionCounts.roofing.Poor || 0}
                  </div>
                </div>
                <div className="d-flex text-center" style={{ fontSize: '0.8rem' }}>
                  <div style={{ width: '25%' }}>Excellent</div>
                  <div style={{ width: '25%' }}>Good</div>
                  <div style={{ width: '25%' }}>Average</div>
                  <div style={{ width: '25%' }}>Poor</div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* HVAC Types Distribution */}
      <Card className="mb-4">
        <Card.Header as="h5">HVAC Types Distribution</Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>HVAC Type</th>
                <th>Count</th>
                <th>Percentage</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.hvacTypeCounts).map(([type, count]) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td>{count}</td>
                  <td>{Math.round((count / stats.totalInspections) * 100)}%</td>
                  <td>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${(count / stats.totalInspections) * 100}%` }}
                        aria-valuenow={(count / stats.totalInspections) * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Analytics;
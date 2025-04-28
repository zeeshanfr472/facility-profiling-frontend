import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import * as api from '../api';

const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const { data } = await api.fetchInspections();
      setInspections(data);
      setError('');
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setError('Failed to load inspections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await api.deleteInspection(id);
        setInspections(inspections.filter(inspection => inspection.id !== id));
        setSuccess('Inspection deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting inspection:', error);
        setError('Failed to delete inspection. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading inspections...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Inspections</h2>
        <Link to="/inspections/new">
          <Button variant="primary">Add New Inspection</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {inspections.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <Card.Title>No Inspections Found</Card.Title>
            <Card.Text>
              There are no inspections in the system yet. Click the button below to create your first inspection.
            </Card.Text>
            <Link to="/inspections/new">
              <Button variant="primary">Create Inspection</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive inspection-table">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Building Name</th>
                <th>Facility Type</th>
                <th>Location</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{inspection.id}</td>
                  <td>{inspection.building_name}</td>
                  <td>{inspection.facility_type}</td>
                  <td>{inspection.macro_area} - {inspection.micro_area}</td>
                  <td>{new Date(inspection.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/inspections/edit/${inspection.id}`}>
                      <Button variant="info" size="sm" className="me-2">
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(inspection.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InspectionList;
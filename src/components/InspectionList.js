import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner, Card, Form, Row, Col, Pagination, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaTimes, FaEdit, FaTrashAlt, FaBuilding, FaClipboardCheck, FaTable, FaSlidersH } from 'react-icons/fa';
import * as api from '../api';

const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const [filters, setFilters] = useState({
    sap_function_location: '',
    building_name: '',
    macro_area: '',
    proponent: '',
    zone: '',
    full_inspection_completed: ''
  });
  
  // Unique values for filter dropdowns
  const [uniqueValues, setUniqueValues] = useState({
    sap_function_location: [],
    building_name: [],
    macro_area: [],
    proponent: [],
    zone: [],
  });

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const { data } = await api.fetchInspections();
      setInspections(data);
      setFilteredInspections(data);
      
      // Extract unique values for dropdown filters
      const extractUniqueValues = (field) => {
        const values = [...new Set(data.map(item => item[field]))].filter(Boolean);
        return values.sort();
      };
      
      setUniqueValues({
        sap_function_location: extractUniqueValues('sap_function_location'),
        building_name: extractUniqueValues('building_name'),
        macro_area: extractUniqueValues('macro_area'),
        proponent: extractUniqueValues('proponent'),
        zone: extractUniqueValues('zone'),
      });
      
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

  useEffect(() => {
    applyFilters();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [filters, inspections]);

  const applyFilters = () => {
    let result = [...inspections];
    
    // Apply each filter
    if (filters.sap_function_location) {
      result = result.filter(item => 
        item.sap_function_location && 
        item.sap_function_location.toLowerCase().includes(filters.sap_function_location.toLowerCase())
      );
    }
    
    if (filters.building_name) {
      result = result.filter(item => 
        item.building_name && 
        item.building_name.toLowerCase().includes(filters.building_name.toLowerCase())
      );
    }
    
    if (filters.macro_area) {
      result = result.filter(item => 
        item.macro_area && 
        item.macro_area.toLowerCase().includes(filters.macro_area.toLowerCase())
      );
    }
    
    if (filters.proponent) {
      result = result.filter(item => 
        item.proponent && 
        item.proponent.toLowerCase().includes(filters.proponent.toLowerCase())
      );
    }
    
    if (filters.zone) {
      result = result.filter(item => 
        item.zone && 
        item.zone.toLowerCase().includes(filters.zone.toLowerCase())
      );
    }
    
    if (filters.full_inspection_completed) {
      result = result.filter(item => 
        item.full_inspection_completed === filters.full_inspection_completed
      );
    }
    
    setFilteredInspections(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      sap_function_location: '',
      building_name: '',
      macro_area: '',
      proponent: '',
      zone: '',
      full_inspection_completed: ''
    });
    setFilteredInspections(inspections);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inspection?')) {
      try {
        await api.deleteInspection(id);
        const updatedInspections = inspections.filter(inspection => inspection.id !== id);
        setInspections(updatedInspections);
        setFilteredInspections(filteredInspections.filter(inspection => inspection.id !== id));
        setSuccess('Inspection deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting inspection:', error);
        setError('Failed to delete inspection. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInspections.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageItems = [];
    
    // Always show first page
    pageItems.push(
      <Pagination.Item 
        key={1} 
        active={currentPage === 1}
        onClick={() => paginate(1)}
      >
        1
      </Pagination.Item>
    );

    // If not near the beginning, show ellipsis
    if (currentPage > 3) {
      pageItems.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      pageItems.push(
        <Pagination.Item 
          key={i} 
          active={currentPage === i}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // If not near the end, show ellipsis
    if (currentPage < totalPages - 2) {
      pageItems.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageItems.push(
        <Pagination.Item 
          key={totalPages} 
          active={currentPage === totalPages}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev 
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />
        {pageItems}
        <Pagination.Next 
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
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
      {/* Enhanced Header Section */}
      <div className="dashboard-header mb-4 p-4 bg-light rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0"><FaBuilding className="me-2" />Facility Inspections</h2>
            <p className="text-muted mt-1">Manage and view facility inspection records</p>
          </div>
          <div>
            <Button 
              variant={showFilters ? "primary" : "outline-primary"}
              className="me-2 d-flex align-items-center"
              style={{ 
                borderRadius: '6px', 
                padding: '8px 16px',
                boxShadow: showFilters ? '0 0 0 0.2rem rgba(0,123,255,.25)' : 'none'
              }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaSlidersH className="me-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Link to="/inspections/new">
              <Button 
                variant="primary"
                className="d-flex align-items-center"
                style={{ borderRadius: '6px', padding: '8px 16px' }}
              >
                <FaClipboardCheck className="me-2" />
                Add New Inspection
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-4 shadow-sm filter-card">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <FaFilter className="me-2" /> Filter Inspections
            </h5>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={clearFilters}
              className="d-flex align-items-center"
            >
              <FaTimes className="me-1" />
              Clear Filters
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>SAP Function Location</Form.Label>
                  <Form.Select
                    name="sap_function_location"
                    value={filters.sap_function_location}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {uniqueValues.sap_function_location.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Building Name</Form.Label>
                  <Form.Select
                    name="building_name"
                    value={filters.building_name}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {uniqueValues.building_name.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Macro Area</Form.Label>
                  <Form.Select
                    name="macro_area"
                    value={filters.macro_area}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {uniqueValues.macro_area.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Proponent</Form.Label>
                  <Form.Select
                    name="proponent"
                    value={filters.proponent}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {uniqueValues.proponent.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Zone</Form.Label>
                  <Form.Select
                    name="zone"
                    value={filters.zone}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    {uniqueValues.zone.map((value, index) => (
                      <option key={index} value={value}>{value}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Inspection Status</Form.Label>
                  <Form.Select
                    name="full_inspection_completed"
                    value={filters.full_inspection_completed}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="">All</option>
                    <option value="Yes">Completed</option>
                    <option value="No">Not Completed</option>
                    <option value="Partial">Partial</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Results count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <strong>
            {filteredInspections.length} {filteredInspections.length === 1 ? 'inspection' : 'inspections'} found
            {Object.values(filters).some(value => value) && ' (filtered)'}
          </strong>
          <span className="text-muted ms-2">
            Showing {filteredInspections.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredInspections.length)} of {filteredInspections.length}
          </span>
        </div>
      </div>

      {filteredInspections.length === 0 ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <Card.Title>No Inspections Found</Card.Title>
            <Card.Text>
              {Object.values(filters).some(value => value) 
                ? 'No inspections match your current filters. Try changing or clearing your filters.'
                : 'There are no inspections in the system yet. Click the button below to create your first inspection.'}
            </Card.Text>
            {!Object.values(filters).some(value => value) && (
              <Link to="/inspections/new">
                <Button variant="primary">Create Inspection</Button>
              </Link>
            )}
            {Object.values(filters).some(value => value) && (
              <Button variant="outline-secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="table-responsive inspection-table shadow-sm rounded">
            <Table striped hover className="mb-0">
              <thead className="table-header">
                <tr>
                  <th>ID</th>
                  <th>Building Name</th>
                  <th>Facility Type</th>
                  <th>SAP Function Location</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((inspection) => (
                  <tr key={inspection.id}>
                    <td>{inspection.id}</td>
                    <td>{inspection.building_name}</td>
                    <td>{inspection.facility_type}</td>
                    <td>{inspection.sap_function_location}</td>
                    <td>{inspection.macro_area} - {inspection.micro_area}</td>
                    <td>
                      <Badge 
                        bg={
                          inspection.full_inspection_completed === 'Yes' ? 'success' : 
                          inspection.full_inspection_completed === 'Partial' ? 'warning' : 'danger'
                        }
                        className="px-2 py-1"
                      >
                        {inspection.full_inspection_completed}
                      </Badge>
                    </td>
                    <td>{new Date(inspection.created_at).toLocaleDateString()}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <Link to={`/inspections/edit/${inspection.id}`} className="me-2">
                          <Button variant="outline-primary" size="sm" title="Edit" className="action-btn">
                            <FaEdit />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(inspection.id)}
                          title="Delete"
                          className="action-btn"
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default InspectionList;
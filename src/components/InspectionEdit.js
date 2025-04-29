import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, Card, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';
import * as api from '../api';

// Field descriptions object
const fieldDescriptions = {
  function_location_id: "The unique identifier for this facility's location in the system. This is used for reference and tracking purposes.",
  sap_function_location: "The location identifier used in the SAP system. This helps with cross-referencing between systems.",
  building_name: "The common or official name of the building being inspected.",
  building_number: "The building's reference number in the property management system.",
  facility_type: "The category of facility (e.g., Office, Warehouse, Residential, etc.).",
  function: "The primary purpose or function of the building.",
  macro_area: "The larger geographic area or zone where the building is located.",
  micro_area: "The specific sub-area or neighborhood within the macro area.",
  proponent: "The individual or department responsible for the facility.",
  zone: "The designated zone for planning or administrative purposes.",
  hvac_type: "The type(s) of heating, ventilation, and air conditioning systems installed in the building.",
  sprinkler: "Indicates whether the building has a fire sprinkler system installed.",
  fire_alarm: "Indicates whether the building has a fire alarm system installed.",
  power_source: "The type(s) of electrical power used in the building.",
  vcp_status: "The current status of the Vendor Certification Program for this facility.",
  vcp_planned_date: "The date when the VCP is scheduled to be completed (if status is 'Planned').",
  smart_power_meter_status: "Indicates whether the building has smart power meters installed.",
  eifs: "Exterior Insulation and Finish System. Indicates if the building has this type of exterior cladding system.",
  eifs_installed_year: "The year when the EIFS was installed (if applicable).",
  exterior_cladding_condition: "The current condition of the building's exterior cladding or facade.",
  interior_architectural_condition: "The current condition of the building's interior finishes and architectural elements.",
  fire_protection_system_obsolete: "Indicates whether the fire protection system is considered obsolete or still current.",
  hvac_condition: "Rating of the current condition of the HVAC system on a scale of 1-10.",
  electrical_condition: "Rating of the current condition of the electrical system on a scale of 1-10.",
  roofing_condition: "The current condition of the building's roof.",
  water_proofing_warranty: "Indicates whether the building has an active waterproofing warranty.",
  water_proofing_warranty_date: "The expiration date of the waterproofing warranty (if applicable).",
  latitude: "The geographic latitude coordinate of the building's location.",
  longitude: "The geographic longitude coordinate of the building's location.",
  full_inspection_completed: "Indicates whether the inspection has been fully completed, partially completed, or not completed."
};

const InspectionEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    function_location_id: '',
    sap_function_location: '',
    building_name: '',
    building_number: '',
    facility_type: '',
    function: '',
    macro_area: '',
    micro_area: '',
    proponent: '',
    zone: '',
    hvac_type: [''], // Array of strings
    sprinkler: 'No',
    fire_alarm: 'No',
    power_source: ['110V'], // Array of strings
    vcp_status: 'Not Applicable',
    vcp_planned_date: '',
    smart_power_meter_status: 'No',
    eifs: 'No',
    eifs_installed_year: '',
    exterior_cladding_condition: 'Average',
    interior_architectural_condition: 'Average',
    fire_protection_system_obsolete: 'Not Obsolete',
    hvac_condition: 5,
    electrical_condition: 5,
    roofing_condition: 'Average',
    water_proofing_warranty: 'No',
    water_proofing_warranty_date: '',
    latitude: '',
    longitude: '',
    full_inspection_completed: 'No'
  });

  const [otherHvacType, setOtherHvacType] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        setLoading(true);
        const { data } = await api.fetchInspection(id);
        
        // Format dates for form inputs
        const formattedData = {
          ...data,
          vcp_planned_date: data.vcp_planned_date ? formatDateForInput(data.vcp_planned_date) : '',
          water_proofing_warranty_date: data.water_proofing_warranty_date ? formatDateForInput(data.water_proofing_warranty_date) : '',
        };
        
        setFormData(formattedData);
        
        // Check if there's an "Other" HVAC type
        if (formattedData.hvac_type.some(type => !['Window', 'Split', 'Cassette', 'Duct Concealed', 'Free Standing', 'Other'].includes(type))) {
          setOtherHvacType(formattedData.hvac_type.find(type => 
            !['Window', 'Split', 'Cassette', 'Duct Concealed', 'Free Standing', 'Other'].includes(type)
          ) || '');
          
          // Add "Other" to hvac_type if it's not already there
          if (!formattedData.hvac_type.includes('Other')) {
            formattedData.hvac_type.push('Other');
          }
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching inspection:', error);
        setError('Failed to load inspection data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInspection();
  }, [id]);

  // Helper function to format dates for input fields
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Function to get current location when button is clicked
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          alert('Error getting location. Please try again or enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRadioChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleHvacTypeChange = (type, checked) => {
    let updatedHvacType = [...formData.hvac_type];
    
    if (checked) {
      if (!updatedHvacType.includes(type)) {
        updatedHvacType.push(type);
      }
    } else {
      updatedHvacType = updatedHvacType.filter(item => item !== type);
    }
    
    setFormData({ ...formData, hvac_type: updatedHvacType });
  };

  const handleOtherHvacChange = (e) => {
    setOtherHvacType(e.target.value);
    
    // Update the formData to include this value if "Other" is checked
    if (formData.hvac_type.includes('Other')) {
      let updatedHvacType = formData.hvac_type.filter(type => type !== 'Other');
      updatedHvacType.push(e.target.value);
      setFormData({ ...formData, hvac_type: updatedHvacType });
    }
  };

  const handlePowerSourceChange = (source, checked) => {
    let updatedPowerSource = [...formData.power_source];
    
    if (checked) {
      if (!updatedPowerSource.includes(source)) {
        updatedPowerSource.push(source);
      }
    } else {
      updatedPowerSource = updatedPowerSource.filter(item => item !== source);
    }
    
    setFormData({ ...formData, power_source: updatedPowerSource });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...formData,
        eifs_installed_year: formData.eifs_installed_year ? parseInt(formData.eifs_installed_year) : null,
        hvac_condition: formData.hvac_condition ? parseInt(formData.hvac_condition) : null,
        electrical_condition: formData.electrical_condition ? parseInt(formData.electrical_condition) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      // Filter out empty strings from arrays
      processedData.hvac_type = processedData.hvac_type.filter(item => item);
      processedData.power_source = processedData.power_source.filter(item => item);

      // If arrays are empty, provide default values
      if (processedData.hvac_type.length === 0) processedData.hvac_type = ['None'];
      if (processedData.power_source.length === 0) processedData.power_source = ['None'];

      await api.updateInspection(id, processedData);
      navigate('/inspections');
    } catch (error) {
      console.error('Error updating inspection:', error);
      setError('Failed to update inspection. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to show field description modal
  const showFieldDescription = (field) => {
    setModalContent({
      title: field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: fieldDescriptions[field] || "No description available."
    });
    setShowModal(true);
  };

  const hvacOptions = ['Window', 'Split', 'Cassette', 'Duct Concealed', 'Free Standing', 'Other'];
  const powerSourceOptions = ['110V', '220V', '380V', '480V'];
  const conditionOptions = ['Poor', 'Average', 'Good', 'Excellent'];
  const vcpStatusOptions = ['Completed', 'InProgress', 'Not Applicable', 'Planned'];
  
  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i);

  // Helper component for field labels with info icon
  const FieldLabel = ({ field, label }) => (
    <div className="d-flex align-items-center">
      <Form.Label className="mb-0 me-2">{label || field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Form.Label>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-${field}`}>Click for more information</Tooltip>}
      >
        <FaInfoCircle 
          onClick={() => showFieldDescription(field)} 
          style={{ cursor: 'pointer', color: '#007bff' }} 
        />
      </OverlayTrigger>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading inspection data...</p>
      </div>
    );
  }

  return (
    <div className="inspection-form">
      <h2 className="mb-4">Edit Inspection</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* Building Information Section */}
        <Card className="mb-4">
          <Card.Header as="h5">Building Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="function_location_id" />
                  <Form.Control
                    type="text"
                    name="function_location_id"
                    value={formData.function_location_id}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="sap_function_location" />
                  <Form.Control
                    type="text"
                    name="sap_function_location"
                    value={formData.sap_function_location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="building_name" />
                  <Form.Control
                    type="text"
                    name="building_name"
                    value={formData.building_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="building_number" />
                  <Form.Control
                    type="text"
                    name="building_number"
                    value={formData.building_number}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="facility_type" />
                  <Form.Control
                    type="text"
                    name="facility_type"
                    value={formData.facility_type}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="function" />
                  <Form.Control
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="macro_area" />
                  <Form.Control
                    type="text"
                    name="macro_area"
                    value={formData.macro_area}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="micro_area" />
                  <Form.Control
                    type="text"
                    name="micro_area"
                    value={formData.micro_area}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="proponent" />
                  <Form.Control
                    type="text"
                    name="proponent"
                    value={formData.proponent}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="zone" />
                  <Form.Control
                    type="text"
                    name="zone"
                    value={formData.zone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Building Systems Section */}
        <Card className="mb-4">
          <Card.Header as="h5">Building Systems</Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <FieldLabel field="hvac_type" />
              <div>
                {hvacOptions.map(option => (
                  <Form.Check
                    key={option}
                    inline
                    type="checkbox"
                    label={option}
                    checked={formData.hvac_type.includes(option)}
                    onChange={(e) => handleHvacTypeChange(option, e.target.checked)}
                    className="mb-2"
                  />
                ))}
              </div>
              {formData.hvac_type.includes('Other') && (
                <Form.Control
                  type="text"
                  placeholder="Specify other HVAC type"
                  value={otherHvacType}
                  onChange={handleOtherHvacChange}
                  className="mt-2"
                />
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="sprinkler" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="sprinkler-radio"
                      checked={formData.sprinkler === 'Yes'}
                      onChange={() => handleRadioChange('sprinkler', 'Yes')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="sprinkler-radio"
                      checked={formData.sprinkler === 'No'}
                      onChange={() => handleRadioChange('sprinkler', 'No')}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="fire_alarm" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="fire-alarm-radio"
                      checked={formData.fire_alarm === 'Yes'}
                      onChange={() => handleRadioChange('fire_alarm', 'Yes')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="fire-alarm-radio"
                      checked={formData.fire_alarm === 'No'}
                      onChange={() => handleRadioChange('fire_alarm', 'No')}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <FieldLabel field="power_source" />
              <div>
                {powerSourceOptions.map(option => (
                  <Form.Check
                    key={option}
                    inline
                    type="checkbox"
                    label={option}
                    checked={formData.power_source.includes(option)}
                    onChange={(e) => handlePowerSourceChange(option, e.target.checked)}
                    className="mb-2"
                  />
                ))}
              </div>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="vcp_status" />
                  <Form.Select
                    name="vcp_status"
                    value={formData.vcp_status}
                    onChange={handleChange}
                    required
                  >
                    {vcpStatusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                <FieldLabel field="vcp_planned_date" />
                  <Form.Control
                    type="date"
                    name="vcp_planned_date"
                    value={formData.vcp_planned_date}
                    onChange={(e) => setFormData({ ...formData, vcp_planned_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="smart_power_meter_status" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="smart-power-meter-radio"
                      checked={formData.smart_power_meter_status === 'Yes'}
                      onChange={() => handleRadioChange('smart_power_meter_status', 'Yes')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="smart-power-meter-radio"
                      checked={formData.smart_power_meter_status === 'No'}
                      onChange={() => handleRadioChange('smart_power_meter_status', 'No')}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="eifs" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="eifs-radio"
                      checked={formData.eifs === 'Yes'}
                      onChange={() => handleRadioChange('eifs', 'Yes')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="eifs-radio"
                      checked={formData.eifs === 'No'}
                      onChange={() => handleRadioChange('eifs', 'No')}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="eifs_installed_year" />
                  <Form.Select
                    name="eifs_installed_year"
                    value={formData.eifs_installed_year || ''}
                    onChange={handleChange}
                    disabled={formData.eifs !== 'Yes'}
                    className={formData.eifs === 'Yes' ? 'editable-field' : ''}
                    style={{
                      backgroundColor: formData.eifs === 'Yes' ? 'white' : '#e9ecef',
                      cursor: formData.eifs === 'Yes' ? 'pointer' : 'not-allowed',
                      opacity: 1
                    }}
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="fire_protection_system_obsolete" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Obsolete"
                      name="fire-protection-radio"
                      checked={formData.fire_protection_system_obsolete === 'Obsolete'}
                      onChange={() => handleRadioChange('fire_protection_system_obsolete', 'Obsolete')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Not Obsolete"
                      name="fire-protection-radio"
                      checked={formData.fire_protection_system_obsolete === 'Not Obsolete'}
                      onChange={() => handleRadioChange('fire_protection_system_obsolete', 'Not Obsolete')}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Building Condition Section */}
        <Card className="mb-4">
          <Card.Header as="h5">Building Condition</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="exterior_cladding_condition" />
                  <Form.Select
                    name="exterior_cladding_condition"
                    value={formData.exterior_cladding_condition}
                    onChange={handleChange}
                    required
                  >
                    {conditionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="interior_architectural_condition" />
                  <Form.Select
                    name="interior_architectural_condition"
                    value={formData.interior_architectural_condition}
                    onChange={handleChange}
                    required
                  >
                    {conditionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="hvac_condition" />
                  <Form.Control
                    type="range"
                    name="hvac_condition"
                    value={formData.hvac_condition}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                  <div className="d-flex justify-content-between">
                    <span>1</span>
                    <span>Current: {formData.hvac_condition}</span>
                    <span>10</span>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="electrical_condition" />
                  <Form.Control
                    type="range"
                    name="electrical_condition"
                    value={formData.electrical_condition}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
                  <div className="d-flex justify-content-between">
                    <span>1</span>
                    <span>Current: {formData.electrical_condition}</span>
                    <span>10</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="roofing_condition" />
                  <Form.Select
                    name="roofing_condition"
                    value={formData.roofing_condition}
                    onChange={handleChange}
                    required
                  >
                    {conditionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>

              <Form.Group className="mb-3">
                  <FieldLabel field="water_proofing_warranty" />
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Yes"
                      name="water-proofing-radio"
                      checked={formData.water_proofing_warranty === 'Yes'}
                      onChange={() => handleRadioChange('water_proofing_warranty', 'Yes')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="No"
                      name="water-proofing-radio"
                      checked={formData.water_proofing_warranty === 'No'}
                      onChange={() => handleRadioChange('water_proofing_warranty', 'No')}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                <FieldLabel field="water_proofing_warranty_date" />
                  <Form.Control
                    type="date"
                    name="water_proofing_warranty_date"
                    value={formData.water_proofing_warranty_date}
                    onChange={(e) => setFormData({ ...formData, water_proofing_warranty_date: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Additional Information Section */}
        <Card className="mb-4">
          <Card.Header as="h5">Additional Information</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="latitude" />
                  <div className="input-group">
                    <Form.Control
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      step="0.000001"
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      <FaMapMarkerAlt className="me-2" />
                      {isGettingLocation ? 'Getting...' : 'Get Coordinates'}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <FieldLabel field="longitude" />
                  <Form.Control
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.000001"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <FieldLabel field="full_inspection_completed" />
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Yes"
                  name="full-inspection-radio"
                  checked={formData.full_inspection_completed === 'Yes'}
                  onChange={() => handleRadioChange('full_inspection_completed', 'Yes')}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="No"
                  name="full-inspection-radio"
                  checked={formData.full_inspection_completed === 'No'}
                  onChange={() => handleRadioChange('full_inspection_completed', 'No')}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Partial"
                  name="full-inspection-radio"
                  checked={formData.full_inspection_completed === 'Partial'}
                  onChange={() => handleRadioChange('full_inspection_completed', 'Partial')}
                />
              </div>
            </Form.Group>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={() => navigate('/inspections')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>

      {/* Information Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{modalContent.description}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InspectionEdit;
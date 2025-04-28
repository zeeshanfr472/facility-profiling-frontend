import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';

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

  const hvacOptions = ['Window', 'Split', 'Cassette', 'Duct Concealed', 'Free Standing', 'Other'];
  const powerSourceOptions = ['110V', '220V', '380V', '480V'];
  const conditionOptions = ['Poor', 'Average', 'Good', 'Excellent'];
  const vcpStatusOptions = ['Completed', 'InProgress', 'Not Applicable', 'Planned'];

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
                  <Form.Label>Function Location ID</Form.Label>
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
                  <Form.Label>SAP Function Location</Form.Label>
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
                  <Form.Label>Building Name</Form.Label>
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
                  <Form.Label>Building Number</Form.Label>
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
                  <Form.Label>Facility Type</Form.Label>
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
                  <Form.Label>Function</Form.Label>
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
                  <Form.Label>Macro Area</Form.Label>
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
                  <Form.Label>Micro Area</Form.Label>
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
                  <Form.Label>Proponent</Form.Label>
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
                  <Form.Label>Zone</Form.Label>
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
              <Form.Label>HVAC Type</Form.Label>
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
                  <Form.Label>Sprinkler</Form.Label>
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
                  <Form.Label>Fire Alarm</Form.Label>
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
              <Form.Label>Power Source</Form.Label>
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
                  <Form.Label>VCP Status</Form.Label>
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
                <Form.Label>VCP Planned Date</Form.Label>
                <Form.Control
                  type="date"
                  name="vcp_planned_date"
                  value={formData.vcp_planned_date}
                  onChange={handleChange}
                  disabled={formData.vcp_status !== 'Planned'}
                  // Make sure the datepicker calendar appears
                  onClick={(e) => formData.vcp_status === 'Planned' && e.target.showPicker()}
                />
              </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Smart Power Meter</Form.Label>
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
                  <Form.Label>EIFS</Form.Label>
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
                <Form.Label>EIFS Installed Year</Form.Label>
                <Form.Select
                  name="eifs_installed_year"
                  value={formData.eifs_installed_year || ''}
                  onChange={handleChange}
                  disabled={formData.eifs !== 'Yes'}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => (
                    <option key={i} value={1900 + i}>
                      {1900 + i}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fire Protection System</Form.Label>
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
                  <Form.Label>Exterior Cladding Condition</Form.Label>
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
                  <Form.Label>Interior Architectural Condition</Form.Label>
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
                  <Form.Label>HVAC Condition (1-10)</Form.Label>
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
                  <Form.Label>Electrical Condition (1-10)</Form.Label>
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
                  <Form.Label>Roofing Condition</Form.Label>
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
                  <Form.Label>Water Proofing Warranty</Form.Label>
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
                <Form.Label>Water Proofing Warranty Date</Form.Label>
                <Form.Control
                  type="date"
                  name="water_proofing_warranty_date"
                  value={formData.water_proofing_warranty_date}
                  onChange={handleChange}
                  disabled={formData.water_proofing_warranty !== 'Yes'}
                  // Make sure the datepicker calendar appears
                  onClick={(e) => formData.water_proofing_warranty === 'Yes' && e.target.showPicker()}
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
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.000001"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Longitude</Form.Label>
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
              <Form.Label>Full Inspection Completed</Form.Label>
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
    </div>
  );
};

export default InspectionEdit;
import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { isAuthenticated, user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Navbar bg="light" expand="lg" className="navbar-light">
      <Container>
        <Navbar.Brand as={Link} to={isAuthenticated ? "/inspections" : "/login"}>
          Facility Profiling
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/inspections">Inspections</Nav.Link>
                <Nav.Link as={Link} to="/inspections/new">New Inspection</Nav.Link>
                <Nav.Link as={Link} to="/analytics">Analytics</Nav.Link>
                <Nav.Link as={Link} to="/map">Map View</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="me-3">Welcome, {user?.username}</span>
                <Button variant="outline-danger" onClick={logoutUser}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
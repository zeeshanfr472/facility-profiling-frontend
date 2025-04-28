import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import InspectionList from './components/InspectionList';
import InspectionForm from './components/InspectionForm';
import InspectionEdit from './components/InspectionEdit';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navigation />
        <div className="container mt-3">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/inspections" element={
              <ProtectedRoute>
                <InspectionList />
              </ProtectedRoute>
            } />
            <Route path="/inspections/new" element={
              <ProtectedRoute>
                <InspectionForm />
              </ProtectedRoute>
            } />
            <Route path="/inspections/edit/:id" element={
              <ProtectedRoute>
                <InspectionEdit />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
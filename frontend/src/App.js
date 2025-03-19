import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Components
import Home from './pages/Home';
import Login from './pages/Login';
import Troubleshooting from './pages/Troubleshooting';
import Survey from './pages/Survey';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import TicketDetails from './pages/admin/TicketDetails';
import AccountManagement from './pages/AccountManagement';
import DocumentUpload from './pages/DocumentUpload';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/survey" element={<Survey />} />
          <Route
            path="/troubleshooting"
            element={
              <ProtectedRoute>
                <Troubleshooting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/:id"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <TicketDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentUpload />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

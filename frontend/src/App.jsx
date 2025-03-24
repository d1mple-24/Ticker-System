import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Components
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Troubleshooting from './pages/Troubleshooting.jsx';
import TicketCategories from './pages/TicketCategories.jsx';
import TrackTicket from './pages/TrackTicket.jsx';
import Survey from './pages/Survey.jsx';
import AccountManagement from './pages/AccountManagement.jsx';
import DocumentUpload from './pages/DocumentUpload.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageTickets from './pages/admin/ManageTickets.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tickets" element={<TicketCategories />} />
      <Route path="/track-ticket" element={<TrackTicket />} />
      <Route path="/survey" element={<Survey />} />
      <Route path="/troubleshooting" element={<Troubleshooting />} />
      <Route path="/account" element={<AccountManagement />} />
      <Route path="/documents" element={<DocumentUpload />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <ManageTickets />
          </ProtectedRoute>
        }
      />
    </Route>
  )
);

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider 
          router={router} 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 
import React from 'react';
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route 
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
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminTickets from './pages/admin/AdminTickets.jsx';
import TicketDetails from './pages/admin/TicketDetails.jsx';
import AccountManagement from './pages/AccountManagement.jsx';
import DocumentUpload from './pages/DocumentUpload.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Users from './pages/admin/Users';

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
      <Route path="/admin/*" element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route path="users" element={<Users />} />
      </Route>
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
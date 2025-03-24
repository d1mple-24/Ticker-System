import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Tag as TagIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:5000/api';

const TrackTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [formData, setFormData] = useState({
    ticketId: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setTicket(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      // Validate inputs
      if (!formData.ticketId || !formData.email) {
        throw new Error('Please fill in all fields');
      }

      // Validate ticket ID is a number
      const ticketId = parseInt(formData.ticketId);
      if (isNaN(ticketId)) {
        throw new Error('Ticket ID must be a valid number');
      }

      const response = await axios.post(`${API_BASE_URL}/tickets/track`, {
        ticketId: ticketId,
        email: formData.email
      });

      if (response.data.success) {
        setTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Error tracking ticket:', error);
      setError(error.response?.data?.message || error.message || 'Failed to track ticket');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return '#ed6c02';
      case 'IN_PROGRESS':
        return '#0288d1';
      case 'RESOLVED':
        return '#2e7d32';
      case 'CANCELLED':
        return '#d32f2f';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return '#d32f2f';
      case 'MEDIUM':
        return '#ed6c02';
      case 'LOW':
        return '#2e7d32';
      default:
        return '#757575';
    }
  };

  const renderTicketDetails = () => {
    if (!ticket) return null;

    return (
      <Box sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ticket Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ticket ID: #{ticket.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Tracking ID: {ticket.trackingId}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Status and Priority */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<InfoIcon />}
              label={`Status: ${ticket.status}`}
              sx={{
                bgcolor: `${getStatusColor(ticket.status)}15`,
                color: getStatusColor(ticket.status),
                borderColor: getStatusColor(ticket.status),
                '& .MuiChip-icon': {
                  color: getStatusColor(ticket.status),
                },
              }}
              variant="outlined"
            />
            <Chip
              icon={<PriorityIcon />}
              label={`Priority: ${ticket.priority}`}
              sx={{
                bgcolor: `${getPriorityColor(ticket.priority)}15`,
                color: getPriorityColor(ticket.priority),
                borderColor: getPriorityColor(ticket.priority),
                '& .MuiChip-icon': {
                  color: getPriorityColor(ticket.priority),
                },
              }}
              variant="outlined"
            />
            <Chip
              icon={<CategoryIcon />}
              label={`Category: ${ticket.category}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Basic Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Name:</strong> {ticket.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Email:</strong> {ticket.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Department:</strong> {ticket.department}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Created:</strong> {ticket.createdAt}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Category Specific Details */}
          {ticket.categorySpecificDetails && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                {ticket.categorySpecificDetails.type} Details
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(ticket.categorySpecificDetails.details).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body2">
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                        {Array.isArray(value) ? value.join(', ') : value}
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Last Update */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {ticket.updatedAt}
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          py: 2, 
          px: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 0,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: 1200,
          mx: 'auto'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => navigate('/')}
              sx={{ color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Track Ticket
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            Track Your Ticket
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              name="ticketId"
              label="Ticket ID"
              value={formData.ticketId}
              onChange={handleChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              required
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
              }}
            >
              {loading ? 'Searching...' : 'Track Ticket'}
            </Button>
          </Box>
        </Paper>

        {/* Ticket Details Section */}
        {renderTicketDetails()}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Need help? Contact our support team
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3,
          textAlign: 'center',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} DepEd Imus Division | ictcaa
        </Typography>
      </Box>
    </Box>
  );
};

export default TrackTicket; 
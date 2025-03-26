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
  Download as DownloadIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add formatDate function
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const TrackTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [formData, setFormData] = useState({
    trackingId: '',
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
      if (!formData.trackingId || !formData.email) {
        throw new Error('Please fill in all fields');
      }

      // Validate tracking ID format (YYYYMMDD-TICKETID)
      const trackingIdRegex = /^\d{8}-\d+$/;
      if (!trackingIdRegex.test(formData.trackingId)) {
        throw new Error('Invalid tracking ID format. Expected format: YYYYMMDD-TICKETID');
      }

      const response = await axios.post(`${API_BASE_URL}/tickets/track`, {
        trackingId: formData.trackingId,
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

  // Handle document download
  const handleDownload = async () => {
    try {
      setLoading(true);
      // Check if file path is available in categorySpecificDetails
      let filePath = null;
      let fileName = null;
      
      if (ticket.categorySpecificDetails?.details?.fileName) {
        filePath = ticket.categorySpecificDetails.details.fileName;
        fileName = ticket.categorySpecificDetails.details.originalFileName || filePath;
      }
      
      if (!filePath) {
        throw new Error('No document attached to this ticket');
      }
      
      const response = await axios.get(`${API_BASE_URL}/documents/public/${filePath}`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download document');
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
    if (loading) {
      return (
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 5, borderRadius: 2, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main', mb: 3 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              Tracking Your Ticket
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we fetch your ticket details...
            </Typography>
          </Paper>
        </Box>
      );
    }

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
                  <strong>Created:</strong> {formatDate(ticket.createdAt)}
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
                  if (!value || key === 'fileName' || key === 'filePath' || key === 'originalFileName' || key === 'fileType' || key === 'fileSize') return null;
                  return (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body2">
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                        {key === 'dateOfRequest' ? formatDate(value) : (Array.isArray(value) ? value.join(', ') : value)}
                      </Typography>
                    </Grid>
                  );
                })}
              </Grid>
              
              {/* Document Download Button */}
              {ticket.category === 'DOCUMENT_UPLOAD' && ticket.categorySpecificDetails?.details?.fileName && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    disabled={loading}
                    size="small"
                  >
                    {loading ? 'Downloading...' : `Download ${ticket.categorySpecificDetails.details.originalFileName || 'Attached Document'}`}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* Last Update */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatDate(ticket.updatedAt)}
            </Typography>

            {/* Pending Status Message */}
            {ticket.status === 'PENDING' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="warning.dark" gutterBottom>
                  Your ticket is pending review 🕒
                </Typography>
                <Typography variant="body2" color="warning.dark">
                  Please be patient as we process your request. We are currently handling multiple tickets and will attend to yours as soon as possible.
                </Typography>
              </Box>
            )}

            {/* ICT Support Information for IN_PROGRESS, RESOLVED, and CLOSED status */}
            {(ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#E3F2FD', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" color="#1976D2" gutterBottom sx={{ mb: 0 }}>
                    ICT Support Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="#1565C0" sx={{ display: 'flex', alignItems: 'center' }}>
                        <strong>Assigned To:</strong>&nbsp;
                        {ticket.ictAssignedTo ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <PersonIcon fontSize="small" /> {ticket.ictAssignedTo}
                          </span>
                        ) : (
                          'Not yet assigned'
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  {ticket.ictDiagnosisDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#1565C0">
                        <strong>Diagnosis:</strong> {ticket.ictDiagnosisDetails}
                      </Typography>
                    </Grid>
                  )}
                  {ticket.ictFixDetails && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#1565C0">
                        <strong>Fix Details:</strong> {ticket.ictFixDetails}
                      </Typography>
                    </Grid>
                  )}
                  {ticket.ictDateFixed && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#1565C0">
                        <strong>Date Fixed:</strong> {ticket.ictDateFixed ? formatDate(ticket.ictDateFixed) : 'Not yet fixed'}
                      </Typography>
                    </Grid>
                  )}
                  {ticket.ictRecommendations && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#1565C0">
                        <strong>Recommendations:</strong> {ticket.ictRecommendations}
                      </Typography>
                    </Grid>
                  )}
                  {!ticket.ictDiagnosisDetails && !ticket.ictFixDetails && !ticket.ictDateFixed && !ticket.ictRecommendations && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#1565C0" sx={{ fontStyle: 'italic' }}>
                        {ticket.status === 'IN_PROGRESS' 
                          ? 'Our ICT team is currently working on your ticket. Updates will be posted here.'
                          : 'No additional information available.'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Resolved Status Feedback Button */}
            {ticket.status === 'RESOLVED' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#E8F5E9', borderRadius: 1 }}>
                <Typography variant="subtitle1" color="#2E7D32" gutterBottom>
                  Your ticket has been resolved! 🎉
                </Typography>
                <Typography variant="body2" color="#2E7D32" gutterBottom>
                  We value your feedback to help us improve our services.
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  size="medium"
                  onClick={() => window.open('https://csm.depedimuscity.com/', '_blank')}
                  startIcon={<InfoIcon />}
                  sx={{ 
                    mt: 1,
                    bgcolor: '#2E7D32',
                    '&:hover': {
                      bgcolor: '#1B5E20'
                    }
                  }}
                  fullWidth
                >
                  Submit Your Feedback
                </Button>
                <Typography variant="caption" color="#2E7D32" display="block" sx={{ mt: 1 }}>
                  Please take a moment to rate our service and share your experience
                </Typography>
              </Box>
            )}
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
              name="trackingId"
              label="Tracking ID"
              value={formData.trackingId}
              onChange={handleChange}
              placeholder="YYYYMMDD-TICKETID"
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
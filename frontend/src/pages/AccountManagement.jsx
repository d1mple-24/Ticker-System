import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import BackButton from '../components/BackButton';

const AccountManagement = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: 'MEDIUM',
    accountType: '',
    actionType: '',
    subject: '',
    message: '',
  });
  const [message, setMessage] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/tickets/account-management', {
        category: 'ACCOUNT_MANAGEMENT',
        name: formData.name,
        email: formData.email,
        priority: formData.priority,
        accountType: formData.accountType,
        actionType: formData.actionType,
        subject: formData.subject,
        message: formData.message
      });

      const { ticketId, trackingId } = response.data;
      setTicketInfo({ ticketId, trackingId });
      
      setMessage({
        type: 'success',
        text: `Account management request submitted successfully! Your Ticket ID is #${ticketId} and Tracking ID is ${trackingId}. Please save these for future reference. An email has been sent to ${formData.email} with your ticket details.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        priority: 'MEDIUM',
        accountType: '',
        actionType: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit request. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      <BackButton />
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4,
        '& h4': {
          color: theme.palette.primary.main,
          fontWeight: 600,
          position: 'relative',
          display: 'inline-block',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: 4,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 2,
          }
        }
      }}>
        <Typography variant="h4" gutterBottom>
          Account Management
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        bgcolor: '#ffffff',
        position: 'relative',
        '&::after': isSubmitting ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        } : {}
      }}>
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ 
              mb: 3,
              borderRadius: 1,
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {message.text}
            {ticketInfo && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid' }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Ticket ID:</strong> #{ticketInfo.ticketId}
                </Typography>
                <Typography variant="body2">
                  <strong>Tracking ID:</strong> {ticketInfo.trackingId}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Please save these details for tracking your ticket status.
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ 
            display: 'grid', 
            gap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            '& .full-width': {
              gridColumn: { xs: '1', sm: '1 / -1' }
            }
          }}>
            <TextField
              required
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              disabled={isSubmitting}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
            />

            <TextField
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              disabled={isSubmitting}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
            />

            <FormControl required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                disabled={isSubmitting}
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl required>
              <InputLabel>Account Type</InputLabel>
              <Select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                label="Account Type"
                disabled={isSubmitting}
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="GMAIL">Gmail Account</MenuItem>
                <MenuItem value="M365">M365 Account</MenuItem>
                <MenuItem value="LIS">LIS Account</MenuItem>
                <MenuItem value="LMS">LMS Account</MenuItem>
                <MenuItem value="ADOBE">Adobe Account</MenuItem>
              </Select>
            </FormControl>

            <FormControl required>
              <InputLabel>Action Type</InputLabel>
              <Select
                name="actionType"
                value={formData.actionType}
                onChange={handleChange}
                label="Action Type"
                disabled={isSubmitting}
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="CREATE">Create Password</MenuItem>
                <MenuItem value="RESET">Reset Password</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              variant="outlined"
              disabled={isSubmitting}
              sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
            />

            <TextField
              required
              multiline
              rows={4}
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={isSubmitting}
              className="full-width"
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                } 
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              className="full-width"
              disabled={isSubmitting}
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                position: 'relative',
                '& .MuiCircularProgress-root': {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} color="inherit" />
                  <span style={{ opacity: 0 }}>Submit Request</span>
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AccountManagement; 
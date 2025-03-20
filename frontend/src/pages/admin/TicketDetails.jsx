import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTicketDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setError('Failed to load ticket details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleUpdateTicket = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tickets/${id}`, {
        status: ticket.status,
        priority: ticket.priority,
        response: ticket.response
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketDetails();
      setSaving(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError('Failed to update ticket');
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/tickets')}
            sx={{ mt: 2 }}
          >
            Back to Tickets
          </Button>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/tickets')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Ticket #{id}
          </Typography>
        </Box>

        {ticket && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {/* Ticket Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {ticket.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  label={ticket.status}
                  color={getStatusColor(ticket.status)}
                  size="small"
                />
                <Chip
                  label={ticket.priority}
                  color={getPriorityColor(ticket.priority)}
                  size="small"
                />
                <Chip
                  label={`Created: ${new Date(ticket.createdAt).toLocaleDateString()}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Requester:</strong> {ticket.user?.name}</Typography>
                <Typography><strong>Department:</strong> {ticket.department}</Typography>
                <Typography><strong>Device Type:</strong> {ticket.deviceType}</Typography>
                <Typography><strong>Contact:</strong> {ticket.contactNumber}</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Ticket Management */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ticket Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ width: 200 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={ticket.status}
                    onChange={(e) => setTicket({...ticket, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ width: 200 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={ticket.priority}
                    onChange={(e) => setTicket({...ticket, priority: e.target.value})}
                    label="Priority"
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                label="Admin Response"
                multiline
                rows={4}
                value={ticket.response || ''}
                onChange={(e) => setTicket({...ticket, response: e.target.value})}
                fullWidth
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleUpdateTicket}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Ticket'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </AdminLayout>
  );
}

export default TicketDetails; 
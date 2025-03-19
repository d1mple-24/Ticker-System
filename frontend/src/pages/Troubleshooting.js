import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import axios from 'axios';

function Troubleshooting() {
  const [formData, setFormData] = useState({
    deviceType: '',
    problem: '',
    contactNumber: '',
  });
  const [message, setMessage] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tickets', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({
        type: 'success',
        text: 'Your troubleshooting request has been submitted. Our IT team will contact you shortly.',
      });

      // Reset form
      setFormData({
        deviceType: '',
        problem: '',
        contactNumber: '',
      });

      // Refresh tickets list
      fetchUserTickets();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit ticket. Please try again.',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'primary';
      case 'in progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        IT Support Request Form
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl required fullWidth>
              <InputLabel>Device Type</InputLabel>
              <Select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                label="Device Type"
              >
                <MenuItem value="Desktop">Desktop Computer</MenuItem>
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Printer">Printer</MenuItem>
                <MenuItem value="Network">Network/Internet</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              multiline
              rows={4}
              label="Problem Description"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="Please describe your technical issue in detail"
              fullWidth
            />

            <TextField
              required
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Your contact number for follow-up"
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
            >
              Submit Support Request
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 3 }}>
        My Support Tickets
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket ID</TableCell>
              <TableCell>Device Type</TableCell>
              <TableCell>Problem</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Response</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading tickets...</TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No tickets found</TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.deviceType}</TableCell>
                  <TableCell>{ticket.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.status} 
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.response || 'Pending'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Troubleshooting; 
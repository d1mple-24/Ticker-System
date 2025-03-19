import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const filteredTickets = tickets.filter((ticket) =>
    Object.values(ticket).some(
      value => 
        value && 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const displayedTickets = filteredTickets
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Manage Tickets
        </Typography>
        <TextField
          size="small"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Device Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">Loading tickets...</TableCell>
              </TableRow>
            ) : displayedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">No tickets found</TableCell>
              </TableRow>
            ) : (
              displayedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    {ticket.description.length > 50 
                      ? `${ticket.description.substring(0, 50)}...` 
                      : ticket.description}
                  </TableCell>
                  <TableCell>{ticket.user?.name || 'N/A'}</TableCell>
                  <TableCell>{ticket.department}</TableCell>
                  <TableCell>{ticket.deviceType}</TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.status} 
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={ticket.priority} 
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket.contactNumber}</TableCell>
                  <TableCell>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewTicket(ticket)} title="View">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleViewTicket(ticket)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteTicket(ticket.id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Ticket Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography><strong>Title:</strong> {selectedTicket.title}</Typography>
              <Typography><strong>Description:</strong> {selectedTicket.description}</Typography>
              <Typography><strong>Requester:</strong> {selectedTicket.user?.name}</Typography>
              <Typography><strong>Department:</strong> {selectedTicket.department}</Typography>
              <Typography><strong>Device Type:</strong> {selectedTicket.deviceType}</Typography>
              <Typography><strong>Contact:</strong> {selectedTicket.contactNumber}</Typography>
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedTicket.status}
                  onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
                  label="Status"
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={selectedTicket.priority}
                  onChange={(e) => setSelectedTicket({...selectedTicket, priority: e.target.value})}
                  label="Priority"
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Response"
                multiline
                rows={4}
                value={selectedTicket.response || ''}
                onChange={(e) => setSelectedTicket({...selectedTicket, response: e.target.value})}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleUpdateTicket(selectedTicket.id, {
              status: selectedTicket.status,
              priority: selectedTicket.priority,
              response: selectedTicket.response
            })} 
            variant="contained"
          >
            Update Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminTickets; 
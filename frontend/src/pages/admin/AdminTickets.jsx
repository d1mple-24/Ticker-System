import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data.tickets || []);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets. Please try again.');
      setTickets([]);
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
      setError('Failed to update ticket. Please try again.');
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

  const filteredTickets = tickets.filter((ticket) =>
    Object.values(ticket || {}).some(
      value => 
        value && 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const displayedTickets = filteredTickets
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tickets Table */}
        <Paper sx={{ 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Problem</TableCell>
                  <TableCell>Office</TableCell>
                  <TableCell>Equipment Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : displayedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {error ? 'Error loading tickets' : 'No tickets found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      onClick={() => handleViewTicket(ticket)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: 'action.hover',
                          '& .MuiTableCell-root': {
                            color: 'primary.main'
                          }
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.name || 'N/A'}</TableCell>
                      <TableCell>
                        {ticket.specificProblem ? 
                          (ticket.specificProblem.length > 50 
                            ? `${ticket.specificProblem.substring(0, 50)}...` 
                            : ticket.specificProblem)
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{ticket.office || 'N/A'}</TableCell>
                      <TableCell>{ticket.typeOfEquipment || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={ticket.status || 'PENDING'} 
                          color={getStatusColor(ticket.status)}
                          size="small"
                          sx={{ minWidth: 85 }}
                        />
                      </TableCell>
                      <TableCell>{ticket.email || 'N/A'}</TableCell>
                      <TableCell>
                        {ticket.dateOfRequest ? new Date(ticket.dateOfRequest).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ 
            borderTop: '1px solid #e0e0e0',
            bgcolor: '#fafafa'
          }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTickets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Paper>

        {/* Ticket Details Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#fafafa'
          }}>
            Ticket Details
          </DialogTitle>
          <DialogContent dividers>
            {selectedTicket && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
                <Typography><strong>Name:</strong> {selectedTicket.name || 'N/A'}</Typography>
                <Typography><strong>Problem:</strong> {selectedTicket.specificProblem || 'N/A'}</Typography>
                <Typography><strong>Office:</strong> {selectedTicket.office || 'N/A'}</Typography>
                <Typography><strong>Equipment Type:</strong> {selectedTicket.typeOfEquipment || 'N/A'}</Typography>
                <Typography><strong>Model:</strong> {selectedTicket.modelOfEquipment || 'N/A'}</Typography>
                <Typography><strong>Serial No:</strong> {selectedTicket.serialNo || 'N/A'}</Typography>
                <Typography><strong>Contact:</strong> {selectedTicket.email || 'N/A'}</Typography>
                <Typography><strong>Date:</strong> {selectedTicket.dateOfRequest ? new Date(selectedTicket.dateOfRequest).toLocaleDateString() : 'N/A'}</Typography>
                
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedTicket.status || 'PENDING'}
                    onChange={(e) => setSelectedTicket({...selectedTicket, status: e.target.value})}
                    label="Status"
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
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
          <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => setDialogOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => handleUpdateTicket(selectedTicket.id, {
                status: selectedTicket.status || 'PENDING',
                response: selectedTicket.response || ''
              })} 
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Update Ticket
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default AdminTickets; 
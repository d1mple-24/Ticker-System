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

const API_BASE_URL = 'http://localhost:5000/api';

const TICKET_CATEGORIES = {
  TROUBLESHOOTING: 'Troubleshooting',
  ACCOUNT_MANAGEMENT: 'Account Management',
  DOCUMENT_UPLOAD: 'Document Upload'
};

function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTickets(response.data.data.tickets || []);
      setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError(error.message || 'Failed to fetch tickets. Please try again.');
      setTickets([]);
    } finally {
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
      const response = await axios.put(`${API_BASE_URL}/tickets/${ticketId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await fetchTickets();
      setDialogOpen(false);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      setError(error.message || 'Failed to update ticket. Please try again.');
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

  const getCategoryLabel = (category) => {
    return TICKET_CATEGORIES[category] || category;
  };

  const getTicketDetails = (ticket) => {
    switch (ticket.category) {
      case 'TROUBLESHOOTING':
        return {
          title: `${ticket.typeOfEquipment} Issue`,
          subtitle: ticket.modelOfEquipment,
          description: ticket.specificProblem
        };
      case 'ACCOUNT_MANAGEMENT':
        return {
          title: ticket.type,
          subtitle: ticket.accountType || ticket.position,
          description: ticket.reason
        };
      case 'DOCUMENT_UPLOAD':
        return {
          title: ticket.documentTitle,
          subtitle: ticket.documentType,
          description: ticket.documentDescription
        };
      default:
        return {
          title: 'Unknown',
          subtitle: '',
          description: ''
        };
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    // First apply category filter
    if (categoryFilter && ticket.category !== categoryFilter) {
      return false;
    }

    // Then apply search filter
    if (searchQuery) {
      return Object.values(ticket || {}).some(
      value => 
        value && 
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );
    }

    return true;
  });

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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {Object.entries(TICKET_CATEGORIES).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  <TableCell>Category</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : displayedTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {error ? 'Error loading tickets' : 'No tickets found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTickets.map((ticket) => {
                    const details = getTicketDetails(ticket);
                    return (
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
                        <TableCell>
                          <Chip 
                            label={getCategoryLabel(ticket.category)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                      <TableCell>{ticket.name || 'N/A'}</TableCell>
                        <TableCell>{ticket.department || 'N/A'}</TableCell>
                      <TableCell>
                          <Typography variant="body2" component="div">
                            <strong>{details.title}</strong>
                          </Typography>
                          {details.subtitle && (
                            <Typography variant="caption" color="textSecondary">
                              {details.subtitle}
                            </Typography>
                          )}
                          {details.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              {details.description.length > 100 
                                ? `${details.description.substring(0, 100)}...` 
                                : details.description}
                            </Typography>
                          )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ticket.status || 'PENDING'} 
                          color={getStatusColor(ticket.status)}
                          size="small"
                          sx={{ minWidth: 85 }}
                        />
                      </TableCell>
                      <TableCell>
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                    );
                  })
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
            bgcolor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography component="div" variant="h6">
            Ticket Details
              </Typography>
              <Chip 
                label={selectedTicket?.status || 'PENDING'} 
                color={getStatusColor(selectedTicket?.status)}
                size="small"
                sx={{ minWidth: 85 }}
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTicket && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
                {/* Request Information */}
                <Typography component="div" variant="h6" color="primary" sx={{ mt: 1 }}>
                  Request Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Name:</strong> {selectedTicket.name || 'N/A'}</Typography>
                  <Typography><strong>Date:</strong> {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString() : 'N/A'}</Typography>
                  <Typography><strong>Department:</strong> {selectedTicket.department || 'N/A'}</Typography>
                  <Typography><strong>Contact:</strong> {selectedTicket.email || 'N/A'}</Typography>
                  
                  {selectedTicket.category === 'ACCOUNT_MANAGEMENT' ? (
                    <>
                      <Typography><strong>Request Type:</strong> {selectedTicket.type || 'N/A'}</Typography>
                      <Typography><strong>Account Type:</strong> {selectedTicket.accountType || 'N/A'}</Typography>
                      {selectedTicket.position && (
                        <Typography><strong>Position:</strong> {selectedTicket.position}</Typography>
                      )}
                      {selectedTicket.employeeId && (
                        <Typography><strong>Employee ID:</strong> {selectedTicket.employeeId}</Typography>
                      )}
                    </>
                  ) : selectedTicket.category === 'TROUBLESHOOTING' ? (
                    <>
                <Typography><strong>Equipment Type:</strong> {selectedTicket.typeOfEquipment || 'N/A'}</Typography>
                <Typography><strong>Model:</strong> {selectedTicket.modelOfEquipment || 'N/A'}</Typography>
                <Typography><strong>Serial No:</strong> {selectedTicket.serialNo || 'N/A'}</Typography>
                    </>
                  ) : selectedTicket.category === 'DOCUMENT_UPLOAD' ? (
                    <>
                      <Typography><strong>Document Title:</strong> {selectedTicket.documentTitle || 'N/A'}</Typography>
                      <Typography><strong>Document Type:</strong> {selectedTicket.documentType || 'N/A'}</Typography>
                    </>
                  ) : null}
                </Box>

                <Typography sx={{ mt: 2 }}><strong>{
                  selectedTicket.category === 'TROUBLESHOOTING' ? 'Problem Description:' :
                  selectedTicket.category === 'ACCOUNT_MANAGEMENT' ? 'Request Reason:' :
                  selectedTicket.category === 'DOCUMENT_UPLOAD' ? 'Document Description:' :
                  'Description:'
                }</strong></Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography>{
                    selectedTicket.category === 'TROUBLESHOOTING' ? selectedTicket.specificProblem :
                    selectedTicket.category === 'ACCOUNT_MANAGEMENT' ? selectedTicket.reason :
                    selectedTicket.category === 'DOCUMENT_UPLOAD' ? selectedTicket.documentDescription :
                    'N/A'
                  }</Typography>
                </Paper>

                {/* Technical Assessment */}
                <Typography component="div" variant="h6" color="primary" sx={{ mt: 2 }}>
                  Technical Assessment
                </Typography>
                
                <TextField
                  label="Repair/Diagnostic Completed By"
                  value={selectedTicket.completedBy || ''}
                  onChange={(e) => setSelectedTicket({...selectedTicket, completedBy: e.target.value})}
                  fullWidth
                />

                <TextField
                  label="Diagnosis"
                  multiline
                  rows={3}
                  value={selectedTicket.diagnosis || ''}
                  onChange={(e) => setSelectedTicket({...selectedTicket, diagnosis: e.target.value})}
                  fullWidth
                />

                <TextField
                  label="Action Taken"
                  multiline
                  rows={3}
                  value={selectedTicket.actionTaken || ''}
                  onChange={(e) => setSelectedTicket({...selectedTicket, actionTaken: e.target.value})}
                  fullWidth
                />

                <TextField
                  label="Recommendations"
                  multiline
                  rows={3}
                  value={selectedTicket.recommendations || ''}
                  onChange={(e) => setSelectedTicket({...selectedTicket, recommendations: e.target.value})}
                  fullWidth
                />

                {/* Status Update */}
                <Typography component="div" variant="h6" color="primary" sx={{ mt: 2 }}>
                  Status Update
                </Typography>
                
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
                  label="Additional Notes/Response"
                  multiline
                  rows={3}
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
                response: selectedTicket.response || '',
                completedBy: selectedTicket.completedBy || '',
                diagnosis: selectedTicket.diagnosis || '',
                actionTaken: selectedTicket.actionTaken || '',
                recommendations: selectedTicket.recommendations || ''
              })} 
              variant="contained"
              color="primary"
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
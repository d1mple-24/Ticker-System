import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Memoized components
const UserDetailsContent = React.memo(({ user }) => (
  <Box sx={{ mt: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            <strong>Name:</strong> {user.name}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            <strong>Email:</strong> {user.email}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            <strong>Department:</strong> {user.department}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            <strong>Role:</strong> {user.role}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Grid>
    </Grid>
    <Divider sx={{ my: 2 }} />
  </Box>
));

const UserForm = React.memo(({ formData, onChange, onSubmit }) => (
  <Box component="form" sx={{ mt: 2 }} onSubmit={onSubmit}>
    <TextField
      fullWidth
      label="Name"
      value={formData.name}
      onChange={(e) => onChange({ ...formData, name: e.target.value })}
      margin="normal"
      required
    />
    <TextField
      fullWidth
      label="Email"
      type="email"
      value={formData.email}
      onChange={(e) => onChange({ ...formData, email: e.target.value })}
      margin="normal"
      required
    />
    <TextField
      fullWidth
      label="Department"
      value={formData.department}
      onChange={(e) => onChange({ ...formData, department: e.target.value })}
      margin="normal"
      required
    />
    <TextField
      fullWidth
      select
      label="Role"
      value={formData.role}
      onChange={(e) => onChange({ ...formData, role: e.target.value })}
      margin="normal"
      required
    >
      <MenuItem value="USER">User</MenuItem>
      <MenuItem value="ADMIN">Admin</MenuItem>
    </TextField>
  </Box>
));

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'USER'
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenDialog = useCallback((user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        department: '',
        role: 'USER'
      });
    }
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      role: 'USER'
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = selectedUser 
        ? `${API_BASE_URL}/admin/users/${selectedUser.id}`
        : `${API_BASE_URL}/admin/users`;

      const method = selectedUser ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        await fetchUsers();
        handleCloseDialog();
      } else {
        throw new Error(response.data.message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n');
        setError(`Validation errors:\n${validationErrors}`);
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to save user');
      }
    }
  }, [formData, selectedUser, fetchUsers, handleCloseDialog]);

  const handleCloseDetailsDialog = useCallback(() => {
    setOpenDetailsDialog(false);
    setSelectedUser(null);
  }, []);

  const handleDeleteUser = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.delete(`${API_BASE_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          await fetchUsers();
          handleCloseDetailsDialog();
        } else {
          throw new Error(response.data.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.response?.data?.message || error.message || 'Failed to delete user');
      }
    }
  }, [fetchUsers, handleCloseDetailsDialog]);

  const handleRowClick = useCallback((params) => {
    setSelectedUser(params.row);
    setOpenDetailsDialog(true);
  }, []);

  const columns = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      flex: 0.5
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1.5,
      minWidth: 200
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      flex: 1,
      minWidth: 180
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => {
        const isAdmin = params.value === 'ADMIN';
        return (
          <Box sx={{ 
            backgroundColor: isAdmin ? 'rgba(25, 118, 210, 0.12)' : 'rgba(46, 125, 50, 0.12)',
            color: isAdmin ? '#1976d2' : '#2e7d32',
            padding: '6px 16px',
            borderRadius: '16px',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            border: `1px solid ${isAdmin ? 'rgba(25, 118, 210, 0.24)' : 'rgba(46, 125, 50, 0.24)'}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '80px',
            height: '24px',
            lineHeight: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isAdmin ? 'rgba(25, 118, 210, 0.18)' : 'rgba(46, 125, 50, 0.18)',
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }
          }}>
            {params.value}
          </Box>
        );
      },
      align: 'center',
      headerAlign: 'center'
    }
  ], []);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            User Management
          </Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton 
                onClick={fetchUsers} 
                size="small" 
                sx={{ 
                  mr: 1,
                  '&:hover': { color: 'primary.main' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="small"
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Users Table */}
        <Paper 
          elevation={0}
          sx={{ 
            height: 650,
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              padding: '12px 16px',
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#ffffff',
              borderBottom: '2px solid #e0e0e0',
              '& .MuiDataGrid-columnHeader': {
                padding: '12px 16px',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                color: '#1a1a1a',
              },
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: '#fff',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#ffffff',
              '& .MuiTablePagination-root': {
                color: '#666666',
              },
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: '16px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e0e0e0',
              '& .MuiButton-root': {
                marginRight: '8px',
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#666666',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              },
              '& .MuiFormControl-root': {
                marginRight: '8px',
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                },
              },
            },
            '& .MuiCheckbox-root': {
              color: '#bbbbbb',
              '&.Mui-checked': {
                color: '#1976d2',
              },
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              '&:nth-of-type(odd)': {
                backgroundColor: '#fafafa',
              },
            },
          }}
        >
          <DataGrid
            rows={users}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            rowsPerPageOptions={[5, 10, 20, 50]}
            pagination
            components={{
              Toolbar: GridToolbar
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { 
                  debounceMs: 500,
                  sx: {
                    '& .MuiInputBase-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                    },
                  },
                },
                sx: {
                  '& .MuiButton-root': {
                    borderRadius: '8px',
                  },
                },
              },
            }}
            onRowClick={handleRowClick}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f0f7ff',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
            }}
            getRowHeight={() => 60}
            disableColumnMenu={false}
            disableColumnSelector={false}
            disableDensitySelector={false}
            disableExport={false}
          />
        </Paper>

        {/* User Details Dialog */}
        <Dialog 
          open={openDetailsDialog} 
          onClose={handleCloseDetailsDialog} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              User Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            {selectedUser && <UserDetailsContent user={selectedUser} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailsDialog}>Close</Button>
            <Button 
              onClick={() => {
                handleCloseDetailsDialog();
                handleOpenDialog(selectedUser);
              }} 
              startIcon={<EditIcon />}
              variant="contained"
              color="primary"
            >
              Edit
            </Button>
            <Button 
              onClick={() => {
                handleCloseDetailsDialog();
                handleDeleteUser(selectedUser.id);
              }}
              startIcon={<DeleteIcon />}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add/Edit User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ p: 2 }}>
            <Typography variant="h6" component="div">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <UserForm 
              formData={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}

export default Users; 
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ marginTop: 24 }}>
      {value === index && children}
    </div>
  );
};

const AccountManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState(null);
  const [createAccountForm, setCreateAccountForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    position: '',
  });
  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: '',
    employeeId: '',
  });

  const departments = [
    'CID (Curriculum Implementation Division)',
    'SGOD (School Governance and Operations Division)',
    'Administrative Office',
    'Finance',
    'ICT Unit',
    'Other'
  ];

  const positions = [
    'Teacher',
    'Principal',
    'Supervisor',
    'Administrative Officer',
    'IT Staff',
    'Other'
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage(null);
  };

  const handleCreateAccountChange = (e) => {
    const { name, value } = e.target;
    setCreateAccountForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPasswordChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      // This would normally make an API call
      console.log('Creating account with:', createAccountForm);
      setMessage({
        type: 'success',
        text: 'Account creation request submitted. Please wait for admin approval.',
      });
      // Reset form
      setCreateAccountForm({
        name: '',
        email: '',
        employeeId: '',
        department: '',
        position: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit account request. Please try again.',
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      // This would normally make an API call
      console.log('Resetting password for:', resetPasswordForm);
      setMessage({
        type: 'success',
        text: 'Password reset instructions have been sent to your email.',
      });
      // Reset form
      setResetPasswordForm({
        email: '',
        employeeId: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to request password reset. Please try again.',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Account Management
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Create Account" />
            <Tab label="Reset Password" />
          </Tabs>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleCreateAccount}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                required
                label="Full Name"
                name="name"
                value={createAccountForm.name}
                onChange={handleCreateAccountChange}
                variant="outlined"
                placeholder="Enter your full name"
              />
              <TextField
                required
                label="Email"
                name="email"
                type="email"
                value={createAccountForm.email}
                onChange={handleCreateAccountChange}
                variant="outlined"
                placeholder="Enter your email address"
              />
              <TextField
                required
                label="Employee ID"
                name="employeeId"
                value={createAccountForm.employeeId}
                onChange={handleCreateAccountChange}
                variant="outlined"
                placeholder="Enter your employee ID"
              />
              <FormControl required fullWidth>
                <InputLabel>Department/Section</InputLabel>
                <Select
                  name="department"
                  value={createAccountForm.department}
                  onChange={handleCreateAccountChange}
                  label="Department/Section"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl required fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  name="position"
                  value={createAccountForm.position}
                  onChange={handleCreateAccountChange}
                  label="Position"
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>
                      {pos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Submit Account Request
              </Button>
            </Box>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleResetPassword}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                required
                label="Email"
                name="email"
                type="email"
                value={resetPasswordForm.email}
                onChange={handleResetPasswordChange}
                variant="outlined"
                placeholder="Enter your email address"
              />
              <TextField
                required
                label="Employee ID"
                name="employeeId"
                value={resetPasswordForm.employeeId}
                onChange={handleResetPasswordChange}
                variant="outlined"
                placeholder="Enter your employee ID"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ mt: 2 }}
              >
                Request Password Reset
              </Button>
            </Box>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AccountManagement; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Settings = () => {
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Ticket Management System',
    allowGuestTickets: true,
    ticketExpiryDays: 30,
    defaultPriority: 'MEDIUM',
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    senderName: 'IT Support',
    senderEmail: '',
    enableNotifications: true,
  });

  // Category settings
  const [categorySettings, setcategorySettings] = useState({
    ticketCategories: [
      { id: 1, name: 'TROUBLESHOOTING', active: true },
      { id: 2, name: 'ACCOUNT_MANAGEMENT', active: true },
      { id: 3, name: 'DOCUMENT_UPLOAD', active: true },
    ]
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);

  // Load settings from backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        // Set the settings from the backend response
        setGeneralSettings(response.data.data.general);
        setEmailSettings(response.data.data.email);
        setcategorySettings(response.data.data.categories);
        
        setError(null);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      // Validate email settings if notifications are enabled
      if (emailSettings.enableNotifications) {
        const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'senderEmail'];
        const missingFields = requiredFields.filter(field => !emailSettings[field]);
        
        if (missingFields.length > 0) {
          setError(`Missing required email fields: ${missingFields.join(', ')}`);
          return;
        }
        
        // Gmail validation
        if (emailSettings.smtpHost.includes('gmail') && !emailSettings.smtpUser.includes('@')) {
          setError('Gmail username must be a complete email address');
          return;
        }
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const settings = {
        general: generalSettings,
        email: emailSettings,
        categories: categorySettings
      };

      const response = await axios.post(`${API_BASE_URL}/admin/settings`, settings, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        // Update localStorage with the latest category settings
        // This ensures the changes are immediately reflected in the UI
        localStorage.setItem('ticketCategories', JSON.stringify(categorySettings.ticketCategories));
        
        setSaveSuccess(true);
        setError(null);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      // Validate required fields before sending
      const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'senderEmail'];
      const missingFields = requiredFields.filter(field => !emailSettings[field]);
      
      if (missingFields.length > 0) {
        setEmailTestResult({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }
      
      // Gmail validation
      if (emailSettings.smtpHost.includes('gmail') && !emailSettings.smtpUser.includes('@')) {
        setEmailTestResult({
          success: false,
          message: 'Gmail username must be a complete email address'
        });
        return;
      }
      
      setTestingEmail(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/settings/test-email`, emailSettings, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        setEmailTestResult({
          success: true,
          message: 'Test email sent successfully!'
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Error testing email settings:', err);
      setEmailTestResult({
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to send test email'
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSwitchChange = (e) => {
    const { name, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleCategoryToggle = (id) => {
    setcategorySettings(prev => {
      const updatedCategories = prev.ticketCategories.map(category => 
        category.id === id 
          ? { ...category, active: !category.active } 
          : category
      );
      return {
        ...prev,
        ticketCategories: updatedCategories
      };
    });
  };

  const handleSnackbarClose = () => {
    setSaveSuccess(false);
    setEmailTestResult(null);
  };

  if (loading && !generalSettings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>System Settings</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="general-settings-content"
              id="general-settings-header"
            >
              <Typography variant="h6">General Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="System Name"
                    name="systemName"
                    value={generalSettings.systemName}
                    onChange={handleGeneralChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ticket Expiry (days)"
                    name="ticketExpiryDays"
                    type="number"
                    value={generalSettings.ticketExpiryDays}
                    onChange={handleGeneralChange}
                    margin="normal"
                    InputProps={{
                      inputProps: { min: 1, max: 365 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Default Priority</InputLabel>
                    <Select
                      name="defaultPriority"
                      value={generalSettings.defaultPriority}
                      label="Default Priority"
                      onChange={handleGeneralChange}
                    >
                      <MenuItem value="HIGH">High</MenuItem>
                      <MenuItem value="MEDIUM">Medium</MenuItem>
                      <MenuItem value="LOW">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generalSettings.allowGuestTickets}
                        onChange={handleSwitchChange}
                        name="allowGuestTickets"
                        color="primary"
                      />
                    }
                    label="Allow Guest Tickets"
                    sx={{ mt: 2 }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Email Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="email-settings-content"
              id="email-settings-header"
            >
              <Typography variant="h6">Email Notifications</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailSettings.enableNotifications}
                        onChange={handleEmailSwitchChange}
                        name="enableNotifications"
                        color="primary"
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                
                {emailSettings.enableNotifications && (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Gmail SMTP Settings Tips:</Typography>
                        <ul>
                          <li>Host: smtp.gmail.com</li>
                          <li>Port: 587</li>
                          <li>Username: Must be full email address (example@gmail.com)</li>
                          <li>For accounts with 2FA: Use an App Password (generate at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">Google Account Settings</a>)</li>
                          <li>Make sure "Less secure app access" is turned on if not using App Password</li>
                        </ul>
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="SMTP Host"
                        name="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={handleEmailChange}
                        margin="normal"
                        helperText={emailSettings.smtpHost.includes('gmail') ? "Using Gmail SMTP server" : ""}
                        error={!emailSettings.smtpHost}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="SMTP Port"
                        name="smtpPort"
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailChange}
                        margin="normal"
                        helperText={emailSettings.smtpHost.includes('gmail') ? "For Gmail, use 587 (TLS) or 465 (SSL)" : ""}
                        error={!emailSettings.smtpPort}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="SMTP Username"
                        name="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={handleEmailChange}
                        margin="normal"
                        helperText={emailSettings.smtpHost.includes('gmail') ? "Must be your full Gmail email address" : ""}
                        error={!emailSettings.smtpUser || (emailSettings.smtpHost.includes('gmail') && !emailSettings.smtpUser.includes('@'))}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="SMTP Password"
                        name="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailChange}
                        margin="normal"
                        helperText={emailSettings.smtpHost.includes('gmail') ? "Use App Password if you have 2FA enabled" : ""}
                        error={!emailSettings.smtpPassword}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Sender Name"
                        name="senderName"
                        value={emailSettings.senderName}
                        onChange={handleEmailChange}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Sender Email"
                        name="senderEmail"
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={handleEmailChange}
                        margin="normal"
                        error={!emailSettings.senderEmail}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={testEmailSettings}
                        disabled={testingEmail}
                        sx={{
                          position: 'relative',
                          minWidth: '180px',
                          height: '42px',
                        }}
                      >
                        {testingEmail ? (
                          <>
                            <CircularProgress 
                              size={24} 
                              sx={{
                                color: 'primary.main',
                                mr: 1
                              }}
                            />
                            Sending Email...
                          </>
                        ) : (
                          <>
                            <EmailIcon sx={{ mr: 1 }} />
                            Send Test Email
                          </>
                        )}
                      </Button>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        All fields marked with * are required before you can send a test email.
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        
        {/* Category Settings */}
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="category-settings-content"
              id="category-settings-header"
            >
              <Typography variant="h6">Ticket Categories</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary" paragraph>
                Enable or disable ticket categories shown to users on the ticket submission page
              </Typography>
              
              <Grid container spacing={2}>
                {categorySettings.ticketCategories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <Card sx={{ 
                      height: '100%', 
                      opacity: category.active ? 1 : 0.6,
                      transition: 'opacity 0.3s',
                      border: category.active ? '1px solid #4caf50' : '1px solid #ddd'
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {category.name.replace(/_/g, ' ')}
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={category.active}
                                onChange={() => handleCategoryToggle(category.id)}
                                name={`category-${category.id}`}
                                color="primary"
                              />
                            }
                            label={category.active ? "Enabled" : "Disabled"}
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          {category.active 
                            ? "This category is enabled and visible to users on the ticket submission page" 
                            : "This category is disabled and hidden from users on the ticket submission page"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={fetchSettings}
          disabled={loading}
          sx={{
            minWidth: '120px',
            height: '42px',
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'secondary.main' }} />
          ) : (
            <>
              <RefreshIcon sx={{ mr: 1 }} />
              Reset
            </>
          )}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={saveSettings}
          disabled={loading}
          sx={{
            minWidth: '150px',
            height: '42px',
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon sx={{ mr: 1 }} />
              Save Settings
            </>
          )}
        </Button>
      </Box>
      
      {/* Success Messages */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" variant="filled">
          Settings saved successfully!
        </Alert>
      </Snackbar>
      
      {/* Email Test Results */}
      <Snackbar
        open={emailTestResult !== null}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={emailTestResult?.success ? "success" : "error"}
          variant="filled"
        >
          {emailTestResult?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 
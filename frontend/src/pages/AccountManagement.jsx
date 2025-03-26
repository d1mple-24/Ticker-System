import React, { useState, useEffect, useCallback } from 'react';
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
  Backdrop,
} from '@mui/material';
import api from '../utils/api';
import BackButton from '../components/BackButton';

const AccountManagement = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: '',
    accountType: '',
    actionType: '',
    locationType: '',
    schoolLevel: '',
    schoolName: '',
    department: '',
    subject: '',
    message: '',
    captchaCode: ''
  });
  const [message, setMessage] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captcha, setCaptcha] = useState({ id: '', code: '' });
  const [captchaError, setCaptchaError] = useState(null);
  const [captchaDisabled, setCaptchaDisabled] = useState(false);

  const schools = {
    'Elementary': [
      'Alapan I Elementary School',
      'Alapan II Elementary School',
      'Anabu I Elementary School',
      'Anabu II Elementary School',
      'Bayan Luma I Elementary School',
      'Bayan Luma II Elementary School',
      'Buhay na Tubig Elementary School',
      'Buhay na Tubig Elementary School - Maharlika Annex',
      'Bukandala Elementary School',
      'Carsadang Bago Elementary School',
      'Cayetano Topacio Elementary School',
      'Estanislao Villanueva Elementaty School',
      'Imus Pilot Elementary School',
      'Malagasang I Elementary School',
      'Malagasang II Elementary School',
      'Malagasang III Elementary School',
      'Palico Elementary School',
      'Pasong Buaya I Elementary School',
      'Pasong Buaya II Elementary School',
      'Pasong Buaya III Elementary School',
      'Pasong Santol Elementary School',
      'Pasong Santol Elementary School - Golden City',
      'Tanzang Luma Elementary School',
      'Tinabunan Elementary School',
      'Toclong Elementary School'
    ],
    'Junior High School': [
      'Gen. Emilio Aguinaldo National High School',
      'Gen. Licerio Topacio National High School',
      'Gen. Tomas Mascardo High School',
      'Hipolito Saquilayan National High School',
      'Imus National High School'
    ],
    'Senior High School': [
      'Gen. Flaviano Yengko Senior High School',
      'Gen. Juan Castañeda Senior High School',
      'Gen. Pantaleon Garcia Senior High School',
      'Gov. Juanito Reyes Remulla Senior High School'
    ],
    'Integrated School': [
      'Anastacio Advincula Integrated School',
      'City of Imus Integrated School',
      'Francisca Benitez Integrated School',
      'Gov. D.M. Camerino Integrated School'
    ]
  };

  const departments = [
    'Office of the Schools Division Superintendent',
    'Curriculum Implementation Division',
    'School Governance and Operations Division',
    'School Management Monitoring and Evaluation Division',
    'Administrative Division',
    'Finance Division',
    'Human Resource Development Division',
    'Information and Communications Technology Division',
    'Legal Unit',
    'Records Unit',
    'Supply Unit',
    'Cashier Unit',
    'Property Unit',
    'General Services Unit',
    'Medical and Dental Unit',
    'Guidance and Counseling Unit',
    'Library Hub',
    'Learning Resource Management and Development System',
    'School Health and Nutrition Unit',
    'Special Education Unit',
    'Alternative Learning System Unit',
    'Youth Formation Unit',
    'Sports Unit',
    'School Sports Unit',
    'School Health and Nutrition Unit',
    'School Health and Nutrition Unit - Medical',
    'School Health and Nutrition Unit - Dental',
    'School Health and Nutrition Unit - Nursing',
    'School Health and Nutrition Unit - Nutrition',
    'School Health and Nutrition Unit - Physical Therapy',
    'School Health and Nutrition Unit - Occupational Therapy',
    'School Health and Nutrition Unit - Speech Therapy',
    'School Health and Nutrition Unit - Psychological Services',
    'School Health and Nutrition Unit - Social Work',
    'School Health and Nutrition Unit - Guidance and Counseling',
    'School Health and Nutrition Unit - Health Education',
    'School Health and Nutrition Unit - Physical Education',
    'School Health and Nutrition Unit - Sports',
    'School Health and Nutrition Unit - Recreation',
    'School Health and Nutrition Unit - Health Services',
    'School Health and Nutrition Unit - Dental Services',
    'School Health and Nutrition Unit - Medical Services',
    'School Health and Nutrition Unit - Nursing Services',
    'School Health and Nutrition Unit - Nutrition Services',
    'School Health and Nutrition Unit - Physical Therapy Services',
    'School Health and Nutrition Unit - Occupational Therapy Services',
    'School Health and Nutrition Unit - Speech Therapy Services',
    'School Health and Nutrition Unit - Psychological Services',
    'School Health and Nutrition Unit - Social Work Services',
    'School Health and Nutrition Unit - Guidance and Counseling Services',
    'School Health and Nutrition Unit - Health Education Services',
    'School Health and Nutrition Unit - Physical Education Services',
    'School Health and Nutrition Unit - Sports Services',
    'School Health and Nutrition Unit - Recreation Services'
  ];

  const generateCaptcha = useCallback(async (retryCount = 0) => {
    try {
      setCaptchaError(null);
      const response = await api.get('/tickets/generate-captcha');
      setCaptcha({
        id: response.data.captchaId,
        code: response.data.captchaCode
      });
      setCaptchaDisabled(false);
    } catch (error) {
      console.error('Error generating CAPTCHA:', error);
      const errorMessage = 'Unable to generate verification code. Please try again.';
      setCaptchaError(errorMessage);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId = null;
    
    const initCaptcha = async () => {
      if (mounted && !captcha.id) {
        try {
          await generateCaptcha();
        } catch (error) {
          console.error('Failed to initialize CAPTCHA:', error);
        }
      }
    };

    timeoutId = setTimeout(initCaptcha, 1000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [generateCaptcha, captcha.id]);

  const handleRefreshCaptcha = async () => {
    if (captchaDisabled) {
      return;
    }
    await generateCaptcha();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'locationType' && { schoolLevel: '', schoolName: '', department: '' }),
      ...(name === 'schoolLevel' && { schoolName: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setCaptchaError(null);

    try {
      // Validate CAPTCHA input
      if (!formData.captchaCode) {
        setMessage({ type: 'error', text: 'Please enter the verification code' });
        setIsSubmitting(false);
        return;
      }

      const response = await api.post('/tickets/account-management', {
        category: 'ACCOUNT_MANAGEMENT',
        name: formData.name,
        email: formData.email,
        priority: formData.priority,
        accountType: formData.accountType,
        actionType: formData.actionType,
        locationType: formData.locationType,
        schoolLevel: formData.schoolLevel,
        schoolName: formData.schoolName,
        department: formData.department,
        subject: formData.subject,
        message: formData.message,
        captchaId: captcha.id,
        captchaCode: formData.captchaCode
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
        locationType: '',
        schoolLevel: '',
        schoolName: '',
        department: '',
        subject: '',
        message: '',
        captchaCode: ''
      });

      // Generate new CAPTCHA after successful submission
      generateCaptcha();
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error.response?.data?.message || 'Unable to submit request. Please try again.';
      
      setMessage({
        type: 'error',
        text: errorMessage
      });

      // Generate new CAPTCHA on error
      generateCaptcha();
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
        border: '1px solid #bbdefb',
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)'
      }}>
        {isSubmitting && (
          <Backdrop
            sx={{
              position: 'absolute',
              color: '#fff',
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
            }}
            open={isSubmitting}
          >
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ mt: 2, color: 'text.primary', fontFamily: '"Lisu Bosa", serif' }}>
              Submitting your request...
            </Typography>
          </Backdrop>
        )}

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
                <MenuItem value="CREATE">Create Account</MenuItem>
                <MenuItem value="RESET">Reset Password</MenuItem>
              </Select>
            </FormControl>

            <FormControl required>
              <InputLabel>Location</InputLabel>
              <Select
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                label="Location"
                disabled={isSubmitting}
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="SDO">SDO - Imus City</MenuItem>
                <MenuItem value="SCHOOL">School - Imus City</MenuItem>
              </Select>
            </FormControl>

            {formData.locationType === 'SDO' && (
              <FormControl required className="full-width">
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  label="Department"
                  disabled={isSubmitting}
                  sx={{ fontSize: '0.9rem' }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: '60%'
                      },
                    },
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.locationType === 'SCHOOL' && (
              <FormControl required>
                <InputLabel>School Level</InputLabel>
                <Select
                  name="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={handleChange}
                  label="School Level"
                  disabled={isSubmitting}
                  sx={{ fontSize: '0.9rem' }}
                >
                  {Object.keys(schools).map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {formData.schoolLevel && (
              <FormControl required className="full-width">
                <InputLabel>School Name</InputLabel>
                <Select
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  label="School Name"
                  disabled={isSubmitting}
                  sx={{ fontSize: '0.9rem' }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: '60%'
                      },
                    },
                  }}
                >
                  {schools[formData.schoolLevel]?.map((school) => (
                    <MenuItem key={school} value={school}>
                      {school}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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

            {/* CAPTCHA Display */}
            <Box sx={{ 
              mt: 4, 
              mb: 4, 
              textAlign: 'center',
              width: '100%',
              gridColumn: '1 / -1'
            }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 3,
                  fontFamily: '"Lisu Bosa", serif',
                  position: 'relative',
                  display: 'inline-block',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2,
                  }
                }}
              >
                Spam Prevention
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
                Please enter the verification code below:
              </Typography>
              {captchaError && (
                <Alert severity="error" sx={{ mb: 3, maxWidth: '400px', margin: '0 auto' }}>
                  {captchaError}
                </Alert>
              )}
              <Box sx={{ 
                maxWidth: '400px', 
                margin: '0 auto',
                p: 3,
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.5em',
                    padding: '15px',
                    borderRadius: '4px',
                    userSelect: 'none',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    mb: 2
                  }}
                >
                  {captcha.code}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefreshCaptcha}
                  disabled={captchaDisabled || isSubmitting}
                  sx={{ 
                    mb: 3,
                    '&.Mui-disabled': {
                      color: 'text.secondary'
                    }
                  }}
                >
                  Refresh Code
                </Button>
                <TextField
                  fullWidth
                  label="Enter Verification Code"
                  variant="outlined"
                  value={formData.captchaCode}
                  onChange={(e) => setFormData({ ...formData, captchaCode: e.target.value })}
                  required
                  error={!!captchaError}
                  helperText={captchaError}
                  disabled={isSubmitting}
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      letterSpacing: '0.2em'
                    }
                  }}
                />
              </Box>
            </Box>

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
                backgroundColor: '#1976d2',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                  Submitting Request...
                </Box>
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
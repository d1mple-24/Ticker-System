import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Alert,
  IconButton,
  CircularProgress,
  Box
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MENU_PROPS = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 'auto',
      overflowX: 'hidden'
    }
  }
};

const TechnicalAssistance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // Schools data
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

  // SDO Departments
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
    'School Sports Unit'
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: '',
    taType: '',
    location: '',
    schoolLevel: '',
    schoolName: '',
    department: '',
    subject: '',
    message: ''
  });

  const generateNewCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/generate-captcha`);
      if (response.data.success) {
        setCaptchaId(response.data.captchaId);
        setCaptchaCode(response.data.captchaCode);
      } else {
        setError('Failed to generate CAPTCHA');
      }
    } catch (err) {
      setError('Error generating CAPTCHA');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      ...(name === 'location' && {
        schoolLevel: '',
        schoolName: '',
        department: ''
      }),
      ...(name === 'schoolLevel' && {
        schoolName: ''
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!userCaptcha) {
      setError('Please enter the CAPTCHA code');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/technical-assistance`, {
        ...formData,
        category: 'TECHNICAL_ASSISTANCE',
        captchaId,
        captchaCode: userCaptcha
      });

      if (response.data.success) {
        setSuccess(
          <div>
            <Typography variant="body1" gutterBottom>
              Ticket created successfully!
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ticket ID: #{response.data.ticketId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tracking ID: {response.data.trackingId}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
              Please save these details for future reference.
            </Typography>
          </div>
        );
        
        setFormData({
          name: '',
          email: '',
          priority: '',
          taType: '',
          location: '',
          schoolLevel: '',
          schoolName: '',
          department: '',
          subject: '',
          message: ''
        });
        setUserCaptcha('');
        generateNewCaptcha();
      } else {
        setError(response.data.message || 'Failed to create ticket');
        generateNewCaptcha();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating the ticket';
      if (err.response?.status === 429) {
        const rateLimitInfo = err.response.data.rateLimitInfo;
        setError(
          <div>
            <Typography variant="body1" color="error" gutterBottom>
              {errorMessage}
            </Typography>
            {rateLimitInfo && (
              <Typography variant="body2" color="error">
                Please wait {rateLimitInfo.cooldownMinutes} minutes before trying again.
                Remaining attempts: {rateLimitInfo.remainingAttempts}
              </Typography>
            )}
          </div>
        );
      } else {
        setError(errorMessage);
      }
      generateNewCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <IconButton
        onClick={() => navigate('/tickets')}
        sx={{ position: 'absolute', top: 24, left: 24 }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontFamily: '"Lisu Bosa", serif' }}>
          Technical Assistance Request
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                  MenuProps={MENU_PROPS}
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>TA Type</InputLabel>
                <Select
                  name="taType"
                  value={formData.taType}
                  onChange={handleChange}
                  label="TA Type"
                  MenuProps={MENU_PROPS}
                >
                  <MenuItem value="DCP_MONITORING">DCP Monitoring</MenuItem>
                  <MenuItem value="AV_ASSISTANCE">AV Assistance</MenuItem>
                  <MenuItem value="ICT_TUTORIAL">ICT Tutorial</MenuItem>
                  <MenuItem value="ICT_ASSISTANCE">ICT Assistance</MenuItem>
                  <MenuItem value="ID_PRINTING">ID Printing</MenuItem>
                  <MenuItem value="BIOMETRICS_ENROLLMENT">BIOMETRICS Enrollment</MenuItem>
                  <MenuItem value="ICT_EQUIPMENT_INSPECTION">ICT Equipment Inspection</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  label="Location"
                  MenuProps={MENU_PROPS}
                >
                  <MenuItem value="SDO_IMUS_CITY">SDO - Imus City</MenuItem>
                  <MenuItem value="SCHOOL_IMUS_CITY">School - Imus City</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.location === 'SCHOOL_IMUS_CITY' && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>School Level</InputLabel>
                    <Select
                      name="schoolLevel"
                      value={formData.schoolLevel}
                      onChange={handleChange}
                      label="School Level"
                      MenuProps={MENU_PROPS}
                    >
                      {Object.keys(schools).map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {formData.schoolLevel && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>School Name</InputLabel>
                      <Select
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleChange}
                        label="School Name"
                        MenuProps={MENU_PROPS}
                      >
                        {schools[formData.schoolLevel].map((school) => (
                          <MenuItem key={school} value={school}>
                            {school}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </>
            )}

            {formData.location === 'SDO_IMUS_CITY' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Department"
                    MenuProps={MENU_PROPS}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Message"
                name="message"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                mt: 4, 
                mb: 4, 
                textAlign: 'center',
                width: '100%'
              }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    color: 'primary.main',
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
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                    }
                  }}
                >
                  Spam Prevention
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
                  Please enter the verification code below:
                </Typography>
                
                <Box sx={{ 
                  maxWidth: '400px', 
                  margin: '0 auto',
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  {loadingCaptcha ? (
                    <CircularProgress size={24} />
                  ) : (
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
                      {captchaCode}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={generateNewCaptcha}
                    disabled={loadingCaptcha}
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
                    value={userCaptcha}
                    onChange={(e) => setUserCaptcha(e.target.value)}
                    required
                    disabled={loading}
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
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#115293'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Request'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TechnicalAssistance; 
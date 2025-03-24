import React, { useState } from 'react';
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
} from '@mui/material';
import axios from 'axios';
import BackButton from '../components/BackButton';

const DocumentUpload = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    priority: 'MEDIUM',
    locationType: '',
    schoolLevel: '',
    schoolName: '',
    subject: '',
    message: '',
    file: null
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'locationType' && { schoolLevel: '', schoolName: '' }),
      ...(name === 'schoolLevel' && { schoolName: '' })
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size exceeds the 2MB limit. Please choose a smaller file.'
        });
        e.target.value = ''; // Reset file input
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        setMessage({
          type: 'error',
          text: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.'
        });
        e.target.value = ''; // Reset file input
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setMessage(null); // Clear any error messages
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.locationType || !formData.subject || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Validate school selection if school location is selected
      if (formData.locationType === 'SCHOOL' && !formData.schoolName) {
        throw new Error('Please select a school');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('category', 'DOCUMENT_UPLOAD');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('location', formData.locationType === 'SCHOOL' ? formData.schoolName : 'SDO - Imus City');
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await axios.post(
        'http://localhost:5000/api/tickets/document-upload',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { ticketId, trackingId } = response.data;
      setTicketInfo({ ticketId, trackingId });

      setMessage({
        type: 'success',
        text: `Document upload request submitted successfully! Your Ticket ID is #${ticketId} and Tracking ID is ${trackingId}. Please save these for future reference. An email has been sent to ${formData.email} with your ticket details.`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        priority: 'MEDIUM',
        locationType: '',
        schoolLevel: '',
        schoolName: '',
        subject: '',
        message: '',
        file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to submit request. Please try again.',
      });
    } finally {
      setLoading(false);
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
          Document Upload Request
      </Typography>
      </Box>

      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        bgcolor: '#ffffff',
      }}>
        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
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
              sx={{ '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
            />

            <FormControl required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Priority"
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl required>
              <InputLabel>Location</InputLabel>
              <Select
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                label="Location"
                sx={{ fontSize: '0.9rem' }}
              >
                <MenuItem value="SDO">SDO - Imus City</MenuItem>
                <MenuItem value="SCHOOL">School - Imus City</MenuItem>
              </Select>
            </FormControl>

            {formData.locationType === 'SCHOOL' && (
              <FormControl required>
                <InputLabel>School Level</InputLabel>
                <Select
                  name="schoolLevel"
                  value={formData.schoolLevel}
                  onChange={handleChange}
                  label="School Level"
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
              className="full-width"
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
              className="full-width"
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                } 
              }}
            />

            <FormControl className="full-width">
              <input
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                  }}
                >
                  Upload Document (PDF, DOC, DOCX)
                </Button>
              </label>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Selected file: {formData.file.name}
                </Typography>
              )}
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              className="full-width"
              sx={{
                mt: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Submit Document Upload Request'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default DocumentUpload; 
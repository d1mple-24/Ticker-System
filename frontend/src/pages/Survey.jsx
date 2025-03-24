import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Alert,
  useTheme,
  Grid,
  Stepper,
  Step,
  StepLabel,
  MobileStepper,
  useMediaQuery,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import axios from 'axios';
import BackButton from '../components/BackButton';

const Survey = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    ticketNumber: '',
    serviceQuality: '5',
    responseTime: '5',
    technicalKnowledge: '5',
    communication: '5',
    systemUsability: '5',
    systemReliability: '5',
    ticketProcess: '5',
    interfaceDesign: '5',
    notificationSystem: '5',
    documentationClarity: '5',
    recommendService: 'yes',
    comments: '',
    suggestedFeatures: '',
    technicalIssues: '',
  });
  const [message, setMessage] = useState(null);

  const steps = [
    'Ticket Information',
    'Service Evaluation',
    'System Evaluation',
    'Additional Feedback'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/survey/submit', formData);
      setMessage({
        type: 'success',
        text: 'Thank you for your feedback! Your response has been submitted successfully.'
      });
      setFormData({
        ticketNumber: '',
        serviceQuality: '5',
        responseTime: '5',
        technicalKnowledge: '5',
        communication: '5',
        systemUsability: '5',
        systemReliability: '5',
        ticketProcess: '5',
        interfaceDesign: '5',
        notificationSystem: '5',
        documentationClarity: '5',
        recommendService: 'yes',
        comments: '',
        suggestedFeatures: '',
        technicalIssues: '',
      });
      setActiveStep(0);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to submit survey. Please try again.'
      });
    }
  };

  const ratingOptions = [
    { value: '5', label: 'Excellent' },
    { value: '4', label: 'Good' },
    { value: '3', label: 'Average' },
    { value: '2', label: 'Fair' },
    { value: '1', label: 'Poor' },
  ];

  const renderRatingGroup = (name, label) => (
    <FormControl component="fieldset" sx={{ width: '100%', mb: 2 }}>
      <FormLabel component="legend" sx={{ 
        mb: 1.5, 
        fontWeight: 500,
        color: 'text.primary' 
      }}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        name={name}
        value={formData[name]}
        onChange={handleChange}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 1,
        }}
      >
        {ratingOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={
              <Radio 
                sx={{
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
            }
            label={option.label}
            sx={{ 
              margin: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
                color: 'text.secondary'
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 1
              }
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
              Ticket Information
            </Typography>
            <TextField
              required
              label="Ticket Number"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
              Service Evaluation
            </Typography>
            <Grid container spacing={3}>
              {renderRatingGroup('serviceQuality', 'Overall Service Quality')}
              {renderRatingGroup('responseTime', 'Response Time to Tickets')}
              {renderRatingGroup('technicalKnowledge', 'Technical Support Knowledge')}
              {renderRatingGroup('communication', 'Communication Clarity')}
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
              System Evaluation
            </Typography>
            <Grid container spacing={3}>
              {renderRatingGroup('systemUsability', 'System Ease of Use')}
              {renderRatingGroup('systemReliability', 'System Reliability')}
              {renderRatingGroup('ticketProcess', 'Ticket Creation Process')}
              {renderRatingGroup('interfaceDesign', 'User Interface Design')}
              {renderRatingGroup('notificationSystem', 'Notification System')}
              {renderRatingGroup('documentationClarity', 'Help Documentation Clarity')}
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 3 }}>
              Additional Feedback
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ color: 'text.primary', mb: 1 }}>
                Would you recommend our IT support service to others?
              </FormLabel>
              <RadioGroup
                row
                name="recommendService"
                value={formData.recommendService}
                onChange={handleChange}
                sx={{ 
                  mt: 1,
                  justifyContent: 'space-around',
                  p: 1,
                  borderRadius: 1
                }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="maybe" control={<Radio />} label="Maybe" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="What features would you like to see added to the system?"
              name="suggestedFeatures"
              value={formData.suggestedFeatures}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
              placeholder="Please share your suggestions for new features..."
            />

            <TextField
              label="Did you encounter any technical issues while using the system?"
              name="technicalIssues"
              value={formData.technicalIssues}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 3 }}
              placeholder="Please describe any technical issues you experienced..."
            />

            <TextField
              label="Additional Comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              placeholder="Please share any additional feedback or suggestions for improvement..."
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1565C0 0%, #0288d1 100%)',
        pt: 4,
        pb: 6,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative' }}>
        <BackButton />
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          '& h4': {
            color: '#fff',
            fontWeight: 600,
            position: 'relative',
            display: 'inline-block',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: 4,
              backgroundColor: '#fff',
              borderRadius: 2,
            }
          }
        }}>
          <Box
            component="img"
            src={process.env.PUBLIC_URL + '/deped-logo.png'}
            alt="DepEd Logo"
            sx={{
              width: 100,
              height: 100,
              display: 'block',
              margin: '0 auto',
              mb: 3,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
          
          <Typography variant="h4" gutterBottom>
            Client Satisfaction Survey
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Help us improve our IT support services and system
          </Typography>
        </Box>

        <Paper elevation={4} sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          bgcolor: '#ffffff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}>
          {message && (
            <Alert 
              severity={message.type} 
              sx={{ mb: 3, borderRadius: 1 }}
            >
              {message.text}
            </Alert>
          )}

          {!isMobile && (
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {getStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<KeyboardArrowLeft />}
                  sx={{
                    visibility: activeStep === 0 ? 'hidden' : 'visible',
                  }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={activeStep !== steps.length - 1 && <KeyboardArrowRight />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    background: 'linear-gradient(45deg, #1565C0 30%, #0288d1 90%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0288d1 30%, #1565C0 90%)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                </Button>
              </Box>
            </Box>
          </form>

          {isMobile && (
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{ 
                mt: 3,
                background: 'transparent',
                '& .MuiMobileStepper-dot': {
                  width: 8,
                  height: 8,
                },
                '& .MuiMobileStepper-dotActive': {
                  backgroundColor: theme.palette.primary.main,
                }
              }}
              nextButton={<div />}
              backButton={<div />}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Survey; 
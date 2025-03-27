import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ComputerRounded as ComputerIcon,
  ManageAccounts as ManageAccountsIcon,
  UploadFile as UploadFileIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TicketCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Predefined category data
  const categoryData = {
    'TROUBLESHOOTING': {
      title: 'Troubleshooting',
      description: 'Report technical issues with computers, printers, or other equipment',
      icon: <ComputerIcon sx={{ fontSize: 40 }} />,
      path: '/troubleshooting',
      color: '51d736'
    },
    'ACCOUNT_MANAGEMENT': {
      title: 'Account Management',
      description: 'Request new accounts, reset passwords, or modify existing accounts',
      icon: <ManageAccountsIcon sx={{ fontSize: 40 }} />,
      path: '/account',
      color: '#4caf50'
    },
    'DOCUMENT_UPLOAD': {
      title: 'Document Upload',
      description: 'Submit documents for processing or approval',
      icon: <UploadFileIcon sx={{ fontSize: 40 }} />,
      path: '/documents',
      color: '#ff9800'
    },
    'TECHNICAL_ASSISTANCE': {
      title: 'Technical Assistance',
      description: 'Request technical support for DCP, AV, ICT tutorials, and more',
      icon: <ComputerIcon sx={{ fontSize: 40 }} />,
      path: '/technical-assistance',
      color: '#2196f3'
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch all categories from settings API
        const response = await axios.get(`${API_BASE_URL}/settings/categories`);
        
        if (response.data.success) {
          // Ensure all categories are included with proper order
          const allCategories = [
            { id: 1, name: 'TROUBLESHOOTING', active: true },
            { id: 2, name: 'ACCOUNT_MANAGEMENT', active: true },
            { id: 3, name: 'DOCUMENT_UPLOAD', active: true },
            { id: 4, name: 'TECHNICAL_ASSISTANCE', active: true }
          ];
          setCategories(allCategories);
          setError(null);
          localStorage.setItem('ticketCategories', JSON.stringify(allCategories));
        } else {
          throw new Error(response.data.message || 'Failed to load categories');
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Unable to load ticket categories. Please try again later.');
        // Fallback categories with Technical Assistance
        const fallbackCategories = [
          { id: 1, name: 'TROUBLESHOOTING', active: true },
          { id: 2, name: 'ACCOUNT_MANAGEMENT', active: true },
          { id: 3, name: 'DOCUMENT_UPLOAD', active: true },
          { id: 4, name: 'TECHNICAL_ASSISTANCE', active: true }
        ];
        setCategories(fallbackCategories);
        localStorage.setItem('ticketCategories', JSON.stringify(fallbackCategories));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const ServiceCard = ({ title, description, icon, path, color, isActive }) => (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: isActive ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
        opacity: isActive ? 1 : 0.85,
        backgroundColor: isActive ? '#fcf8f0' : '#f7f1e6',
        borderTop: isActive ? 'none' : '3px solid #e57373',
        border: isActive ? '1px solid #bbdefb' : '1px solid #ddd',
        '&:hover': isActive ? {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 16px rgba(25, 118, 210, 0.15)',
          borderColor: '#1976d2',
          '&::before': {
            opacity: 0.1,
          },
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isActive ? '#1976d2' : color,
          opacity: isActive ? 0.05 : 0,
          transition: 'opacity 0.3s',
        },
      }}
      onClick={() => isActive && navigate(path)}
    >
      {!isActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            py: 0.5,
            bgcolor: 'rgba(100, 100, 100, 0.75)',
            color: 'white',
            textAlign: 'center',
            fontSize: '0.85rem',
            fontWeight: 'medium',
            zIndex: 2
          }}
        >
          This category is currently disabled
        </Box>
      )}
      <Box
        sx={{
          bgcolor: isActive ? '#1976d2' : '#bdbdbd',
          borderRadius: '50%',
          p: 2,
          mb: 2,
          color: 'white',
          position: 'relative',
          transition: 'all 0.3s',
          boxShadow: isActive ? '0 4px 8px rgba(25, 118, 210, 0.25)' : 'none',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom align="center" color={isActive ? 'textPrimary' : 'text.secondary'}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {isActive ? description : "This feature is temporarily unavailable"}
      </Typography>
    </Paper>
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If no categories are available, show a message
  if (categories.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{ position: 'absolute', top: 24, left: 24 }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Ticket categories are not available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Our ticket submission system cannot load the categories. Please try again later or contact support directly.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{ position: 'absolute', top: 24, left: 24 }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, fontFamily: '"Lisu Bosa", serif', color: 'black' }}>
          Submit a Ticket
        </Typography>
        <Typography variant="subtitle1" color="black" sx={{ fontFamily: '"Lisu Bosa", serif', opacity: 0.85 }}>
          Choose the category that best matches your request
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Service Categories */}
      <Grid container spacing={4}>
        {categories.map((category) => {
          const data = categoryData[category.name];
          if (!data) return null;
          
          return (
            <Grid item xs={12} sm={6} md={6} key={category.id}>
              <ServiceCard
                title={data.title}
                description={data.description}
                icon={data.icon}
                path={data.path}
                color={data.color}
                isActive={category.active}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#1976d2', fontFamily: '"Lisu Bosa", serif' }}>
          Need help choosing? Contact our support team
        </Typography>
      </Box>
    </Container>
  );
};

export default TicketCategories; 
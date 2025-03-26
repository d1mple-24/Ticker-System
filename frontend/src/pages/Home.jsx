import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  ListAlt as ListIcon,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  const ServiceCard = ({ title, description, icon, onClick }) => (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        backgroundColor: '#fcf8f0',
        border: '1px solid #e0d2b8',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 16px rgba(139, 109, 55, 0.15)',
          borderColor: '#d4b577',
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          bgcolor: '#1976d2',
          borderRadius: '50%',
          p: 2,
          mb: 3,
          color: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }}
      >
        {icon}
      </Box>
      <Typography 
        variant="h5" 
        gutterBottom 
        align="center" 
        sx={{ 
          fontWeight: 600,
          fontFamily: '"Lisu Bosa", serif',
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        align="center"
        sx={{ 
          fontFamily: '"Lisu Bosa", serif',
        }}
      >
        {description}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          py: 2, 
          px: 3, 
          bgcolor: '#1976d2',
          color: '#fff',
          borderRadius: 0,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          maxWidth: 1200,
          mx: 'auto',
          gap: 2,
          color: "#5c3d11"
        }}>
          <img 
            src={process.env.PUBLIC_URL + '/deped-logo.png'} 
            alt="DepEd Logo" 
            style={{ height: 60 }}
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              fontFamily: '"Lisu Bosa", serif',
              color: "white"
            }}
          >
            Division of Imus
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontFamily: '"Lisu Bosa", serif',
            }}
          >
            Hello, how can we help?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              fontFamily: '"Lisu Bosa", serif',
            }}
          >
            Division of Imus City
          </Typography>
        </Box>

        {/* Service Options */}
        <Grid container spacing={4} maxWidth="md" sx={{ mx: 'auto' }}>
          <Grid item xs={12} md={6}>
            <ServiceCard
              title="Submit a ticket"
              description="Submit a new issue to a department"
              icon={<AddIcon sx={{ fontSize: 40 }} />}
              onClick={() => navigate('/tickets')}
            />
          </Grid> 
          <Grid item xs={12} md={6}>
            <ServiceCard
              title="View existing tickets"
              description="View tickets you submitted in the past"
              icon={<ListIcon sx={{ fontSize: 40 }} />}
              onClick={() => navigate('/track-ticket')}
            />
          </Grid>
        </Grid>

        {/* Admin Panel Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => navigate('/login')}
          >
            Go to Administration Panel
          </Typography>
        </Box>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3,
          textAlign: 'center',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          bgcolor: 'white',
          borderTop: '1px solidrgb(250, 250, 250)',
          color: '#5c3d11',
          boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="body2" 
          color="inherit"
          sx={{ 
            fontFamily: '"Lisu Bosa", serif',
          }}
        >
          © {new Date().getFullYear()} DepEd Imus Division | ictcaa
        </Typography>
      </Box>
    </Box>
  );
};

export default Home; 
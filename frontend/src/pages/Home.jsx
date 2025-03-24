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
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 6,
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          borderRadius: '50%',
          p: 2,
          mb: 3,
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center">
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
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 0,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          maxWidth: 1200,
          mx: 'auto',
          gap: 2
        }}>
          <img 
            src={process.env.PUBLIC_URL + '/deped-logo.png'} 
            alt="DepEd Logo" 
            style={{ height: 40 }}
          />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Service Desk
          </Typography>
        </Box>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Welcome Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
            Hello, how can we help?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
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
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} DepEd Imus Division | ictcaa
        </Typography>
      </Box>
    </Box>
  );
};

export default Home; 
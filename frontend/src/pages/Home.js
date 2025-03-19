import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ComputerRounded as ComputerIcon,
  ManageAccounts as ManageAccountsIcon,
  UploadFile as UploadFileIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const ServiceButton = ({ title, description, icon, onClick, disabled }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-5px)',
        },
      }}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {description}
      </Typography>
      {disabled && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          Login required
        </Typography>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2">
              Welcome, {user?.name || 'User'}
            </Typography>
            <IconButton onClick={handleLogout} color="inherit" title="Logout">
              <LogoutIcon />
            </IconButton>
          </Box>
        ) : (
          <IconButton
            onClick={() => navigate('/login')}
            color="inherit"
            title="Login"
          >
            <LoginIcon />
          </IconButton>
        )}
      </Box>

      <Box
        component="img"
        src={process.env.PUBLIC_URL + '/deped-logo.png'}
        alt="DepEd Logo"
        sx={{
          width: 120,
          height: 120,
          display: 'block',
          margin: '0 auto',
          mb: 4,
        }}
      />

      <Typography variant="h4" align="center" gutterBottom>
        TICKETING SYSTEM
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 6 }}>
        Division of Imus City
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ServiceButton
            title="Troubleshooting"
            description="Submit technical issues and get support"
            icon={<ComputerIcon sx={{ fontSize: 40 }} />}
            onClick={() => navigate('/troubleshooting')}
            disabled={!isAuthenticated}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceButton
            title="Account Management"
            description="Manage your account settings and preferences"
            icon={<ManageAccountsIcon sx={{ fontSize: 40 }} />}
            onClick={() => navigate('/account')}
            disabled={!isAuthenticated}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceButton
            title="Upload Documents"
            description="Upload and manage your documents"
            icon={<UploadFileIcon sx={{ fontSize: 40 }} />}
            onClick={() => navigate('/documents')}
            disabled={!isAuthenticated}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/survey')}
          sx={{ mt: 4 }}
        >
          CLIENT SATISFACTION SURVEY
        </Button>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 4 }}
      >
        © DepEd Imus Division | 2025
      </Typography>
    </Container>
  );
}

export default Home; 
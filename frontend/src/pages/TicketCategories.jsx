import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
} from '@mui/material';
import {
  ComputerRounded as ComputerIcon,
  ManageAccounts as ManageAccountsIcon,
  UploadFile as UploadFileIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const TicketCategories = () => {
  const navigate = useNavigate();

  const ServiceCard = ({ title, description, icon, path, color }) => (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          '&::before': {
            opacity: 0.1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: color,
          opacity: 0.05,
          transition: 'opacity 0.3s',
        },
      }}
      onClick={() => navigate(path)}
    >
      <Box
        sx={{
          bgcolor: color,
          borderRadius: '50%',
          p: 2,
          mb: 2,
          color: 'white',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {description}
      </Typography>
    </Paper>
  );

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
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Submit a Ticket
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Choose the category that best matches your request
        </Typography>
      </Box>

      {/* Service Categories */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ServiceCard
            title="Troubleshooting"
            description="Report technical issues with computers, printers, or other equipment"
            icon={<ComputerIcon sx={{ fontSize: 40 }} />}
            path="/troubleshooting"
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceCard
            title="Account Management"
            description="Request new accounts, reset passwords, or modify existing accounts"
            icon={<ManageAccountsIcon sx={{ fontSize: 40 }} />}
            path="/account"
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ServiceCard
            title="Document Upload"
            description="Submit documents for processing or approval"
            icon={<UploadFileIcon sx={{ fontSize: 40 }} />}
            path="/documents"
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Need help choosing? Contact our support team
        </Typography>
      </Box>
    </Container>
  );
};

export default TicketCategories; 
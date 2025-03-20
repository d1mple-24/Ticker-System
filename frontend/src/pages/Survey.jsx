import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Survey = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
        Client Satisfaction Survey
      </Typography>
      <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
        Help us improve our services
      </Typography>

      {/* Survey form will be added here */}
      <Typography variant="body1" align="center">
        Survey form coming soon...
      </Typography>
    </Container>
  );
};

export default Survey; 
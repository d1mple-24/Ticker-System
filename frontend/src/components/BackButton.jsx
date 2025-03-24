import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip, Box } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
      <Tooltip title="Go back">
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BackButton; 
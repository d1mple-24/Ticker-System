import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountCircle as AccountCircleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error when user types
  };

  const getDepartmentBase = (department) => {
    if (department.includes('Administrative Services')) return 'Administrative Services';
    if (department.includes('Finance Services')) return 'Finance Services';
    if (department.includes('Curriculum Implementation Division')) return 'Curriculum Implementation Division (CID)';
    if (department.includes('School Governance and Operations Division')) return 'School Governance and Operations Division (SGOD)';
    return department;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role and department
      if (data.user.role === 'ADMIN') {
        navigate('/admin/tickets');
      } else {
        // For regular users, store their department base for filtering
        localStorage.setItem('departmentBase', getDepartmentBase(data.user.department));
        navigate('/my-tickets');
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
    }}>
      <Paper elevation={1} sx={{ 
        p: 4, 
        width: '100%', 
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <Box
          component="img"
          src={process.env.PUBLIC_URL + '/deped-logo.png'}
          alt="DepEd Logo"
          sx={{
            width: 100,
            height: 100,
            mb: 3,
          }}
        />

        <Typography variant="h5" align="center" gutterBottom>
          TICKETING SYSTEM
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{ mb: 2 }}
          >
            LOGIN
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#303f9f',
              color: 'white',
              '&:hover': {
                backgroundColor: '#283593',
              },
            }}
          >
            CLIENT SATISFACTION SURVEY
          </Button>
        </Box>
      </Paper>

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
};

export default Login; 
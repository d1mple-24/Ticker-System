import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  CheckCircle as ResolvedIcon,
  Error as PendingIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  Build as TroubleshootingIcon,
  AccountCircle as AccountIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CATEGORY_COLORS = {
  TROUBLESHOOTING: '#1976d2',
  ACCOUNT_MANAGEMENT: '#ed6c02',
  DOCUMENT_UPLOAD: '#2e7d32'
};

const STATUS_COLORS = {
  PENDING: '#ed6c02',
  IN_PROGRESS: '#1976d2',
  RESOLVED: '#2e7d32',
  CLOSED: '#757575'
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card 
    sx={{ 
      height: '100%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      },
    }}
  >
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          bgcolor: `${color}15`, 
          p: 1, 
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 1
        }}>
          {React.cloneElement(icon, { sx: { color: color, fontSize: '1.5rem' } })}
        </Box>
        <Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography variant="h4" sx={{ color: color, fontWeight: 600 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    inProgressTickets: 0,
    closedTickets: 0,
    categoryDistribution: [],
    statusDistribution: [],
    categoryStats: {
      TROUBLESHOOTING: 0,
      ACCOUNT_MANAGEMENT: 0,
      DOCUMENT_UPLOAD: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Dashboard Overview
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={fetchData} 
                size="small" 
                sx={{ mr: 1 }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<ViewListIcon />}
              onClick={() => navigate('/admin/tickets')}
              size="small"
            >
              View All Tickets
            </Button>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tickets"
              value={data.totalTickets}
              icon={<TicketIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={data.pendingTickets}
              icon={<PendingIcon />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Resolved"
              value={data.resolvedTickets}
              icon={<ResolvedIcon />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Progress"
              value={data.inProgressTickets}
              icon={<TicketIcon />}
              color="#0288d1"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Troubleshooting"
              value={data.categoryStats.TROUBLESHOOTING}
              icon={<TroubleshootingIcon />}
              color={CATEGORY_COLORS.TROUBLESHOOTING}
              subtitle="Technical support tickets"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Account Management"
              value={data.categoryStats.ACCOUNT_MANAGEMENT}
              icon={<AccountIcon />}
              color={CATEGORY_COLORS.ACCOUNT_MANAGEMENT}
              subtitle="Account-related requests"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Document Upload"
              value={data.categoryStats.DOCUMENT_UPLOAD}
              icon={<DocumentIcon />}
              color={CATEGORY_COLORS.DOCUMENT_UPLOAD}
              subtitle="Document processing requests"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '400px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={data.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {data.statusDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status] || '#757575'} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '400px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Category Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.categoryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Tickets">
                    {data.categoryDistribution?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[entry.category] || '#757575'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

export default Dashboard; 
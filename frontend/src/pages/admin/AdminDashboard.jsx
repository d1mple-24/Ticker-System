import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  CheckCircle as ResolvedIcon,
  Error as PendingIcon,
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import AdminLayout from '../../components/AdminLayout';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', { headers });
      setStats(statsResponse.data);

      const ticketsResponse = await axios.get('http://localhost:5000/api/tickets?limit=5', { headers });
      setRecentTickets(ticketsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
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
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ color: color, fontWeight: 600 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  // Prepare data for charts
  const prepareTicketStatusData = () => {
    const statusCounts = {
      'PENDING': 0,
      'IN_PROGRESS': 0,
      'RESOLVED': 0,
      'CLOSED': 0,
    };

    recentTickets.forEach(ticket => {
      if (ticket.status) {
        statusCounts[ticket.status.toUpperCase()] = (statusCounts[ticket.status.toUpperCase()] || 0) + 1;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  };

  const prepareTicketTimelineData = () => {
    const sortedTickets = [...recentTickets].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    return sortedTickets.map(ticket => ({
      date: new Date(ticket.createdAt).toLocaleDateString(),
      id: ticket.id,
      status: ticket.status,
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Dashboard Overview
          </Typography>
          <Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchDashboardData} size="small" sx={{ mr: 1 }}>
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

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Tickets"
              value={stats.totalTickets}
              icon={<TicketIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Pending Tickets"
              value={stats.pendingTickets}
              icon={<PendingIcon />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Resolved Tickets"
              value={stats.resolvedTickets}
              icon={<ResolvedIcon />}
              color="#2e7d32"
            />
          </Grid>
        </Grid>

        {/* Ticket Charts */}
        <Grid container spacing={2}>
          {/* Status Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: 2,
                height: '400px'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ticket Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={prepareTicketStatusData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="#1976d2" 
                    name="Number of Tickets"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Timeline Chart */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: 2,
                height: '400px'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Ticket Timeline
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={prepareTicketTimelineData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="id" 
                    stroke="#1976d2" 
                    name="Ticket ID"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboard;   
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  Person as UserIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const expandedWidth = 240;
const collapsedWidth = 65;

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Manage Tickets', icon: <TicketIcon />, path: '/admin/tickets' },
    { text: 'User Management', icon: <UserIcon />, path: '/admin/users' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const drawer = (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#1976d2',
      position: 'relative',
    }}>
      {/* Toggle Button */}
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: '#fff',
          width: 20,
          height: 40,
          borderRadius: '0 4px 4px 0',
          boxShadow: '4px 0 8px rgba(0,0,0,0.1)',
          zIndex: 1,
          '&:hover': {
            bgcolor: '#f5f5f5',
          },
          '& .MuiSvgIcon-root': {
            fontSize: 20,
            color: '#1976d2',
          },
        }}
      >
        {isExpanded ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
      </IconButton>

      {/* Header */}
      <Box sx={{ 
        p: isExpanded ? 2 : 1,
        pb: isExpanded ? 1.5 : 1,
        bgcolor: '#1565c0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isExpanded ? 'flex-start' : 'center',
      }}>
        {isExpanded ? (
          <>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}
            >
              ICT Admin Panel
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
              }}
            >
              Imus Division
            </Typography>
          </>
        ) : (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            ICT
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Menu Items */}
      <List sx={{ px: 1, py: 1.5 }}>
        {menuItems.map((item) => (
          <Tooltip 
            key={item.text}
            title={!isExpanded ? item.text : ''}
            placement="right"
          >
            <ListItem
              button
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                height: 44,
                color: 'white',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                px: isExpanded ? 2 : 1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.16)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.24)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: isExpanded ? 40 : 'auto',
                color: 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              {isExpanded && (
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                    },
                  }}
                />
              )}
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout Button */}
      <Box sx={{ p: 1, pb: 1.5 }}>
        <Tooltip title={!isExpanded ? 'Logout' : ''} placement="right">
          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              height: 44,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              px: isExpanded ? 2 : 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.16)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: isExpanded ? 40 : 'auto',
              color: 'inherit',
            }}>
              <LogoutIcon />
            </ListItemIcon>
            {isExpanded && (
              <ListItemText 
                primary="Logout"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  },
                }}
              />
            )}
          </ListItem>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ 
          width: isExpanded ? expandedWidth : collapsedWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            width: isExpanded ? expandedWidth : collapsedWidth,
            transition: 'width 0.2s ease-in-out',
            '& .MuiDrawer-paper': { 
              width: isExpanded ? expandedWidth : collapsedWidth,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${isExpanded ? expandedWidth : collapsedWidth}px)`,
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          transition: 'width 0.2s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import { getCategorySpecificDetails } from '../controllers/ticketController.js';
import { sendTestEmail, sendStatusUpdateEmail } from '../utils/emailSender.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking admin privileges'
    });
  }
};

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { report_type = 'overall', start_date, end_date } = req.query;
    
    // Build date filter if dates are provided
    const dateFilter = {};
    if (start_date && end_date) {
      dateFilter.createdAt = {
        gte: new Date(start_date),
        lte: new Date(end_date)
      };
    } else if (start_date) {
      dateFilter.createdAt = {
        gte: new Date(start_date)
      };
    } else if (end_date) {
      dateFilter.createdAt = {
        lte: new Date(end_date)
      };
    }

    // Get counts for different ticket statuses
    const [
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets
    ] = await Promise.all([
      prisma.ticket.count({ where: dateFilter }),
      prisma.ticket.count({ where: { ...dateFilter, status: 'PENDING' } }),
      prisma.ticket.count({ where: { ...dateFilter, status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { ...dateFilter, status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { ...dateFilter, status: 'CLOSED' } })
    ]);

    // Get status distribution
    const statusDistribution = await prisma.ticket.groupBy({
      by: ['status'],
      _count: true,
      where: dateFilter
    });

    // Get category distribution
    const categoryDistribution = await prisma.ticket.groupBy({
      by: ['category'],
      _count: true,
      where: dateFilter
    });

    // Get priority distribution
    const priorityDistribution = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: true,
      where: dateFilter
    });
    
    // Get detailed category-status breakdown if needed
    let categoryStatusBreakdown = [];
    if (report_type === 'detailed' || report_type === 'category_status') {
      // This requires raw SQL or multiple queries in Prisma
      // For each category, get the count of tickets in each status
      const categories = await prisma.ticket.groupBy({
        by: ['category'],
        where: dateFilter
      });
      
      categoryStatusBreakdown = await Promise.all(
        categories.map(async (cat) => {
          const statuses = await Promise.all([
            prisma.ticket.count({ 
              where: { 
                ...dateFilter,
                category: cat.category,
                status: 'PENDING'
              } 
            }),
            prisma.ticket.count({ 
              where: { 
                ...dateFilter,
                category: cat.category,
                status: 'IN_PROGRESS'
              } 
            }),
            prisma.ticket.count({ 
              where: { 
                ...dateFilter,
                category: cat.category,
                status: 'RESOLVED'
              } 
            }),
            prisma.ticket.count({ 
              where: { 
                ...dateFilter,
                category: cat.category,
                status: 'CLOSED'
              } 
            })
          ]);
          
          return {
            category: cat.category,
            pending: statuses[0],
            inProgress: statuses[1],
            resolved: statuses[2],
            closed: statuses[3],
            total: statuses.reduce((sum, count) => sum + count, 0)
          };
        })
      );
    }
    
    // Get time-based metrics if needed
    let timeBasedMetrics = null;
    if (report_type === 'time_based' || report_type === 'resolution_time') {
      // This would require more complex queries
      // For demonstration, we'll return placeholder data
      timeBasedMetrics = {
        averageResolutionTime: '2 days',
        averageResponseTime: '4 hours',
      };
    }

    // Format the response data based on report type
    const stats = {
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: item._count
      })),
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: item._count
      })),
      priorityDistribution: priorityDistribution.map(item => ({
        priority: item.priority,
        count: item._count
      }))
    };
    
    // Add additional data based on report type
    if (categoryStatusBreakdown.length > 0) {
      stats.categoryStatusBreakdown = categoryStatusBreakdown;
    }
    
    if (timeBasedMetrics) {
      stats.timeBasedMetrics = timeBasedMetrics;
    }
    
    // Add date range information if provided
    if (start_date || end_date) {
      stats.dateRange = {
        startDate: start_date ? new Date(start_date).toISOString() : null,
        endDate: end_date ? new Date(end_date).toISOString() : null
      };
    }

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// Get all tickets with pagination and filtering
router.get('/tickets', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { message: { contains: search } }
      ];
    }

    // Get tickets with pagination
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ticket.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Tickets retrieved successfully',
      data: {
        tickets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets'
    });
  }
});

// Get ticket by ID
router.get('/tickets/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    // Fetch ticket with related data
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        updates: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        comments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add category-specific details
    const ticketWithCategoryDetails = {
      ...ticket,
      categorySpecificDetails: getCategorySpecificDetails(ticket)
    };

    res.json({
      success: true,
      message: 'Ticket retrieved successfully',
      data: ticketWithCategoryDetails
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket details'
    });
  }
});

// Update ticket status
router.put('/tickets/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const adminId = req.user.id;

    // Validate ID
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ticket ID'
      });
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: PENDING, IN_PROGRESS, RESOLVED, CLOSED'
      });
    }

    // Check if ticket exists and get user information for email notifications
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: true
      }
    });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Use transaction to update ticket and create update history
    const result = await prisma.$transaction(async (prisma) => {
      // Update ticket status
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: {
          user: true
        }
      });

      // Create update history record
      const update = await prisma.ticketUpdate.create({
        data: {
          ticketId: ticketId,
          adminId: adminId,
          previousStatus: existingTicket.status,
          newStatus: status,
          comment: comment || '',
        }
      });

      return { ticket: updatedTicket, update };
    });

    // Get email settings from global app settings or use defaults
    let emailSettings = null;
    if (global.appSettings && global.appSettings.email) {
      emailSettings = global.appSettings.email;
    }

    // Send email notification if the ticket has a user and email notifications are enabled
    if (result.ticket.user && 
        emailSettings && 
        emailSettings.enableNotifications === true && 
        emailSettings.smtpUser && 
        emailSettings.smtpPassword) {
      try {
        await sendStatusUpdateEmail(
          result.ticket, 
          result.ticket.user, 
          result.update,
          emailSettings
        );
      } catch (emailError) {
        // Don't fail the request if email sending fails
      }
    }

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status'
    });
  }
});

// Get system settings
router.get('/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    // For now, return hardcoded settings as a starting point
    // In a real app, these would be stored in the database
    const settings = {
      general: {
        systemName: 'Ticket Management System',
        allowGuestTickets: true,
        ticketExpiryDays: 30,
        defaultPriority: 'MEDIUM',
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        senderName: 'IT Support',
        senderEmail: '',
        enableNotifications: true,
      },
      categories: {
        ticketCategories: [
          { id: 1, name: 'TROUBLESHOOTING', active: true },
          { id: 2, name: 'ACCOUNT_MANAGEMENT', active: true },
          { id: 3, name: 'DOCUMENT_UPLOAD', active: true },
        ]
      }
    };

    // In a real app, this would come from the database
    // Apply stored settings if available
    if (global.appSettings) {
      // Apply stored category settings
      if (global.appSettings.categories) {
        settings.categories = global.appSettings.categories;
      }
      
      // Apply stored email settings
      if (global.appSettings.email) {
        settings.email = global.appSettings.email;
      }
      
      // Apply stored general settings
      if (global.appSettings.general) {
        settings.general = global.appSettings.general;
      }
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings'
    });
  }
});

router.post('/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    // In a real app, you would save the settings to a database
    // For now, we'll store them in memory for the demo
    console.log('Settings update received:', req.body);
    
    // Initialize global app settings if not exists
    if (!global.appSettings) {
      global.appSettings = {};
    }
    
    // Store settings in global app state so both admin and public endpoints can access them
    if (req.body.categories) {
      global.appSettings.categories = req.body.categories;
    }
    
    if (req.body.email) {
      global.appSettings.email = req.body.email;
    }
    
    if (req.body.general) {
      global.appSettings.general = req.body.general;
    }
    
    console.log('Updated global app settings:', JSON.stringify(global.appSettings, null, 2));
    
    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

router.post('/settings/test-email', authenticateToken, isAdmin, async (req, res) => {
  try {
    const emailSettings = req.body;
    
    // Validate required email settings
    if (!emailSettings.smtpHost || !emailSettings.smtpPort || !emailSettings.smtpUser || 
        !emailSettings.smtpPassword || !emailSettings.senderEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required email settings (host, port, username, password, or sender email)'
      });
    }
    
    // Gmail-specific validation
    if (emailSettings.smtpHost.includes('gmail')) {
      // Gmail requires the smtpUser to be a valid email address
      if (!emailSettings.smtpUser.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'For Gmail SMTP, the username must be a complete email address'
        });
      }
    }
    
    // Send a test email to the admin's email
    const recipientEmail = req.user.email || emailSettings.senderEmail;
    await sendTestEmail(recipientEmail, emailSettings);
    
    res.json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`
    });
  } catch (error) {
    // Extract more useful error information
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your username and password. If using Gmail with 2FA, use an App Password.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Connection failed. Check your SMTP host and port settings.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection to mail server failed. Check your network connection and server settings.';
    } else if (error.message.includes('self signed certificate')) {
      errorMessage = 'SSL/TLS certificate error. Try using port 587 with TLS enabled.';
    }
    
    res.status(500).json({
      success: false,
      message: `Failed to send test email: ${errorMessage}`,
      errorCode: error.code
    });
  }
});

// Add a public endpoint to get active categories
router.get('/settings/categories', async (req, res) => {
  try {
    // In a real app, you would retrieve this from a database
    // For now, return hardcoded categories
    const categories = [
      { id: 1, name: 'TROUBLESHOOTING', active: true },
      { id: 2, name: 'ACCOUNT_MANAGEMENT', active: true },
      { id: 3, name: 'DOCUMENT_UPLOAD', active: true },
    ];
    
    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
});

export default router; 
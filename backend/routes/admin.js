import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = express.Router();

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let statsCache = null;
let lastStatsUpdate = null;

// Response helper
const sendResponse = (res, status, success, message, data = null) => {
  const response = {
    success,
    message,
    ...(data && { data })
  };
  return res.status(status).json(response);
};

// Input validation schemas
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  role: z.enum(['USER', 'ADMIN'], 'Invalid role')
});

// Error handling middleware
const handleError = (res, error) => {
  console.error('Error:', error);
  
  if (error instanceof z.ZodError) {
    return sendResponse(res, 400, false, 'Validation error', {
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  if (error.code === 'P2002') {
    return sendResponse(res, 400, false, 'A user with this email already exists');
  }
  
  if (error.code === 'P2025') {
    return sendResponse(res, 404, false, 'Resource not found');
  }

  return sendResponse(res, 500, false, 'Internal server error');
};

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached stats if available and not expired
    if (statsCache && lastStatsUpdate && (now - lastStatsUpdate < CACHE_DURATION)) {
      return sendResponse(res, 200, true, 'Statistics retrieved from cache', statsCache);
    }

    // Get total tickets and status counts
    const [
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'PENDING' } }),
      prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      prisma.ticket.count({ where: { status: 'CLOSED' } })
    ]);

    // Get status distribution
    const statusDistribution = await prisma.ticket.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    });

    // Get category distribution
    const categoryDistribution = await prisma.ticket.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });

    // Get category-specific stats
    const categoryStats = {
      TROUBLESHOOTING: await prisma.ticket.count({ where: { category: 'TROUBLESHOOTING' } }),
      ACCOUNT_MANAGEMENT: await prisma.ticket.count({ where: { category: 'ACCOUNT_MANAGEMENT' } }),
      DOCUMENT_UPLOAD: await prisma.ticket.count({ where: { category: 'DOCUMENT_UPLOAD' } })
    };

    // Get recent activity
    const recentActivity = await prisma.ticket.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        category: true,
        status: true,
        priority: true,
        updatedAt: true
      }
    });

    const stats = {
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      statusDistribution: statusDistribution.map(item => ({
        status: item.status || 'UNKNOWN',
        count: item._count._all
      })),
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category || 'UNKNOWN',
        count: item._count._all
      })),
      categoryStats,
      recentActivity
    };

    // Update cache
    statsCache = stats;
    lastStatsUpdate = now;

    return sendResponse(res, 200, true, 'Statistics retrieved successfully', stats);
  } catch (error) {
    return handleError(res, error);
  }
});

// Get ticket trends (last 7 days)
router.get('/trends', authenticateToken, isAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trends = await prisma.ticket.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    return sendResponse(res, 200, true, 'Trends retrieved successfully', {
      trends,
      period: {
        start: sevenDaysAgo,
        end: new Date()
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// Get all tickets with user information
router.get('/tickets', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

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

    return sendResponse(res, 200, true, 'Tickets retrieved successfully', {
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// Get single ticket details with user information
router.get('/tickets/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: Number(req.params.id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    if (!ticket) {
      return sendResponse(res, 404, false, 'Ticket not found');
    }

    return sendResponse(res, 200, true, 'Ticket details retrieved successfully', { ticket });
  } catch (error) {
    return handleError(res, error);
  }
});

// Get all users with pagination and filtering
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { department: { contains: search } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return sendResponse(res, 200, true, 'Users retrieved successfully', {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// Create new user
router.post('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: await bcrypt.hash('defaultPassword123', 10) // You should implement proper password handling
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        createdAt: true
      }
    });

    return sendResponse(res, 201, true, 'User created successfully', user);
  } catch (error) {
    return handleError(res, error);
  }
});

// Update user
router.put('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = userSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        updatedAt: true
      }
    });

    return sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    return handleError(res, error);
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    return handleError(res, error);
  }
});

export default router; 
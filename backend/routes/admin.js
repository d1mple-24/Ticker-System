import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

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
    // Get counts for different ticket statuses
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
      _count: true
    });

    // Get category distribution
    const categoryDistribution = await prisma.ticket.groupBy({
      by: ['category'],
      _count: true
    });

    // Format the response data
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
      }))
    };

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
        { message: { contains: search } },
        { user: { name: { contains: search } } }
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

// Update ticket status
router.put('/tickets/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: PENDING, IN_PROGRESS, RESOLVED, CLOSED'
      });
    }

    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      data: { ticket }
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

export default router; 
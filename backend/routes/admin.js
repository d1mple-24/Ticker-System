import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      departmentStats,
      recentTickets
    ] = await Promise.all([
      // Total tickets count
      prisma.ticket.count(),
      
      // Status-based counts
      prisma.ticket.count({
        where: { status: 'PENDING' }
      }),
      prisma.ticket.count({
        where: { status: 'IN_PROGRESS' }
      }),
      prisma.ticket.count({
        where: { status: 'RESOLVED' }
      }),
      prisma.ticket.count({
        where: { status: 'CLOSED' }
      }),
      
      // Department-wise ticket counts
      prisma.ticket.groupBy({
        by: ['office'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),

      // Recent tickets with user information
      prisma.ticket.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
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
      })
    ]);

    res.json({
      totalTickets,
      pendingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      departmentStats: departmentStats.map(dept => ({
        department: dept.office,
        count: dept._count.id
      })),
      recentTickets
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
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

    res.json(trends);
  } catch (error) {
    console.error('Error fetching ticket trends:', error);
    res.status(500).json({ message: 'Error fetching ticket trends' });
  }
});

// Get all tickets with user information
router.get('/tickets', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, office } = req.query;
    const skip = (page - 1) * limit;

    // Build the where clause based on filters
    const where = {};
    if (status) where.status = status;
    if (office) where.office = office;

    const tickets = await prisma.ticket.findMany({
      skip: Number(skip),
      take: Number(limit),
      where,
      orderBy: {
        createdAt: 'desc'
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

    const total = await prisma.ticket.count({ where });

    res.json({
      tickets,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
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
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ message: 'Error fetching ticket details' });
  }
});

export default router; 
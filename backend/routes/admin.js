import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import prisma from '../prisma.js';

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
      highPriorityTickets,
      departmentStats
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
      
      // Priority-based count
      prisma.ticket.count({
        where: { priority: 'HIGH' }
      }),
      
      // Department-wise ticket counts
      prisma.ticket.groupBy({
        by: ['department'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
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
      highPriorityTickets,
      departmentStats: departmentStats.map(dept => ({
        department: dept.department,
        count: dept._count.id
      }))
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

export default router; 
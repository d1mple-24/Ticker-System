import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  trackTicket,
  createAccountManagementTicket,
  createTroubleshootingTicket,
  createDocumentUploadTicket
} from '../controllers/ticketController.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/troubleshooting', createTroubleshootingTicket);
router.post('/account-management', createAccountManagementTicket);
router.post('/document-upload', createDocumentUploadTicket);
router.post('/', createTicket);
router.post('/track', trackTicket);

// Protected routes (authentication required)
router.use(authenticateToken);

// User routes
router.get('/my-tickets', getTickets);
router.get('/my-tickets/:id', getTicketById);

// Admin routes
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

export default router; 
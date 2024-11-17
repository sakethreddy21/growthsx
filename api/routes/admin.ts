import express from 'express';
import {
    acceptAssignment,
    rejectAssignment,
    getAssignmentsByAdmin
} from '../controllers/assignmentController';
import { registerAdmin, loginAdmin } from '../controllers/userController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// User Authentication Routes for Admin
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Assignment Routes for Admin
router.get('/assignments', authMiddleware, roleMiddleware(['admin']), getAssignmentsByAdmin);
router.post('/assignments/:id/accept', authMiddleware, roleMiddleware(['admin']), acceptAssignment);
router.post('/assignments/:id/reject', authMiddleware, roleMiddleware(['admin']), rejectAssignment);

// Error Handling Middleware 
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default router;

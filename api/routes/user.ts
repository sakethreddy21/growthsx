import express from 'express';
import {
    createAssignment
} from '../controllers/assignmentController';
import { registerStudent, loginStudent } from '../controllers/userController';
import { getAllAdmins } from '../controllers/userController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// User Routes (Student)
router.post('/register', registerStudent); // Register student
router.post('/login', loginStudent); // Login student

// Assignment Routes (Student)
router.post('/upload', authMiddleware, roleMiddleware(['student']), createAssignment); // Student uploads assignment

// Admin Routes (Admin)
router.get('/admins', authMiddleware, roleMiddleware(['admin']), getAllAdmins); // Fetch all admins (only for admins)

// Error Handling Middleware (Optional: For catching unhandled errors)
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

export default router;

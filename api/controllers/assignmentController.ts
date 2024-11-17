import { RequestHandler } from 'express';
import Assignment from '../models/Assignment';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Utility function to handle errors
const handleError = (res, statusCode: number, message: string) => {
  res.status(statusCode).json({ error: message });
};

// Helper function for verifying admin authorization
const verifyAdminAuth = async (token: string) => {
  if (!token) throw new Error('Authentication required');
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
  const adminId = decoded.id;
  if (!adminId) throw new Error('Admin ID not found in token');
  return adminId;
};

// Helper function to validate input
const validateAssignmentInput = ({ userId, task, admin }) => {
  if (!userId || !task || !admin) throw new Error('All fields (userId, task, admin) are required');
};

export const createAssignment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId, task, admin } = req.body;

    // Input validation
    validateAssignmentInput(req.body);

    // Verify if the admin exists and is of type 'admin'
    const adminDetails = await User.findOne({ name: admin, role: 'admin' });
    if (!adminDetails) return handleError(res, 404, 'Admin not found or invalid role');

    // Verify if the user exists
    const userDetails = await User.findById(userId);
    if (!userDetails) return handleError(res, 404, 'User not found');

    // Create the assignment and save to database
    const newAssignment = new Assignment({
      userId,
      task,
      admin: adminDetails.name,
      adminId: adminDetails._id,
      status: 'pending',
    });
    await newAssignment.save();

    res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error while creating assignment');
  }
};

export const getAssignmentsByAdmin: RequestHandler = async (req, res): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const adminId = await verifyAdminAuth(token || '');

    const assignments = await Assignment.find({ adminId });
    if (!assignments.length) return handleError(res, 404, 'No assignments found for this admin');

    res.status(200).json(assignments);
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error while fetching assignments');
  }
};

export const acceptAssignment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const adminId = await verifyAdminAuth(token || '');

    const assignment = await Assignment.findById(id);
    if (!assignment) return handleError(res, 404, 'Assignment not found');
    if (assignment.adminId?.toString() !== adminId) return handleError(res, 403, 'Access denied. You can only accept assignments assigned to you');
    if (assignment.status === 'accepted') return handleError(res, 400, 'Assignment has already been accepted');
    if (assignment.status === 'rejected') return handleError(res, 400, 'Assignment has already been rejected');

    assignment.status = 'accepted';
    await assignment.save();

    res.status(200).json({ message: 'Assignment accepted successfully', assignment });
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error while accepting assignment');
  }
};

export const rejectAssignment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const adminId = await verifyAdminAuth(token || '');

    const assignment = await Assignment.findById(id);
    if (!assignment) return handleError(res, 404, 'Assignment not found');
    if (assignment.adminId?.toString() !== adminId) return handleError(res, 403, 'Access denied. You can only reject assignments assigned to you');
    if (assignment.status === 'accepted') return handleError(res, 400, 'Assignment has already been accepted. You cannot reject it');
    if (assignment.status === 'rejected') return handleError(res, 400, 'Assignment has already been rejected');

    assignment.status = 'rejected';
    await assignment.save();

    res.status(200).json({ message: 'Assignment rejected successfully', assignment });
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error while rejecting assignment');
  }
};

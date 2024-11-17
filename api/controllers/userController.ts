import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

// Helper function to handle errors
const handleError = (res: Response, statusCode: number, message: string): void => {
  res.status(statusCode).json({ error: message });
};

const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper function to check for existing user
const checkIfUserExists = async (email: string): Promise<boolean> => {
  const existingUser = await User.findOne({ email });
  return !!existingUser;
};

// Register User (Student/Admin)
const registerUser = async (req: Request, res: Response, role: string): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    if (await checkIfUserExists(email)) {
      handleError(res, 400, 'Email already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: `${role} registered successfully`, user: newUser });
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error during registration');
  }
};

// Login User (Student/Admin)
const loginUser = async (req: Request, res: Response, role: string): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role });
    if (!user) {
      handleError(res, 400, `${role.charAt(0).toUpperCase() + role.slice(1)} not found`);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      handleError(res, 400, 'Invalid credentials');
      return;
    }

    const token = generateToken(user);

    res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} login successful`, token });
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error during login');
  }
};

// Register Student
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  await registerUser(req, res, 'student');
};

// Register Admin
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  await registerUser(req, res, 'admin');
};

// Login Student
export const loginStudent = async (req: Request, res: Response): Promise<void> => {
  await loginUser(req, res, 'student');
};

// Login Admin
export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  await loginUser(req, res, 'admin');
};

// Get All Admins
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json(admins);
  } catch (err) {
    console.error(err);
    handleError(res, 500, 'Server error while fetching admins');
  }
};

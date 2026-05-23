const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User, Patient, Doctor, Receptionist } = require('../models/index');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || '',
});

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ message: 'Account has been deactivated' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user.id);
    res.json({ token, user: formatUser(user) });
  } catch (error) { next(error); }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'patient', specialization } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const validRoles = ['admin', 'doctor', 'receptionist', 'patient'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    const user = await User.create({ name, email, password, role: userRole });

    // Create role-specific profile record
    if (userRole === 'patient') {
      await Patient.create({ userId: user.id, isFullProfile: false });
    } else if (userRole === 'doctor') {
      await Doctor.create({
        userId: user.id,
        specialization: specialization || 'General',
        isFullProfile: false,
      });
    } else if (userRole === 'receptionist') {
      await Receptionist.create({ userId: user.id });
    }

    const token = generateToken(user.id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: formatUser(user) });
  } catch (error) { next(error); }
};

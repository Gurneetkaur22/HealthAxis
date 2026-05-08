const { body } = require('express-validator');
const { Receptionist, User } = require('../models/index');

exports.createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const include = [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }];
const fmt = (r) => ({ ...r.toJSON(), _id: r.id, user: r.user ? { ...r.user.toJSON(), _id: r.user.id } : null });

exports.getReceptionists = async (req, res, next) => {
  try {
    const receptionists = await Receptionist.findAll({ include });
    res.json(receptionists.map(fmt));
  } catch (error) { next(error); }
};

exports.getReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findByPk(req.params.id, { include });
    if (!receptionist) return res.status(404).json({ message: 'Receptionist not found' });
    res.json(fmt(receptionist));
  } catch (error) { next(error); }
};

exports.createReceptionist = async (req, res, next) => {
  try {
    const { name, email, password, phone, shift } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'receptionist' });
    const receptionist = await Receptionist.create({ userId: user.id, phone, shift });
    const populated = await Receptionist.findByPk(receptionist.id, { include });
    res.status(201).json(fmt(populated));
  } catch (error) { next(error); }
};

exports.updateReceptionist = async (req, res, next) => {
  try {
    const { name, email, phone, shift } = req.body;
    const receptionist = await Receptionist.findByPk(req.params.id, { include });
    if (!receptionist) return res.status(404).json({ message: 'Receptionist not found' });

    await receptionist.update({ ...(phone && { phone }), ...(shift && { shift }) });

    if (name || email) {
      const user = await User.findByPk(receptionist.userId);
      if (user) await user.update({ ...(name && { name }), ...(email && { email }) });
    }

    const populated = await Receptionist.findByPk(receptionist.id, { include });
    res.json(fmt(populated));
  } catch (error) { next(error); }
};

exports.deleteReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findByPk(req.params.id);
    if (!receptionist) return res.status(404).json({ message: 'Receptionist not found' });
    await User.destroy({ where: { id: receptionist.userId } });
    await receptionist.destroy();
    res.json({ message: 'Receptionist deleted successfully' });
  } catch (error) { next(error); }
};

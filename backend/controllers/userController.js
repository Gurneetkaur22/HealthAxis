const { Op } = require('sequelize');
const { User } = require('../models/index');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({ where, order: [['createdAt', 'DESC']] });
    const formatted = users.map(u => ({ ...u.toJSON(), _id: u.id }));
    res.json(formatted);
  } catch (error) { next(error); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.update({ name, email, role, isActive });
    res.json({ ...user.toJSON(), _id: user.id });
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) { next(error); }
};

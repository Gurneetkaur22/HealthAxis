const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Doctor, User, Department } = require('../models/index');

exports.createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
];

exports.updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

const include = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
  { model: Department, as: 'department', attributes: ['id', 'name'] },
];

const fmtDoctor = (d) => {
  const j = d.toJSON();
  return {
    ...j,
    _id: d.id,
    user: j.user ? { ...j.user, _id: j.user.id } : null,
    department: j.department ? { ...j.department, _id: j.department.id } : null,
    availability: { days: j.availabilityDays, startTime: j.availabilityStart, endTime: j.availabilityEnd },
  };
};

exports.getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, department, specialization } = req.query;

    const where = {};
    if (department) where.departmentId = department;
    if (specialization) where.specialization = { [Op.like]: `%${specialization}%` };

    const userWhere = { role: 'doctor' };
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'], where: search ? userWhere : { role: 'doctor' } },
        { model: Department, as: 'department', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      distinct: true,
    });

    res.json({ doctors: rows.map(fmtDoctor), page, totalPages: Math.ceil(count / limit), total: count });
  } catch (error) { next(error); }
};

exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({ include });
    res.json(doctors.map(fmtDoctor));
  } catch (error) { next(error); }
};

exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, { include });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(fmtDoctor(doctor));
  } catch (error) { next(error); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id }, include });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(fmtDoctor(doctor));
  } catch (error) { next(error); }
};

exports.createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, department, qualification, experience, phone, consultationFee, availability } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'doctor' });

    const doctor = await Doctor.create({
      userId: user.id,
      specialization,
      departmentId: department || null,
      qualification,
      experience,
      phone,
      consultationFee,
      availabilityDays: availability?.days,
      availabilityStart: availability?.startTime,
      availabilityEnd: availability?.endTime,
    });

    const populated = await Doctor.findByPk(doctor.id, { include });
    res.status(201).json(fmtDoctor(populated));
  } catch (error) { next(error); }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const { name, email, specialization, department, qualification, experience, phone, consultationFee, availability } = req.body;

    const doctor = await Doctor.findByPk(req.params.id, { include });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await doctor.update({
      ...(specialization && { specialization }),
      ...(department && { departmentId: department }),
      ...(qualification && { qualification }),
      ...(experience !== undefined && { experience }),
      ...(phone && { phone }),
      ...(consultationFee !== undefined && { consultationFee }),
      ...(availability?.days && { availabilityDays: availability.days }),
      ...(availability?.startTime && { availabilityStart: availability.startTime }),
      ...(availability?.endTime && { availabilityEnd: availability.endTime }),
    });

    if (name || email) {
      const user = await User.findByPk(doctor.userId);
      if (user) await user.update({ ...(name && { name }), ...(email && { email }) });
    }

    const populated = await Doctor.findByPk(doctor.id, { include });
    res.json(fmtDoctor(populated));
  } catch (error) { next(error); }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.destroy({ where: { id: doctor.userId } });
    await doctor.destroy();
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) { next(error); }
};

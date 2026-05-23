const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Patient, User } = require('../models/index');

exports.createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
];

exports.updateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

const include = [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }];

const fmtPatient = (p) => {
  const j = p.toJSON();
  return {
    ...j,
    _id: p.id,
    user: j.user ? { ...j.user, _id: j.user.id } : null,
    address: { street: j.addressStreet, city: j.addressCity, state: j.addressState, zipCode: j.addressZipCode },
    emergencyContact: { name: j.emergencyName, phone: j.emergencyPhone, relation: j.emergencyRelation },
  };
};

exports.getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, gender, bloodGroup } = req.query;

    const where = {};
    if (gender) where.gender = gender;
    if (bloodGroup) where.bloodGroup = bloodGroup;

    const userWhere = { role: 'patient' };
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'], where: userWhere }],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
      distinct: true,
    });

    res.json({ patients: rows.map(fmtPatient), page, totalPages: Math.ceil(count / limit), total: count });
  } catch (error) { next(error); }
};

exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id, { include });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(fmtPatient(patient));
  } catch (error) { next(error); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id }, include });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    res.json(fmtPatient(patient));
  } catch (error) { next(error); }
};

exports.createPatient = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, bloodGroup, phone, address, emergencyContact, medicalHistory } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user) {
      if (user.role === 'patient') {
        const existingPatient = await Patient.findOne({ where: { userId: user.id } });
        if (existingPatient) {
          await existingPatient.update({
            age, gender, bloodGroup, phone,
            addressStreet: address?.street || '', addressCity: address?.city || '',
            addressState: address?.state || '', addressZipCode: address?.zipCode || '',
            emergencyName: emergencyContact?.name || '', emergencyPhone: emergencyContact?.phone || '',
            emergencyRelation: emergencyContact?.relation || '',
            medicalHistory: medicalHistory || '', isFullProfile: true,
          });
          await user.update({ name });
          const populated = await Patient.findByPk(existingPatient.id, { include });
          return res.status(200).json(fmtPatient(populated));
        }
      }
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    user = await User.create({ name, email, password: password || 'patient123', role: 'patient' });
    const patient = await Patient.create({
      userId: user.id, age, gender, bloodGroup, phone,
      addressStreet: address?.street || '', addressCity: address?.city || '',
      addressState: address?.state || '', addressZipCode: address?.zipCode || '',
      emergencyName: emergencyContact?.name || '', emergencyPhone: emergencyContact?.phone || '',
      emergencyRelation: emergencyContact?.relation || '',
      medicalHistory: medicalHistory || '', isFullProfile: true,
    });

    const populated = await Patient.findByPk(patient.id, { include });
    res.status(201).json(fmtPatient(populated));
  } catch (error) { next(error); }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const { name, email, age, gender, bloodGroup, phone, address, emergencyContact, medicalHistory } = req.body;

    const patient = await Patient.findByPk(req.params.id, { include });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.update({
      ...(age !== undefined && { age }),
      ...(gender && { gender }),
      ...(bloodGroup !== undefined && { bloodGroup }),
      ...(phone && { phone }),
      ...(address && {
        addressStreet: address.street, addressCity: address.city,
        addressState: address.state, addressZipCode: address.zipCode,
      }),
      ...(emergencyContact && {
        emergencyName: emergencyContact.name, emergencyPhone: emergencyContact.phone,
        emergencyRelation: emergencyContact.relation,
      }),
      ...(medicalHistory !== undefined && { medicalHistory }),
    });

    if (name || email) {
      const user = await User.findByPk(patient.userId);
      if (user) await user.update({ ...(name && { name }), ...(email && { email }) });
    }

    const populated = await Patient.findByPk(patient.id, { include });
    res.json(fmtPatient(populated));
  } catch (error) { next(error); }
};

exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await User.destroy({ where: { id: patient.userId } });
    await patient.destroy();
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) { next(error); }
};

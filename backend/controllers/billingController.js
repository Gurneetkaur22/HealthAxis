const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Billing, Patient, Appointment, User } = require('../models/index');

exports.createValidation = [
  body('patient').notEmpty().withMessage('Patient is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one billing item is required'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
];

const patientInclude = { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id','name','email'] }] };
const apptInclude = { model: Appointment, as: 'appointment' };

const fmt = (b) => {
  const j = b.toJSON();
  return {
    ...j, _id: b.id,
    patient: j.patient ? { ...j.patient, _id: j.patient.id, user: j.patient.user ? { ...j.patient.user, _id: j.patient.user.id } : null } : null,
    appointment: j.appointment ? { ...j.appointment, _id: j.appointment.id } : null,
  };
};

exports.getBillings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { paymentStatus, patient, search } = req.query;

    const where = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (patient) where.patientId = patient;

    if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ where: { userId: req.user.id } });
      if (pat) where.patientId = pat.id;
    }

    const includeArr = [patientInclude, apptInclude];

    if (search) {
      // Search by patient name via include where
      includeArr[0] = {
        ...patientInclude,
        include: [{ model: User, as: 'user', attributes: ['id','name','email'], where: { name: { [Op.like]: `%${search}%` } } }],
        required: true,
      };
    }

    const { count, rows } = await Billing.findAndCountAll({ where, include: includeArr, order: [['date', 'DESC']], offset, limit, distinct: true });
    res.json({ billings: rows.map(fmt), page, totalPages: Math.ceil(count / limit), total: count });
  } catch (error) { next(error); }
};

exports.getBilling = async (req, res, next) => {
  try {
    const billing = await Billing.findByPk(req.params.id, { include: [patientInclude, apptInclude] });
    if (!billing) return res.status(404).json({ message: 'Billing record not found' });
    res.json(fmt(billing));
  } catch (error) { next(error); }
};

exports.createBilling = async (req, res, next) => {
  try {
    const { patient, appointment, items, totalAmount, paymentMethod } = req.body;
    const billing = await Billing.create({ patientId: patient, appointmentId: appointment, items, totalAmount, paymentMethod });
    const populated = await Billing.findByPk(billing.id, { include: [patientInclude] });
    res.status(201).json(fmt(populated));
  } catch (error) { next(error); }
};

exports.updateBilling = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod, items, totalAmount } = req.body;
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ message: 'Billing record not found' });

    await billing.update({
      ...(paymentStatus && { paymentStatus }), ...(paymentMethod && { paymentMethod }),
      ...(items && { items }), ...(totalAmount !== undefined && { totalAmount }),
    });

    const populated = await Billing.findByPk(billing.id, { include: [patientInclude] });
    res.json(fmt(populated));
  } catch (error) { next(error); }
};

exports.deleteBilling = async (req, res, next) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ message: 'Billing record not found' });
    await billing.destroy();
    res.json({ message: 'Billing record deleted successfully' });
  } catch (error) { next(error); }
};

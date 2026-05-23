const { Op } = require('sequelize');
const { body } = require('express-validator');
const { Appointment, Doctor, Patient, User, Department } = require('../models/index');

exports.createValidation = [
  body('patient').notEmpty().withMessage('Patient is required'),
  body('doctor').notEmpty().withMessage('Doctor is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
];

const patientInclude = { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }] };
const doctorInclude = { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }] };
const deptInclude = { model: Department, as: 'department', attributes: ['id', 'name'] };

const fmtAppt = (a) => {
  const j = a.toJSON();
  return {
    ...j, _id: a.id,
    patient: j.patient ? { ...j.patient, _id: j.patient.id, user: j.patient.user ? { ...j.patient.user, _id: j.patient.user.id } : null } : null,
    doctor: j.doctor ? { ...j.doctor, _id: j.doctor.id, user: j.doctor.user ? { ...j.doctor.user, _id: j.doctor.user.id } : null } : null,
    department: j.department ? { ...j.department, _id: j.department.id } : null,
  };
};

exports.getAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, doctor, patient, date, sort } = req.query;

    const where = {};
    if (status) where.status = status;
    if (doctor) where.doctorId = doctor;
    if (patient) where.patientId = patient;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.date = { [Op.gte]: start, [Op.lt]: end };
    }

    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ where: { userId: req.user.id } });
      if (doc) where.doctorId = doc.id;
    } else if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ where: { userId: req.user.id } });
      if (pat) where.patientId = pat.id;
    }

    const order = sort === 'oldest' ? [['date', 'ASC']] : [['date', 'DESC']];
    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [patientInclude, doctorInclude, deptInclude],
      order,
      offset,
      limit,
      distinct: true,
    });

    res.json({ appointments: rows.map(fmtAppt), page, totalPages: Math.ceil(count / limit), total: count });
  } catch (error) { next(error); }
};

exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, { include: [patientInclude, doctorInclude, deptInclude] });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(fmtAppt(appointment));
  } catch (error) { next(error); }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, department, date, timeSlot, reason } = req.body;

    const patientDoc = await Patient.findByPk(patient);
    if (!patientDoc) return res.status(400).json({ message: 'Patient not found' });
    const doctorDoc = await Doctor.findByPk(doctor);
    if (!doctorDoc) return res.status(400).json({ message: 'Doctor not found' });

    const conflicting = await Appointment.findOne({
      where: { doctorId: doctor, date: new Date(date), timeSlot, status: { [Op.in]: ['pending', 'confirmed'] } },
    });
    if (conflicting) return res.status(400).json({ message: 'This time slot is already booked for the selected doctor' });

    const appointment = await Appointment.create({
      patientId: patient, doctorId: doctor,
      departmentId: department || doctorDoc.departmentId,
      date, timeSlot, reason,
    });

    const populated = await Appointment.findByPk(appointment.id, { include: [patientInclude, doctorInclude, deptInclude] });
    res.status(201).json(fmtAppt(populated));
  } catch (error) { next(error); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const { status, date, timeSlot, reason } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.update({
      ...(status && { status }), ...(date && { date }),
      ...(timeSlot && { timeSlot }), ...(reason && { reason }),
    });

    const populated = await Appointment.findByPk(appointment.id, { include: [patientInclude, doctorInclude, deptInclude] });
    res.json(fmtAppt(populated));
  } catch (error) { next(error); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    await appointment.destroy();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) { next(error); }
};

const { Doctor, Patient, Prescription, Appointment, User } = require('../models/index');

const patientInclude = { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id','name','email'] }] };
const doctorInclude = { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['id','name','email'] }] };
const apptInclude = { model: Appointment, as: 'appointment' };

const fmt = (p) => {
  const j = p.toJSON();
  return {
    ...j, _id: p.id,
    patient: j.patient ? { ...j.patient, _id: j.patient.id, user: j.patient.user ? { ...j.patient.user, _id: j.patient.user.id } : null } : null,
    doctor: j.doctor ? { ...j.doctor, _id: j.doctor.id, user: j.doctor.user ? { ...j.doctor.user, _id: j.doctor.user.id } : null } : null,
    appointment: j.appointment ? { ...j.appointment, _id: j.appointment.id } : null,
  };
};

exports.getPrescriptions = async (req, res, next) => {
  try {
    const { patient, doctor, appointment } = req.query;
    const where = {};
    if (patient) where.patientId = patient;
    if (doctor) where.doctorId = doctor;
    if (appointment) where.appointmentId = appointment;

    if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ where: { userId: req.user.id } });
      if (doc) where.doctorId = doc.id;
    } else if (req.user.role === 'patient') {
      const pat = await Patient.findOne({ where: { userId: req.user.id } });
      if (pat) where.patientId = pat.id;
    }

    const prescriptions = await Prescription.findAll({ where, include: [patientInclude, doctorInclude, apptInclude], order: [['date', 'DESC']] });
    res.json(prescriptions.map(fmt));
  } catch (error) { next(error); }
};

exports.getPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, { include: [patientInclude, doctorInclude, apptInclude] });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(fmt(prescription));
  } catch (error) { next(error); }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const { patient, appointment, medicines, notes } = req.body;
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(400).json({ message: 'Doctor profile not found' });

    const prescription = await Prescription.create({ patientId: patient, doctorId: doctor.id, appointmentId: appointment, medicines, notes });
    const populated = await Prescription.findByPk(prescription.id, { include: [patientInclude, doctorInclude] });
    res.status(201).json(fmt(populated));
  } catch (error) { next(error); }
};

exports.deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    await prescription.destroy();
    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) { next(error); }
};

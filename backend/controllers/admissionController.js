const { Admission, Room, Patient, Doctor, User } = require('../models/index');

const patientInclude = { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id','name','email'] }] };
const doctorInclude = { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['id','name','email'] }] };
const roomInclude = { model: Room, as: 'room', attributes: ['id','roomNumber','type','floor'] };

const fmt = (a) => {
  const j = a.toJSON();
  return {
    ...j, _id: a.id,
    patient: j.patient ? { ...j.patient, _id: j.patient.id, user: j.patient.user ? { ...j.patient.user, _id: j.patient.user.id } : null } : null,
    doctor: j.doctor ? { ...j.doctor, _id: j.doctor.id, user: j.doctor.user ? { ...j.doctor.user, _id: j.doctor.user.id } : null } : null,
    room: j.room ? { ...j.room, _id: j.room.id } : null,
  };
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const admissions = await Admission.findAll({ where, include: [patientInclude, doctorInclude, roomInclude], order: [['admitDate', 'DESC']] });
    res.json(admissions.map(fmt));
  } catch (error) { next(error); }
};

exports.getAdmission = async (req, res, next) => {
  try {
    const admission = await Admission.findByPk(req.params.id, { include: [patientInclude, doctorInclude, { model: Room, as: 'room' }] });
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(fmt(admission));
  } catch (error) { next(error); }
};

exports.createAdmission = async (req, res, next) => {
  try {
    const { patient, room, bedNumber, doctor, reason } = req.body;

    const roomDoc = await Room.findByPk(room);
    if (!roomDoc) return res.status(400).json({ message: 'Room not found' });

    const beds = roomDoc.beds || [];
    const bed = beds.find((b) => b.bedNumber === bedNumber);
    if (!bed) return res.status(400).json({ message: 'Bed not found in this room' });
    if (bed.isOccupied) return res.status(400).json({ message: 'This bed is already occupied' });

    bed.isOccupied = true;
    bed.patientId = patient;

    const allOccupied = beds.every((b) => b.isOccupied);
    await roomDoc.update({ beds, ...(allOccupied && { status: 'full' }) });

    const admission = await Admission.create({ patientId: patient, roomId: room, bedNumber, doctorId: doctor, reason });
    const populated = await Admission.findByPk(admission.id, { include: [patientInclude, doctorInclude, roomInclude] });
    res.status(201).json(fmt(populated));
  } catch (error) { next(error); }
};

exports.dischargePatient = async (req, res, next) => {
  try {
    const admission = await Admission.findByPk(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    if (admission.status === 'discharged') return res.status(400).json({ message: 'Patient already discharged' });

    const roomDoc = await Room.findByPk(admission.roomId);
    if (roomDoc) {
      const beds = roomDoc.beds || [];
      const bed = beds.find((b) => b.bedNumber === admission.bedNumber);
      if (bed) { bed.isOccupied = false; bed.patientId = null; }
      await roomDoc.update({ beds, status: 'available' });
    }

    await admission.update({ status: 'discharged', dischargeDate: new Date() });
    const populated = await Admission.findByPk(admission.id, { include: [patientInclude, doctorInclude, roomInclude] });
    res.json(fmt(populated));
  } catch (error) { next(error); }
};

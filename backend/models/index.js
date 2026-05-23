// Import all models and define associations
const User = require('./User');
const Department = require('./Department');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Receptionist = require('./Receptionist');
const Room = require('./Room');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const Billing = require('./Billing');
const Admission = require('./Admission');
const MedicalRecord = require('./MedicalRecord');

// User associations
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor' });

Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'patient' });

Receptionist.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Receptionist, { foreignKey: 'userId', as: 'receptionist' });

// Doctor-Department
Doctor.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Doctor, { foreignKey: 'departmentId' });

// Appointment associations
Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });

// Prescription associations
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Billing associations
Billing.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Billing.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

// Admission associations
Admission.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Admission.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
Admission.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

// MedicalRecord associations
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointmentId', as: 'appointment' });

module.exports = { User, Department, Doctor, Patient, Receptionist, Room, Appointment, Prescription, Billing, Admission, MedicalRecord };

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Appointment extends Model {}

Appointment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'doctors', key: 'id' } },
    departmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'departments', key: 'id' } },
    date: { type: DataTypes.DATE, allowNull: false },
    timeSlot: { type: DataTypes.STRING(20), allowNull: false },
    reason: { type: DataTypes.TEXT, defaultValue: '' },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), defaultValue: 'pending' },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
  }
);

module.exports = Appointment;

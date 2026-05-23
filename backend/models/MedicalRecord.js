const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class MedicalRecord extends Model {}

MedicalRecord.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'doctors', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'appointments', key: 'id' } },
    diagnosis: { type: DataTypes.TEXT, allowNull: false },
    treatmentNotes: { type: DataTypes.TEXT, defaultValue: '' },
    followUpDate: { type: DataTypes.DATE, defaultValue: null },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'MedicalRecord',
    tableName: 'medical_records',
    timestamps: true,
  }
);

module.exports = MedicalRecord;

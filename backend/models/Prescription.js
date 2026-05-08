const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Prescription extends Model {}

Prescription.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'doctors', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'appointments', key: 'id' } },
    // medicines stored as JSON array: [{name, dosage, duration, instructions}]
    medicines: { type: DataTypes.JSON, defaultValue: [] },
    notes: { type: DataTypes.TEXT, defaultValue: '' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Prescription',
    tableName: 'prescriptions',
    timestamps: true,
  }
);

module.exports = Prescription;

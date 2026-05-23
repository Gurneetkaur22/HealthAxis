const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Admission extends Model {}

Admission.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
    roomId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'rooms', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'doctors', key: 'id' } },
    bedNumber: { type: DataTypes.STRING(20), allowNull: false },
    admitDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dischargeDate: { type: DataTypes.DATE, defaultValue: null },
    reason: { type: DataTypes.TEXT, defaultValue: '' },
    status: { type: DataTypes.ENUM('admitted', 'discharged'), defaultValue: 'admitted' },
  },
  {
    sequelize,
    modelName: 'Admission',
    tableName: 'admissions',
    timestamps: true,
  }
);

module.exports = Admission;

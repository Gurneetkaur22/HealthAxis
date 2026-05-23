const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Doctor extends Model {}

Doctor.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    departmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'departments', key: 'id' } },
    specialization: { type: DataTypes.STRING(255), allowNull: false },
    qualification: { type: DataTypes.STRING(255), defaultValue: '' },
    experience: { type: DataTypes.INTEGER, defaultValue: 0 },
    phone: { type: DataTypes.STRING(20), defaultValue: '' },
    consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    // availability stored as JSON
    availabilityDays: { type: DataTypes.JSON, defaultValue: ['Monday','Tuesday','Wednesday','Thursday','Friday'] },
    availabilityStart: { type: DataTypes.STRING(10), defaultValue: '09:00' },
    availabilityEnd: { type: DataTypes.STRING(10), defaultValue: '17:00' },
  },
  {
    sequelize,
    modelName: 'Doctor',
    tableName: 'doctors',
    timestamps: true,
  }
);

module.exports = Doctor;

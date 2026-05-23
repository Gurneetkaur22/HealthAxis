const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Patient extends Model {}

Patient.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    age: { type: DataTypes.INTEGER, defaultValue: null },
    gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), defaultValue: null },
    bloodGroup: { type: DataTypes.STRING(5), defaultValue: '' },
    phone: { type: DataTypes.STRING(20), defaultValue: '' },
    addressStreet: { type: DataTypes.STRING(255), defaultValue: '' },
    addressCity: { type: DataTypes.STRING(100), defaultValue: '' },
    addressState: { type: DataTypes.STRING(100), defaultValue: '' },
    addressZipCode: { type: DataTypes.STRING(20), defaultValue: '' },
    emergencyName: { type: DataTypes.STRING(100), defaultValue: '' },
    emergencyPhone: { type: DataTypes.STRING(20), defaultValue: '' },
    emergencyRelation: { type: DataTypes.STRING(50), defaultValue: '' },
    medicalHistory: { type: DataTypes.TEXT, defaultValue: '' },
    isFullProfile: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: true,
  }
);

module.exports = Patient;

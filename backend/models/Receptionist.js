const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Receptionist extends Model {}

Receptionist.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    phone: { type: DataTypes.STRING(20), defaultValue: '' },
    shift: { type: DataTypes.ENUM('Morning', 'Afternoon', 'Night'), defaultValue: 'Morning' },
  },
  {
    sequelize,
    modelName: 'Receptionist',
    tableName: 'receptionists',
    timestamps: true,
  }
);

module.exports = Receptionist;

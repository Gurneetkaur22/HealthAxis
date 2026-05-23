const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Billing extends Model {}

Billing.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'patients', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'appointments', key: 'id' } },
    // items stored as JSON array: [{description, category, amount}]
    items: { type: DataTypes.JSON, defaultValue: [] },
    totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    paymentStatus: { type: DataTypes.ENUM('paid', 'unpaid', 'partial'), defaultValue: 'unpaid' },
    paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'upi', 'insurance', 'other'), defaultValue: 'cash' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Billing',
    tableName: 'billings',
    timestamps: true,
  }
);

module.exports = Billing;

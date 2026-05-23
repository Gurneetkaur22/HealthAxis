const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Room extends Model {}

Room.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    roomNumber: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    type: { type: DataTypes.ENUM('General', 'Semi-Private', 'Private', 'ICU', 'Emergency'), defaultValue: 'General' },
    floor: { type: DataTypes.INTEGER, defaultValue: 1 },
    pricePerDay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    // beds stored as JSON array: [{bedNumber, isOccupied, patientId}]
    beds: { type: DataTypes.JSON, defaultValue: [] },
    status: { type: DataTypes.ENUM('available', 'full', 'maintenance'), defaultValue: 'available' },
  },
  {
    sequelize,
    modelName: 'Room',
    tableName: 'rooms',
    timestamps: true,
  }
);

module.exports = Room;

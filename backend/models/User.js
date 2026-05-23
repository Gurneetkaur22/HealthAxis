const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

class User extends Model {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'doctor', 'receptionist', 'patient'), defaultValue: 'patient' },
    avatar: { type: DataTypes.STRING(500), defaultValue: '' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;

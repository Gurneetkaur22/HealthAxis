const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully.');
    // Sync all models (alter:true to update existing tables safely)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // Neon / Render provide a single connection string
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
} else {
  // Local dev — individual vars
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully.');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced.');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('DATABASE_URL set:', !!process.env.DATABASE_URL);
    console.error('DATABASE_URL preview:', process.env.DATABASE_URL?.slice(0, 40));
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

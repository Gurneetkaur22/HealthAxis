const { sequelize } = require('../config/db');
const { Patient, Doctor, Appointment, Billing, Room, Department, User } = require('../models/index');
const { Op, fn, col, literal } = require('sequelize');

exports.getStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.count();
    const totalDoctors = await Doctor.count();
    const totalAppointments = await Appointment.count();
    const totalDepartments = await Department.count();

    // Revenue
    const revenueResult = await Billing.sum('totalAmount', { where: { paymentStatus: 'paid' } });
    const totalRevenue = revenueResult || 0;

    // Bed stats
    const rooms = await Room.findAll();
    let totalBeds = 0, occupiedBeds = 0;
    rooms.forEach((r) => (r.beds || []).forEach((b) => { totalBeds++; if (b.isOccupied) occupiedBeds++; }));

    // Recent appointments
    const recentAppointments = await Appointment.findAll({
      include: [
        { model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id','name'] }] },
        { model: Doctor, as: 'doctor', include: [{ model: User, as: 'user', attributes: ['id','name'] }] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Recent billing
    const recentBillings = await Billing.findAll({
      include: [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user', attributes: ['id','name'] }] }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Appointments by status
    const appointmentsByStatus = await Appointment.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Monthly appointments (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyAppointments = await Appointment.findAll({
      where: { date: { [Op.gte]: sixMonthsAgo } },
      attributes: [[fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'], [fn('COUNT', col('id')), 'count']],
      group: [literal("DATE_FORMAT(`date`, '%Y-%m')")],
      order: [[literal("DATE_FORMAT(`date`, '%Y-%m')"), 'ASC']],
      raw: true,
    });

    // Monthly revenue
    const monthlyRevenue = await Billing.findAll({
      where: { date: { [Op.gte]: sixMonthsAgo }, paymentStatus: 'paid' },
      attributes: [[fn('DATE_FORMAT', col('date'), '%Y-%m'), 'month'], [fn('SUM', col('totalAmount')), 'total']],
      group: [literal("DATE_FORMAT(`date`, '%Y-%m')")],
      order: [[literal("DATE_FORMAT(`date`, '%Y-%m')"), 'ASC']],
      raw: true,
    });

    // Department-wise patient count
    const deptPatients = await Appointment.findAll({
      attributes: ['departmentId', [fn('COUNT', col('Appointment.id')), 'count']],
      include: [{ model: Department, as: 'department', attributes: ['name'] }],
      group: ['departmentId', 'department.id', 'department.name'],
      raw: true,
      nest: true,
    });

    res.json({
      totalPatients, totalDoctors, totalAppointments, totalRevenue, totalDepartments,
      totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds,
      recentAppointments, recentBillings,
      appointmentsByStatus: appointmentsByStatus.map(s => ({ _id: s.status, count: parseInt(s.count) })),
      monthlyAppointments: monthlyAppointments.map(m => ({ _id: m.month, count: parseInt(m.count) })),
      monthlyRevenue: monthlyRevenue.map(m => ({ _id: m.month, total: parseFloat(m.total) })),
      departmentPatients: deptPatients.map(d => ({ name: d.department?.name || 'Unassigned', count: parseInt(d.count) })),
    });
  } catch (error) { next(error); }
};

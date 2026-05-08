const { body } = require('express-validator');
const { Department } = require('../models/index');

exports.createValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
];

const fmt = (d) => ({ ...d.toJSON(), _id: d.id });

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    res.json(departments.map(fmt));
  } catch (error) { next(error); }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(fmt(department));
  } catch (error) { next(error); }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const department = await Department.create({ name, description });
    res.status(201).json(fmt(department));
  } catch (error) { next(error); }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    await department.update({ name, description, status });
    res.json(fmt(department));
  } catch (error) { next(error); }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    await department.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) { next(error); }
};

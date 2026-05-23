const router = require('express').Router();
const ctrl = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

router.use(auth);
router.get('/', ctrl.getDepartments);
router.get('/:id', ctrl.getDepartment);
router.post('/', role('admin'), ctrl.createValidation, validate, ctrl.createDepartment);
router.put('/:id', role('admin'), ctrl.updateDepartment);
router.delete('/:id', role('admin'), ctrl.deleteDepartment);

module.exports = router;

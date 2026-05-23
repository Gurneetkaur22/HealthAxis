const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

router.use(auth);
router.get('/', ctrl.getAppointments);
router.get('/:id', ctrl.getAppointment);
router.post('/', role('admin', 'receptionist', 'patient'), ctrl.createValidation, validate, ctrl.createAppointment);
router.put('/:id', role('admin', 'receptionist', 'doctor'), ctrl.updateAppointment);
router.delete('/:id', role('admin', 'receptionist'), ctrl.deleteAppointment);

module.exports = router;

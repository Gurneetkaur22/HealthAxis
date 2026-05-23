const router = require('express').Router();
const ctrl = require('../controllers/admissionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);
router.get('/', ctrl.getAdmissions);
router.get('/:id', ctrl.getAdmission);
router.post('/', role('admin', 'receptionist'), ctrl.createAdmission);
router.put('/:id/discharge', role('admin', 'receptionist', 'doctor'), ctrl.dischargePatient);

module.exports = router;

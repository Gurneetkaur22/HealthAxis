const router = require('express').Router();
const ctrl = require('../controllers/prescriptionController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);
router.get('/', ctrl.getPrescriptions);
router.get('/:id', ctrl.getPrescription);
router.post('/', role('doctor'), ctrl.createPrescription);
router.delete('/:id', role('admin', 'doctor'), ctrl.deletePrescription);

module.exports = router;

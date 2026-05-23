const router = require('express').Router();
const ctrl = require('../controllers/medicalRecordController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);
router.get('/', ctrl.getMedicalRecords);
router.get('/:id', ctrl.getMedicalRecord);
router.post('/', role('doctor'), ctrl.createMedicalRecord);
router.delete('/:id', role('admin', 'doctor'), ctrl.deleteMedicalRecord);

module.exports = router;

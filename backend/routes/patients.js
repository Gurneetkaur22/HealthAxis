const router = require('express').Router();
const ctrl = require('../controllers/patientController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(auth);
router.get('/my/profile', role('patient'), ctrl.getMyProfile);
router.get('/', role('admin', 'receptionist', 'doctor'), ctrl.getPatients);
router.get('/:id', ctrl.getPatient);
router.post('/', role('admin', 'receptionist'), ctrl.createValidation, validate, ctrl.createPatient);
router.put('/:id', role('admin', 'receptionist', 'patient'), ctrl.updateValidation, validate, ctrl.updatePatient);
router.delete('/:id', role('admin'), ctrl.deletePatient);

// Avatar upload
router.post('/:id/avatar', role('admin', 'receptionist', 'patient'), upload.single('avatar'), async (req, res, next) => {
  try {
    const { Patient, User } = require('../models/index');
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const user = await User.findByPk(patient.userId);
    if (user) {
      await user.update({ avatar: `/uploads/${req.file.filename}` });
    }
    res.json({ avatar: user.avatar });
  } catch (error) { next(error); }
});

module.exports = router;

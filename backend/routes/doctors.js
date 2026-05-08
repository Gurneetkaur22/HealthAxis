const router = require('express').Router();
const ctrl = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.use(auth);
router.get('/all', ctrl.getAllDoctors);
router.get('/my/profile', role('doctor'), ctrl.getMyProfile);
router.get('/', ctrl.getDoctors);
router.get('/:id', ctrl.getDoctor);
router.post('/', role('admin'), ctrl.createValidation, validate, ctrl.createDoctor);
router.put('/:id', role('admin', 'doctor'), ctrl.updateValidation, validate, ctrl.updateDoctor);
router.delete('/:id', role('admin'), ctrl.deleteDoctor);

// Avatar upload
router.post('/:id/avatar', role('admin', 'doctor'), upload.single('avatar'), async (req, res, next) => {
  try {
    const { Doctor, User } = require('../models/index');
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const user = await User.findByPk(doctor.userId);
    if (user) {
      await user.update({ avatar: `/uploads/${req.file.filename}` });
    }
    res.json({ avatar: user.avatar });
  } catch (error) { next(error); }
});

module.exports = router;

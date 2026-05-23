const router = require('express').Router();
const ctrl = require('../controllers/receptionistController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

router.use(auth, role('admin'));
router.get('/', ctrl.getReceptionists);
router.get('/:id', ctrl.getReceptionist);
router.post('/', ctrl.createValidation, validate, ctrl.createReceptionist);
router.put('/:id', ctrl.updateReceptionist);
router.delete('/:id', ctrl.deleteReceptionist);

module.exports = router;

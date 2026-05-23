const router = require('express').Router();
const ctrl = require('../controllers/billingController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

router.use(auth);
router.get('/', ctrl.getBillings);
router.get('/:id', ctrl.getBilling);
router.post('/', role('admin', 'receptionist'), ctrl.createValidation, validate, ctrl.createBilling);
router.put('/:id', role('admin', 'receptionist'), ctrl.updateBilling);
router.delete('/:id', role('admin'), ctrl.deleteBilling);

module.exports = router;

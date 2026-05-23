const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, role('admin'), getStats);

module.exports = router;

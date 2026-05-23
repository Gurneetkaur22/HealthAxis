const router = require('express').Router();
const { login, register, getMe, loginValidation, registerValidation } = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/login', loginValidation, validate, login);
router.post('/register', registerValidation, validate, register);
router.get('/me', auth, getMe);

module.exports = router;

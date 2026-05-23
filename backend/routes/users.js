const router = require('express').Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth, role('admin'));
router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

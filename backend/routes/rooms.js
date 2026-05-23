const router = require('express').Router();
const ctrl = require('../controllers/roomController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);
router.get('/stats/availability', ctrl.getRoomStats);
router.get('/', ctrl.getRooms);
router.get('/:id', ctrl.getRoom);
router.post('/', role('admin'), ctrl.createRoom);
router.put('/:id', role('admin'), ctrl.updateRoom);
router.delete('/:id', role('admin'), ctrl.deleteRoom);

module.exports = router;

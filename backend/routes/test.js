const router = require('express').Router();
router.get('/', (req, res) => {
  res.json({ message: '🏥 HMS API is running!', timestamp: new Date().toISOString() });
});
module.exports = router;

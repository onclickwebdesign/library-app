const express = require('express');
const router = express.Router();

// home route (http://localhost:5000)
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;
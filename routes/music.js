const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('In the music index route');
});

module.exports = router;
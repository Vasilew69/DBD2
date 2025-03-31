const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../auth/auth');

router.get('/playing', ensureAuthenticated, (req, res) => {
    
});

module.exports = router;
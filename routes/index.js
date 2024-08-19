const express = require('express');
const router = express.Router();

// GET route for login page
router.get('/login', (req, res) => {
    res.render('login'); // Renders views/login.ejs
});

module.exports = router;

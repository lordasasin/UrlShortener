const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Url = require('../models/url');






router.get('/myurls/:token', async (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(401).json({ error: 'Token required in params!!!!!' });

    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Invalid token!!!!!' });

    const urls = await Url.find({ createdBy: user.username });
    res.json(urls);
});

router.get('/list', async (req, res) => {
    const urls = await Url.find();
    res.json(urls);
});



module.exports = router;
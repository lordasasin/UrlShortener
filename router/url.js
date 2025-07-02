const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Url = require('../models/url');

function generateToken(length = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};








router.post('/shorten', async (req, res) => {
    const { token, originalUrl } = req.body;
    if (!token) return res.status(401).json({ error: 'Token required in body!!!!!' });
    if (!originalUrl) return res.status(400).json({ error: 'originalUrl required!!!!!' });

    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Invalid token!!!!!' });

    const shortUrl = generateToken(6);
    const newUrl = new Url({
        shortUrl,
        originalUrl,
        createdBy: user.username
    });
    await newUrl.save();

    res.json({ shortUrl: `http://localhost:${process.env.PORT}/${shortUrl}` });
});

router.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    if (!url) return res.status(404).json({ error: 'Short URL not found!!!!!' });

    res.redirect(url.originalUrl);
});


module.exports = router;
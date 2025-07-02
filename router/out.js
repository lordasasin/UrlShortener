const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');


function generateToken(length = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};





function generateToken(length = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};






router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required!!!!!' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists!!!!!' });

    const token = generateToken();
    const newUser = new User({ username, password, token });
    await newUser.save();

    res.json({ message: 'User registered', token });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required!!!!!' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found!!!!!' });

    if (user.password !== password) return res.status(400).json({ error: 'Wrong password!!!!!' });

    res.json({ message: 'Login success', token: user.token });
});

module.exports = router;
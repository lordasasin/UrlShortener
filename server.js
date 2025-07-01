const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_CONNECT)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    token: String
});
const User = mongoose.model('User', userSchema);

const urlSchema = new mongoose.Schema({
    shortUrl: String,
    originalUrl: String,
    createdBy: String
});
const Url = mongoose.model('Url', urlSchema);

function generateToken(length = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required!!!!!' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists!!!!!' });

    const token = generateToken();
    const newUser = new User({ username, password, token });
    await newUser.save();

    res.json({ message: 'User registered', token });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required!!!!!' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found!!!!!' });

    if (user.password !== password) return res.status(400).json({ error: 'Wrong password!!!!!' });

    res.json({ message: 'Login success', token: user.token });
});

app.get('/list', async (req, res) => {
    const urls = await Url.find();
    res.json(urls);
});

app.get('/myurls/:token', async (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(401).json({ error: 'Token required in params!!!!!' });

    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Invalid token!!!!!' });

    const urls = await Url.find({ createdBy: user.username });
    res.json(urls);
});

app.post('/shorten', async (req, res) => {
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

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    if (!url) return res.status(404).json({ error: 'Short URL not found!!!!!' });

    res.redirect(url.originalUrl);
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT}`);
    console.log(`[POST] http://localhost:${process.env.PORT}/register  Body: { username, password }`);
    console.log(`[POST] http://localhost:${process.env.PORT}/login     Body: { username, password }`);
    console.log(`[POST] http://localhost:${process.env.PORT}/shorten   Body: { token, originalUrl }`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/list → Herhangi bir tokene gerek yok herkes url leri görüntüleyebilir.`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/myurls/:token → Kullanıcıya özel Url leri gösterir.`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/:shortUrl  → Verdiğimiz kısa linki yönlendirme amaçlı.`);
});

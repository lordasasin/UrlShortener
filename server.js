const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


const app = express();


mongoose.connect(`${process.env.MONGO_CONNECT}`)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));

const urlSchema = new mongoose.Schema({
    shortUrl: String,
    originalUrl: String,
    createdBy: String
});
const Url = mongoose.model('Url', urlSchema);

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    const urlEntry = await Url.findOne({ shortUrl });
    if (urlEntry) {
        return res.redirect(urlEntry.originalUrl);
    } else {
        return res.status(404).send('URL not found');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at PORT ${process.env.PORT}`);
});

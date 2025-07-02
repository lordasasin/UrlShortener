const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(express.json());




const userRoute = require('./router/user');
const outRoute = require('./router/out');
const urlRoute = require('./router/url');







app.use("/" , userRoute);
app.use("/" , outRoute);
app.use("/" , urlRoute);


app.listen(process.env.PORT, () => {

    mongoose.connect(process.env.MONGO_CONNECT)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

    console.log(`Server running on PORT ${process.env.PORT}`);
    console.log(`[POST] http://localhost:${process.env.PORT}/register  Body: { username, password }`);
    console.log(`[POST] http://localhost:${process.env.PORT}/login     Body: { username, password }`);
    console.log(`[POST] http://localhost:${process.env.PORT}/shorten   Body: { token, originalUrl }`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/list → Herhangi bir tokene gerek yok herkes url leri görüntüleyebilir.`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/myurls/:token → Kullanıcıya özel Url leri gösterir.`);
    console.log(`[GET]  http://localhost:${process.env.PORT}/:shortUrl  → Verdiğimiz kısa linki yönlendirme amaçlı.`);
});

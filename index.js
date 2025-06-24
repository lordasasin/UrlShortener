const readline = require('readline-sync');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// You can register login and short URL in that code but if you want to start server and try that short URL you need to start server.js.



dotenv.config();

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

function generateToken(length = 4) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

async function mainMenu() {
    console.log("\n--- Welcome ---");   

    console.log("1 - Register");
    console.log("2 - Login");
    console.log("3 - Show All URLs");
    console.log("4 - Exit");

    const choice = readline.question("Choose: ");

    if (choice === '1') {
        const username = readline.question("Username: ");
        const password = readline.question("Password: ");
        const token = generateToken();

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already exists!!!!!!!");
        } else {
            const newUser = new User({ username, password, token });
            await newUser.save();
            console.log(`Register success! Your token: ${token}`);
        }
        await mainMenu();

    } else if (choice === '2') {
        const username = readline.question("Username: ");
        const password = readline.question("Password: ");

        const user = await User.findOne({ username });
        if (!user) {
            console.log("User not found, please register!!!!!");
            await mainMenu();
            return;
        }
        if (user.password !== password) {
            console.log("Wrong password!");
            await mainMenu();
            return;
        }

        console.log(`Login success! Welcome ${user.username}`);

        while (true) {
            console.log(`\n--- Hello, ${user.username} ---`);
            console.log("1 - Shorten URL");
            console.log("2 - Show My URLs");
            console.log("3 - Show My Info");
            console.log("4 - Change Password");
            console.log("5 - Logout");

            const userChoice = readline.question("Choose: ");

            if (userChoice === '1') {
                const originalUrl = readline.question("Enter URL to shorten: ");
                const shortUrl = generateToken(6);
                const newUrl = new Url({
                    shortUrl,
                    originalUrl,
                    createdBy: user.username
                });
                await newUrl.save();
                console.log(`Short URL created: ${shortUrl}`);

            } else if (userChoice === '2') {
                const urls = await Url.find({ createdBy: user.username });
                if (urls.length === 0) {
                    console.log("You have no shortened URLs.");
                } else {
                    urls.forEach(i => {
                        console.log(`Short: ${i.shortUrl}\nOriginal: ${i.originalUrl}\n`);
                    });
                }

            }else if (userChoice === '3'){
                console.log(`\n--- Your Info ---`);
                console.log(`Username: ${user.username}`);
                console.log(`Password: ${user.password}`);
                console.log(`Token: ${user.token}\n`);
            }
            else if (userChoice === '4'){
                const currentPassword = readline.question("Enter current password: ");
                if (currentPassword !== user.password) {
                    console.log("Wrong current password!!!!!!");
                } else {
                    const newPassword = readline.question("Enter new password: ");
                    user.password = newPassword;
                    await user.save();
                    console.log("Password updated successfully!!!!!!!!!!!");
                }
            }
             else if (userChoice === '5') {
                console.log("Exiting");
                await mainMenu();
                break;
            } else {
                console.log("Wrong choice please try again!!!!");
            }
        }

    } else if (choice === '3') {
        const urls = await Url.find();
        console.log("\n--- All Shortened URLs ---");
        urls.forEach(i => {
            console.log(`User: ${i.createdBy}\nShort: ${i.shortUrl}\nOriginal: ${i.originalUrl}\n`);
        });
        await mainMenu();

    } else if (choice === '4') {
        console.log("Exiting");
        process.exit(0);

    } else {
        console.log("Wrong choice please try again!!!!");
        await mainMenu();
    }
}

mainMenu();

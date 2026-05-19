require('dotenv').config()

const express =require("express")
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const User = require('./models/userModel');
const RefreshToken = require('./models/refreshTokenModel')

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
    origin: ['http://client:3000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());

app.use(express.json())

//controller and routes:
//get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}); 
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//create new user
app.post('/api/users', async (req, res) => {
    try {
        console.log("Backend received body:", req.body)
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        //create hashed password
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        await User.create({username: req.body.username,
            email: req.body.email,
            role: req.body.role, 
            password: hashedPassword});
        res.status(201).send()
    } catch {
        console.error("DATABASE REGISTRATION ERROR:", error);
        res.status(400).json({ message: error.message });
    }
})

//takes refresh token and create a new access token
app.post('/api/users/token', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    // 1. Check if token was provided in the request
    if (refreshToken == null) return res.sendStatus(401);
    try {
        // 2. Check if the token exists in the Database
        const savedToken = await RefreshToken.findOne({ token: refreshToken });
        // If findOne returns null, the token is invalid or has been revoked (logged out)
        if (!savedToken) return res.sendStatus(403);
        // 3. Verify the JWT signature
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            // 4. Generate new access token
            // Note: Use user.name or user.userId depending on what you stored in the payload
            const accessToken = generateAccessToken({ name: user.name });
            res.json({ accessToken });
        });
    } catch (error) {
        // Handle database connection errors
        res.sendStatus(500);
    }
});

//delete refresh token of currently logged in user
app.delete('/api/users/logout', async (req, res) => {
    try {
        // 1. Extract the token from the request body
        const refreshToken = req.body.refreshToken;
        // 2. Remove the token from the database
        // This ensures the token can no longer be used to generate new access tokens
        await RefreshToken.deleteOne({ token: refreshToken });
        // 3. Send 204 (No Content) which is the standard for successful deletion
        res.sendStatus(204);
    } catch (error) {
        // Handle database errors
        res.status(500).json({ message: "Error during logout" });
    }
});

//create access token and refresh token, as well as save the refresh token to db
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Find the user by email in the USER collection
        const user = await User.findOne({ email: email });
        if (user == null) {
            return res.status(400).send('Cannot find the user');
        }
        // 2. Compare the plain password with the hashed password in DB
        // bcrypt.compare(plaintext, hash)
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // 3. Create payload (usually using the user's ID or unique name)
            const payload = { name: user.username, id: user._id };
            // 4. Generate tokens
            const accessToken = generateAccessToken(payload);
            const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
            // 5. Save Refresh Token to its own collection
            await RefreshToken.create({ 
                token: refreshToken, 
                userId: user._id 
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 *1000
            })
            res.json({ accessToken, "role": user.role});
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
}

//connect to db
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    //listen for requests
    app.listen(process.env.PORT, () => {
        console.log('connected to db and listening on port ', process.env.PORT)
    })
})
.catch((error) => {
    console.log(error)
})
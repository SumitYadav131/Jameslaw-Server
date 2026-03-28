import express from "express";
import connectDB from "./db.js";
import { registerUser, checkUser, loginUser, verifyEmail, updateProfile, updateProfilepass, registerSubscription } from "./controllers/userController.js"
import cors from "cors";
import { authMiddleware } from "./controllers/middleware/middleware.js";

const app = express();

connectDB();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
    res.send('server is running');
})

app.post('/check', checkUser);

app.post('/register', registerUser);

app.get('/verify-email', verifyEmail);

app.post('/login', loginUser);

app.put('/update-profile', updateProfile);

app.put('/updateprofilepass', updateProfilepass);

app.post('/subscribeplan', authMiddleware, registerSubscription);



const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
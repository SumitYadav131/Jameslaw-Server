import express from "express";
import connectDB from "./db.js";
import { registerUser, checkUser, loginUser, verifyEmail, updateProfile, updateProfilepass, getProfileDetails } from "./controllers/userController.js"
import cors from "cors";
import { authMiddleware } from "./controllers/middleware/middleware.js";
import { registerSubscription, getSubscription, cancelSubscription } from "./controllers/subscriptionController.js"
import { createCheckoutSession, createPaymentIntent } from "./controllers/paymentController.js";

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

app.get('/getallmembership', authMiddleware, getSubscription);

app.get('/myprofiledetails', authMiddleware, getProfileDetails);

app.put('/cancelplan', authMiddleware, cancelSubscription);

app.post('/create-checkout-session', authMiddleware, createCheckoutSession);

app.post('/createPaymentIntent', authMiddleware, createPaymentIntent);

// app.post('/stripe-webhook', express.raw({ type: "application/json" }), stripeWebhook);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
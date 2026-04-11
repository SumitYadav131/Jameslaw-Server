import express from "express";
import connectDB from "./db.js";
import cors from "cors";
import { registerUser, checkUser, loginUser, verifyEmail, updateProfile, updateProfilepass, getProfileDetails, resetPassword, forgotPassword, verifyOtp, getAllUsers } from "./controllers/userController.js"
import { authMiddleware } from "./controllers/middleware/middleware.js";
import { registerSubscription, getSubscription, cancelSubscription } from "./controllers/subscriptionController.js"
import { createCheckoutSession, createPaymentIntent } from "./controllers/paymentController.js";
import { registerBeneficiary, getBeneficiaries, deleteBeneficiary, updateBeneficiary } from "./controllers/beneficiaryController.js";
import { uploadMiddleware } from "./controllers/middleware/middleware.js";
import { uploadDocument, getDocuments, deleteDocument } from "./controllers/documentController.js";
import { upload } from "./controllers/middleware/upload.js";

const app = express();

connectDB();

app.use(express.json());

app.use(cors());

app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => {
    res.send('server is running');
})

app.post('/check', checkUser);

app.post('/register', registerUser);

app.get('/getallusers', getAllUsers);

app.get('/verify-email', verifyEmail);

app.post('/login', loginUser);

app.post('/verifyloginotp', verifyOtp);

app.put('/update-profile', updateProfile);

app.put('/updateprofilepass', updateProfilepass);

app.post('/subscribeplan', authMiddleware, registerSubscription);

app.get('/getallmembership', authMiddleware, getSubscription);

app.get('/myprofiledetails', authMiddleware, getProfileDetails);

app.put('/cancelplan', authMiddleware, cancelSubscription);

app.post('/create-checkout-session', authMiddleware, createCheckoutSession);

app.post('/createPaymentIntent', authMiddleware, createPaymentIntent);

app.post('/registerbeneficiary', authMiddleware, registerBeneficiary);

// app.post('/stripe-webhook', express.raw({ type: "application/json" }), stripeWebhook);

app.post('/uploadFile', authMiddleware, upload.single("file"), uploadMiddleware, uploadDocument);

app.get('/mydocuments', authMiddleware, getDocuments);

app.get('/mybeneficiaries', authMiddleware, getBeneficiaries);

app.delete('/deletebeneficiary/:id', authMiddleware, deleteBeneficiary);

app.delete('/deletedocument/:id', authMiddleware, deleteDocument);

app.put('/updatebeneficiary/:id', authMiddleware, updateBeneficiary);

app.post('/forgotpassword', forgotPassword);

app.post('/resetpassword/:token', resetPassword);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})
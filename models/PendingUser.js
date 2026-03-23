import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    streetaddress: { type: String, required: true },
    dob: { type: Date, required: true },
    verifyToken: String,
    verifyTokenExpiry: Date

}, { timestamps: true });

export default mongoose.model("PendingUser", pendingUserSchema);


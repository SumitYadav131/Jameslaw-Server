import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    streetaddress: { type: String, required: true },
    dob: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    // Otp stored temporary
    otp: { type: String },
    otpExpire: { type: Date },
    role: {
        type: String,
        enum: ["user", "beneficiary", "admin"],
        default: "user"
    },
    // For beneficiary
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }



}, { timestamps: true });

export default mongoose.model("User", userSchema);
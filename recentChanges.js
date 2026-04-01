// middleware 

import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });

    }
}



// ugser model :


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
    dob: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },

    role: {
        type: String,
        enum: ["user", "beneficiary"],
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
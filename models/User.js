import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    country: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    streetaddress: { type: String },
    dob: { type: Date },
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
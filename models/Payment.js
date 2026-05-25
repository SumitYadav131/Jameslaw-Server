import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
        },

        email: {
            type: String,
        },

        // payment ID
        stripePaymentIntentId: {
            type: String,
            required: true,
        },

        amount: {
            type: Number, // in cents
            required: true,
        },

        currency: {
            type: String,
            default: "usd",
        },

        paymentType: {
            type: String, // one-time / subscription
            default: "one-time",
        },

        plan: {
            type: String, // lifetime / monthly etc
            default: "lifetime",
        },

        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },

        paymentMethod: {
            type: String, // card, upi etc
            default: "card",
        },

        platform: {
            type: String,
            default: "web",
        },
    },
    { timestamps: true }

);

export default mongoose.model("Payment", paymentSchema);